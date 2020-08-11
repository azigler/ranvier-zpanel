// import layout
import MainLayout from './components/main-layout'

// import splash loader
import Splash from './components/splash-loader'

// import routes
import LoginPage from './pages/login'
import IndexPage from './pages/'
import AreaPage from './pages/area'
import AreaDetailsPage from './pages/area-details'
import EditAreaPage from './pages/edit-area'
import ItemPage from './pages/item'
import EditItemPage from './pages/edit-item'
import NpcPage from './pages/npc'
import EditNpcPage from './pages/edit-npc'
import RoomPage from './pages/room'
import EditRoomPage from './pages/edit-room'
import EditSharedGrammarPage from './pages/edit-shared-grammar'

// initialize data
const stream = require('mithril/stream')
window.$zp = {
  username: stream(),
  area: stream(),
  room: stream(),
  item: stream(),
  npc: stream(),
  deleteWarning: stream(false),
  bundles: stream([]),
  editor: stream(),
  extJsx: stream({}),
  grammar: stream()
}

// helper functions for splash loader
function showLoader () {
  let $splashDiv = document.getElementById('splash')
  if (!$splashDiv) {
    $splashDiv = document.createElement('div')
    $splashDiv.setAttribute('id', 'splash')
    const $root = document.body.querySelector('#root')
    $root.appendChild($splashDiv)
  }
  m.render($splashDiv, m(Splash))
}
function hideLoader () {
  const $splashDiv = document.getElementById('splash')
  if ($splashDiv) {
    m.render($splashDiv, null)
  }
}

// helper functions for RouteResolver
function onmatch () {
  // show splash loader until the promise has been resolved or rejected
  showLoader()
  return new Promise((resolve, reject) => {
    // validate the user's cookie
    m.request({
      method: 'POST',
      url: '/api/validate-cookie',
    }).then(data => {
      if (data.ok) {
        window.$zp.username(data.username)
        setTimeout(function () {
          resolve()
        }, 500)
      } else {
        // redirect to login if cookie is invalid
        m.route.set('/login')
      }
    })
  })
}
function render (vnode, rendered) {
  if (typeof vnode.tag === 'function') {
    return vnode
  }
  setTimeout(function () {
    hideLoader()
  }, 1200)
  return rendered
}

const Routes = {
  '/login': {
    render (vnode) {
      return render(vnode, m(LoginPage))
    },
  },
  '/index': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(IndexPage)))
    },
  },
  '/area': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(AreaPage)))
    },
  },
  '/area/new': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditAreaPage)))
    },
  },
  '/area/:id': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(AreaDetailsPage)))
    },
  },
  '/area/edit/:id': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditAreaPage)))
    },
  },
  '/item/:area': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(ItemPage)))
    },
  },
  '/item/:area/new': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditItemPage)))
    },
  },
  '/item/:area/edit/:id': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditItemPage)))
    },
  },
  '/npc/:area': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(NpcPage)))
    },
  },
  '/npc/:area/new': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditNpcPage)))
    },
  },
  '/npc/:area/edit/:id': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditNpcPage)))
    },
  },
  '/room/:area': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(RoomPage)))
    },
  },
  '/room/:area/new': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditRoomPage)))
    },
  },
  '/room/:area/edit/': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditRoomPage)))
    },
  },
  '/room/:area/edit/:id': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditRoomPage)))
    },
  },
  '/grammar': {
    onmatch,
    render (vnode) {
      return render(vnode, m(MainLayout, m(EditSharedGrammarPage)))
    },
  },
}

const DefaultRoute = '/index'

export { Routes, DefaultRoute }
