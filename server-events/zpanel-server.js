require('dotenv').config()

const path = require('path')
const exec = require('child_process').exec
const hapi = require('@hapi/hapi')

const { Logger, Config } = require('ranvier')

const { url = 'localhost', port = 4335 } = Config.get('zPanel')

const cookieUsername = process.env.ZPANEL_COOKIE_UN || 'zpanel'
const cookiePassword = process.env.ZPANEL_COOKIE_PW || 'ranvier-zpanel-hapi-authentication-cookie'
const cookieTtlDays = process.env.ZPANEL_COOKIE_TTL_DAYS || 1

module.exports = {
  listeners: {
    startup: state => function (commander) {
      // build the Mithril app
      const cmd = exec(`cd ${__dirname}/.. && npm run build`)
      Logger.log('Now building zPanel...')
      cmd.stdout.on('data', function (data) {
        if (data.includes('ERROR')) {
          console.log(data)
          Logger.error('zPanel failed to build')
        } else if (data.includes('hidden modules')) {
          Logger.log('Finished building zPanel')
        }
      })

      // initialize the server
      const init = async () => {
        const server = hapi.server({
          port,
          host: url,
          router: {
            stripTrailingSlash: true
          }
        })

        // mount the Mithril app
        await server.register(require('@hapi/inert'))
        server.route({
          method: 'GET',
          path: '/{param*}',
          handler: {
            directory: {
              path: path.join(__dirname, '../dist')
            }
          },
          options: {
            auth: false
          }
        })

        // handle 404
        server.ext('onPreResponse', (request, h) => {
          const response = request.response
          if (response.isBoom &&
              response.output.statusCode === 404) {
            return h.redirect('/').code(301)
          }

          return h.continue
        })

        // require authentication
        await server.register(require('@hapi/cookie'))
        server.auth.strategy('session', 'cookie', {
          cookie: {
            name: cookieUsername,
            password: cookiePassword,
            isSecure: false,
            path: '/',
            ttl: 1000 * 60 * 60 * 24 * cookieTtlDays // 1 day * cookieTtlDays
          },
          redirectTo: '/api/unauthenticated',
          validateFunc: async (request, session) => {
            const loaderRegistry = state.EntityLoaderRegistry
            const accountLoader = loaderRegistry.get('accounts')

            const account = Object.keys(await accountLoader.fetchAll()).find(account => account === session.id)

            if (!account) {
              return { valid: false }
            }

            return { valid: true, credentials: session.id }
          }
        })
        server.auth.default('session')

        // initialize the API
        const api = require('./../api')(state, Config, Logger)

        // mount the API
        await server.register(api, {
          routes: {
            prefix: '/api'
          }
        })

        await server.start()
        Logger.log(`Serving zPanel at: http://${url}:${port}...`)
      }

      // start the server
      init()
    },

    shutdown: state => function () {
    },
  },
}
