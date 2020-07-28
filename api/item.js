const joi = require('@hapi/joi')

module.exports = (itemLoader, Config, Logger, ItemFactory) => {
  const itemSchema = joi.object({
    id: joi.string()
      .min(1)
      .max(30)
      .trim()
      .regex(/\s/, { invert: true })
      .required(),

    name: joi.string()
      .min(1)
      .trim()
      .required(),

    description: joi.string()
      .min(1)
      .trim()
      .required(),

    roomDesc: joi.string()
      .min(1)
      .trim()
      .required(),
  })

  const validateAreaId = (request) => {
    if (request.params.area.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Area id: ${request.params.area}`
      }
    }
  }

  const validateItemId = (request) => {
    if (request.params.id.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Item id: ${request.params.id}`
      }
    }
  }

  const itemDataNotFound = (request) => {
    return {
      ok: false,
      message: `No item data for Area [${request.params.area}] was found.`
    }
  }

  const itemNotFound = (request) => {
    return {
      ok: false,
      message: `Item [${request.params.id}] in Area [${request.params.area}] was not found.`
    }
  }

  return [
    // GET all Items in an Area
    {
      method: 'GET',
      path: '/item/{area}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await itemLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return itemDataNotFound(request)
        } else {
          return fetch.item
        }
      }
    },

    // GET Item in an Area by id
    {
      method: 'GET',
      path: '/item/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await itemLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return itemDataNotFound(request)
        } else {
          const invalid = validateItemId(request)
          if (invalid) return invalid

          for (const item of fetch.item) {
            if (item.id === request.params.id) {
              return item
            }
          }
          return itemNotFound(request)
        }
      }
    },

    // PUT Item in Area by id
    {
      method: 'PUT',
      path: '/item/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const { error, value } = itemSchema.validate({
          id: request.params.id,
          name: request.payload.name,
          description: request.payload.description,
          roomDesc: request.payload.roomDesc
        })

        if (!error) {
          const fetch = await itemLoader.fetch(request.params.area)
          const payload = { id: request.params.id, ...request.payload }

          // add new item to live factory
          ItemFactory.setDefinition(ItemFactory.createEntityRef(request.params.area, request.params.id), payload)

          // IF ITEM DATA FOR AREA DOES NOT EXIST, INITIALIZE IT WITH NEW ITEM
          if (fetch.status === 404) {
            await itemLoader.update(request.params.area, {
              _id: request.params.area,
              item: [payload]
            })

            Logger.log(`ZPANEL: Item [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await itemLoader.fetch(request.params.area)
            return final.item
          } else {
            // OTHERWISE, UPDATE PRE-EXISTING ITEM IN ROOM DATA
            for (const item of fetch.item) {
              if (item.id === request.params.id) {
                await itemLoader.update(request.params.area, { item: [...fetch.item.filter(item => item.id !== request.params.id), payload] })

                Logger.log(`ZPANEL: Item [${request.params.id}] was updated by ${request.auth.credentials} in Area [${request.params.area}]`)

                const final = await itemLoader.fetch(request.params.area)
                return final.item
              }
            }

            // OTHERWISE, ADD NEW ITEM TO ITEM DATA
            await itemLoader.update(request.params.area, { item: [...fetch.item, value] })

            Logger.log(`ZPANEL: Item [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await itemLoader.fetch(request.params.area)
            return final.item
          }
        } else {
          return error.details[0]
        }
      }
    },

    // DELETE Item in Area by id
    {
      method: 'DELETE',
      path: '/item/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await itemLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return itemDataNotFound(request)
        } else {
          const invalid = validateItemId(request)
          if (invalid) return invalid

          // DELETE ITEM FROM ITEM DATA
          for (const item of fetch.item) {
            if (item.id === request.params.id) {
              await itemLoader.update(request.params.area, { item: fetch.item.filter(item => item.id !== request.params.id) })
              Logger.log(`ZPANEL: Item [${request.params.id}] in Area [${request.params.area}] was deleted by ${request.auth.credentials}`)
              return {
                ok: true,
                message: `Item [${request.params.id}] in Area [${request.params.area}] was deleted.`
              }
            }
          }

          return itemNotFound(request)
        }
      }
    }
  ]
}
