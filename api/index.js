const area = require('./area')
const room = require('./room')
const item = require('./item')
const npc = require('./npc')

module.exports = (state, Config, Logger) => {
  // initialize entity loaders for API
  const loaderRegistry = state.EntityLoaderRegistry
  const areaLoader = loaderRegistry.get('areas')
  const roomLoader = loaderRegistry.get('rooms')
  const itemLoader = loaderRegistry.get('items')
  const npcLoader = loaderRegistry.get('npcs')

  // load routes
  const routes = [].concat(
    area(areaLoader, Config, Logger, state.AreaFactory),
    room(roomLoader, Config, Logger, state.RoomFactory, state),
    item(itemLoader, Config, Logger, state.ItemFactory),
    npc(npcLoader, Config, Logger, state.MobFactory)
  )

  // export hapi plugin
  return {
    name: 'api',
    register: async function (server, options) {
      server.route([
        ...routes,
        // GET unauthenticated request
        {
          method: 'GET',
          path: '/unauthenticated',
          handler: async function (request, h) {
            return {
              ok: false,
              message: 'Unauthenticated request was denied.'
            }
          },
          options: {
            auth: false
          }
        },

        // POST log in
        {
          method: 'POST',
          path: '/login',
          handler: async function (request, h) {
            let { username, password } = request.payload

            if (username.length > 0) {
              username = username.toLowerCase()
              username = username[0].toUpperCase() + username.slice(1)

              let account = null
              try {
                account = await state.AccountManager.loadAccount(username)
              } catch (e) {
                Logger.error(e.message)
              }

              if (account.username === undefined) {
                return {
                  ok: false,
                  message: 'Invalid credentials.'
                }
              }

              if (account &&
                account.checkPassword(password) &&
                account.metadata.zPanel
              ) {
                request.cookieAuth.set({ id: account.username })

                return {
                  ok: true,
                  username: account.username,
                  message: `Welcome, ${username}!`
                }
              } else {
                return {
                  ok: false,
                  message: 'Invalid credentials.'
                }
              }
            } else {
              return {
                ok: false,
                message: 'Invalid credentials.'
              }
            }
          },
          options: {
            auth: false
          }
        },

        // POST log out
        {
          method: 'POST',
          path: '/logout',
          handler: async function (request, h) {
            request.cookieAuth.clear()
            return {
              ok: true,
              username: request.auth.credentials,
              message: `Goodbye, ${request.auth.credentials}!`
            }
          }
        },

        // POST validate cookie
        {
          method: 'POST',
          path: '/validate-cookie',
          handler: async function (request, h) {
            if (request.auth.credentials) {
              return {
                ok: true,
                username: request.auth.credentials
              }
            } else {
              return {
                ok: false
              }
            }
          }
        },

        // GET all bundles
        {
          method: 'GET',
          path: '/bundles',
          handler: async function (request, h) {
            if (request.auth.credentials) {
              return Config.get('bundles')
            } else {
              return {
                ok: false
              }
            }
          }
        }
      ])
    }
  }
}
