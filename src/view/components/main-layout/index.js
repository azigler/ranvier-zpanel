import './styles.scss'
const { Button, ListItem, Icon } = require('construct-ui')

export default class MainLayout {
  constructor () {
    this.isLoading = false
  }

  oninit () {
    // load bundles
    m.request({
      method: 'GET',
      url: '/api/bundles',
    }).then(data => {
      window.$zp.bundles(data)

      // get zPanel extension names
      this.ext = {
        tracery: window.$zp.bundles().includes('ranvier-tracery')
      }

      this.renderExtensions()
    })

    // load areas
    m.request({
      method: 'GET',
      url: '/api/area',
    }).then(data => {
      window.$zp.area(data)
    })
  }

  renderExtensions () {
    for (const ext in this.ext) {
      switch (ext) {
      case 'tracery' : {
        if (this.ext.tracery === false) return
        window.$zp.extJsx(Object.assign(window.$zp.extJsx(), {
          tracery: (<ListItem label="Edit Shared Grammar" contentLeft={<Icon name="book-open"/>}
            onclick={() => {
              m.route.set('/grammar')
            }} />)
        }))
        break
      }
      }
    }
  }

  view (vnode) {
    return (
      <div class="main-layout">
        <div class="top">
          <div class="username">Welcome, {window.$zp.username()}!</div>
          <Button label="Log out" loading={this.isLoading} onclick={() => {
            this.isLoading = true
            m.request({
              method: 'POST',
              url: '/api/logout'
            }).then(data => {
              if (data.ok === true) {
                setTimeout(function () {
                  m.route.set('/login')
                  window.$zp.username(undefined)
                }, 500)
              }
            })
          }}/>
        </div>
        {vnode.children}
      </div>
    )
  }
}
