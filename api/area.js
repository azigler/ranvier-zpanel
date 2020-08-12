const joi = require('@hapi/joi')

module.exports = (areaLoader, Config, Logger, AreaFactory) => {
  const bundles = Config.get('bundles')

  const areaSchema = joi.object({
    _id: joi.string()
      .min(1)
      .max(30)
      .trim()
      .regex(/\s/, { invert: true })
      .required(),

    title: joi.string()
      .min(1)
      .trim()
      .required(),

    bundle: joi.string()
      .min(1)
      .trim()
      .regex(/\s/, { invert: true })
      .required(),

    metadata: joi.object()
  })

  const validateAreaId = (request) => {
    if (request.params.id.match(/\s/)) {
      return {
        ok: false,
        message: `Invalid Area id: ${request.params.id}`
      }
    }
  }

  const areaNotFound = (request) => {
    return {
      ok: false,
      message: `Area [${request.params.id}] was not found.`
    }
  }

  return [
    // GET all Areas
    {
      method: 'GET',
      path: '/area',
      handler: async function (request, h) {
        const results = []

        for (const bundle of bundles) {
          areaLoader.setBundle(bundle)
          const areas = await areaLoader.fetchAll()
          for (const area in areas) {
            results.push(areas[area].doc)
          }
        }

        return results
      }
    },

    // GET Area by id
    {
      method: 'GET',
      path: '/area/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await areaLoader.fetch(request.params.id)

        if (fetch.status === 404) {
          return areaNotFound(request)
        } else {
          return fetch
        }
      }
    },

    // PUT Area by id
    {
      method: 'PUT',
      path: '/area/{id}',
      handler: async function (request, h) {
        const { error, value } = areaSchema.validate({
          _id: request.params.id,
          title: request.payload.title,
          bundle: request.payload.bundle,
          metadata: request.payload.metadata
        })

        if (!error) {
          // add new area to live factory
          AreaFactory.setDefinition(request.params.id, value)

          await areaLoader.update(value._id, value)
          Logger.log(`ZPANEL: Area [${value._id}] was updated by ${request.auth.credentials}`)
          return await areaLoader.fetch(value._id)
        } else {
          return error.details[0]
        }
      }
    },

    // DELETE Area by id
    {
      method: 'DELETE',
      path: '/area/{id}',
      handler: async function (request, h) {
        const invalid = validateAreaId(request)
        if (invalid) return invalid

        const fetch = await areaLoader.delete(request.params.id)
        if (fetch.status === 404) {
          return areaNotFound(request)
        } else {
          Logger.log(`ZPANEL: Area [${request.params.id}] was deleted by ${request.auth.credentials}`)
          return {
            ok: true,
            message: `Area [${request.params.id}] was deleted.`
          }
        }
      }
    }
  ]
}
