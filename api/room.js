const joi = require('@hapi/joi')

module.exports = (roomLoader, Config, Logger, RoomFactory, state) => {
  const roomSchema = joi.object({
    id: joi.string()
      .min(1)
      .max(30)
      .trim()
      .regex(/\s/, { invert: true })
      .required(),

    title: joi.string()
      .min(1)
      .trim()
      .required(),

    description: joi.string()
      .min(1)
      .trim()
      .required(),

    defaultItems: joi.array(),

    defaultNpcs: joi.array(),

    metadata: joi.object()
  })

  const validateAreaId = (request) => {
    if (request.params.area.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Area id: ${request.params.area}`
      }
    }
  }

  const validateRoomId = (request) => {
    if (request.params.id.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Room id: ${request.params.id}`
      }
    }
  }

  const roomDataNotFound = (request) => {
    return {
      ok: false,
      message: `No room data for Area [${request.params.area}] was found.`
    }
  }

  const roomNotFound = (request) => {
    return {
      ok: false,
      message: `Room [${request.params.id}] in Area [${request.params.area}] was not found.`
    }
  }

  return [
    // GET all Rooms in an Area
    {
      method: 'GET',
      path: '/room/{area}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await roomLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return roomDataNotFound(request)
        } else {
          return fetch.room
        }
      }
    },

    // GET Room in an Area by id
    {
      method: 'GET',
      path: '/room/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await roomLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return roomDataNotFound(request)
        } else {
          const invalid = validateRoomId(request)
          if (invalid) return invalid

          for (const room of fetch.room) {
            if (room.id === request.params.id) {
              return room
            }
          }
          return roomNotFound(request)
        }
      }
    },

    // PUT Room in Area by id
    {
      method: 'PUT',
      path: '/room/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const { error, value } = roomSchema.validate({
          id: request.params.id,
          title: request.payload.title,
          description: request.payload.description,
          defaultItems: request.payload.defaultItems,
          defaultNpcs: request.payload.defaultNpcs,
          metadata: request.payload.metadata
        })

        if (!error) {
          const fetch = await roomLoader.fetch(request.params.area)
          const payload = { id: request.params.id, ...request.payload }

          // add new room to live factory
          RoomFactory.setDefinition(RoomFactory.createEntityRef(request.params.area, request.params.id), payload)

          // IF ROOM DATA FOR AREA DOES NOT EXIST, INITIALIZE IT WITH NEW ROOM
          if (fetch.status === 404) {
            await roomLoader.update(request.params.area, {
              _id: request.params.area,
              room: [payload]
            })

            Logger.log(`ZPANEL: Room [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await roomLoader.fetch(request.params.area)
            return final.room
          } else {
            // OTHERWISE, UPDATE PRE-EXISTING ROOM IN ROOM DATA
            for (const room of fetch.room) {
              if (room.id === request.params.id) {
                await roomLoader.update(request.params.area, { room: [...fetch.room.filter(room => room.id !== request.params.id), payload] })

                Logger.log(`ZPANEL: Room [${request.params.id}] was updated by ${request.auth.credentials} in Area [${request.params.area}]`)

                const final = await roomLoader.fetch(request.params.area)
                return final.room
              }
            }

            // OTHERWISE, ADD NEW ROOM TO ROOM DATA
            await roomLoader.update(request.params.area, { room: [...fetch.room, value] })

            Logger.log(`ZPANEL: Room [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await roomLoader.fetch(request.params.area)
            return final.room
          }
        } else {
          return error.details[0]
        }
      }
    },

    // DELETE Room in Area by id
    {
      method: 'DELETE',
      path: '/room/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await roomLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return roomDataNotFound(request)
        } else {
          const invalid = validateRoomId(request)
          if (invalid) return invalid

          // DELETE ROOM FROM ROOM DATA
          for (const room of fetch.room) {
            if (room.id === request.params.id) {
              await roomLoader.update(request.params.area, { room: fetch.room.filter(room => room.id !== request.params.id) })
              Logger.log(`ZPANEL: Room [${request.params.id}] in Area [${request.params.area}] was deleted by ${request.auth.credentials}`)
              return {
                ok: true,
                message: `Room [${request.params.id}] in Area [${request.params.area}] was deleted.`
              }
            }
          }

          return roomNotFound(request)
        }
      }
    }
  ]
}
