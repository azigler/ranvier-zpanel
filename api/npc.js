const joi = require('@hapi/joi')

module.exports = (npcLoader, Config, Logger, MobFactory) => {
  const npcSchema = joi.object({
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

    prototype: joi.string()
      .min(1)
      .trim(),

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

  const validateNpcId = (request) => {
    if (request.params.id.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Npc id: ${request.params.id}`
      }
    }
  }

  const npcDataNotFound = (request) => {
    return {
      ok: false,
      message: `No Npc data for Area [${request.params.area}] was found.`
    }
  }

  const npcNotFound = (request) => {
    return {
      ok: false,
      message: `Npc [${request.params.id}] in Area [${request.params.area}] was not found.`
    }
  }

  return [
    // GET all Npcs in an Area
    {
      method: 'GET',
      path: '/npc/{area}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await npcLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return npcDataNotFound(request)
        } else {
          return fetch.npc
        }
      }
    },

    // GET Npc in an Area by id
    {
      method: 'GET',
      path: '/npc/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await npcLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return npcDataNotFound(request)
        } else {
          const invalid = validateNpcId(request)
          if (invalid) return invalid

          for (const npc of fetch.npc) {
            if (npc.id === request.params.id) {
              return npc
            }
          }
          return npcNotFound(request)
        }
      }
    },

    // PUT Npc in Area by id
    {
      method: 'PUT',
      path: '/npc/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const { error, value } = npcSchema.validate({
          id: request.params.id,
          name: request.payload.name,
          description: request.payload.description,
          prototype: request.payload.prototype,
          metadata: request.payload.metadata
        })

        if (!error) {
          const fetch = await npcLoader.fetch(request.params.area)
          const payload = { id: request.params.id, ...request.payload }

          // add new Npc to live factory
          MobFactory.setDefinition(MobFactory.createEntityRef(request.params.area, request.params.id), payload)

          // IF NPC DATA FOR AREA DOES NOT EXIST, INITIALIZE IT WITH NEW NPC
          if (fetch.status === 404) {
            await npcLoader.update(request.params.area, {
              _id: request.params.area,
              npc: [payload]
            })

            Logger.log(`ZPANEL: Npc [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await npcLoader.fetch(request.params.area)
            return final.npc
          } else {
            // OTHERWISE, UPDATE PRE-EXISTING NPC IN ROOM DATA
            for (const npc of fetch.npc) {
              if (npc.id === request.params.id) {
                await npcLoader.update(request.params.area, { npc: [...fetch.npc.filter(npc => npc.id !== request.params.id), payload] })

                Logger.log(`ZPANEL: Npc [${request.params.id}] was updated by ${request.auth.credentials} in Area [${request.params.area}]`)

                const final = await npcLoader.fetch(request.params.area)
                return final.npc
              }
            }

            // OTHERWISE, ADD NEW NPC TO NPC DATA
            await npcLoader.update(request.params.area, { npc: [...fetch.npc, value] })

            Logger.log(`ZPANEL: Npc [${request.params.id}] was created by ${request.auth.credentials} in Area [${request.params.area}]`)

            const final = await npcLoader.fetch(request.params.area)
            return final.npc
          }
        } else {
          return error.details[0]
        }
      }
    },

    // DELETE Npc in Area by id
    {
      method: 'DELETE',
      path: '/npc/{area}/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await npcLoader.fetch(request.params.area)

        if (fetch.status === 404) {
          return npcDataNotFound(request)
        } else {
          const invalid = validateNpcId(request)
          if (invalid) return invalid

          // DELETE NPC FROM NPC DATA
          for (const npc of fetch.npc) {
            if (npc.id === request.params.id) {
              await npcLoader.update(request.params.area, { npc: fetch.npc.filter(npc => npc.id !== request.params.id) })
              Logger.log(`ZPANEL: Npc [${request.params.id}] in Area [${request.params.area}] was deleted by ${request.auth.credentials}`)
              return {
                ok: true,
                message: `Npc [${request.params.id}] in Area [${request.params.area}] was deleted.`
              }
            }
          }

          return npcNotFound(request)
        }
      }
    }
  ]
}
