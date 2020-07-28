import './styles.scss'
const { Button } = require('construct-ui')

export default class MainLayout {
  constructor () {
    this.isLoading = false

    // load bundles if missing
    if (window.$zp.bundles() === undefined) {
      m.request({
        method: 'GET',
        url: '/api/bundles',
      }).then(data => {
        window.$zp.bundles(data)
      })
    }
    // load areas if missing
    if (window.$zp.area() === undefined) {
      m.request({
        method: 'GET',
        url: '/api/area',
      }).then(data => {
        window.$zp.area(data)
      })
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
