import './styles.scss'
const { Button, Card } = require('construct-ui')

export default class DeleteWarning {
  view (vnode) {
    return (
      <Card class="delete-warning">
        <p>Click the button below to delete the <pre>{vnode.attrs.id}</pre> {vnode.attrs.type}. Click anywhere else to exit.</p>
        <Button label="Delete" fluid="true" intent="negative" onclick={() => {
          window.$zp.deleteWarning(false)
          if (vnode.attrs.area) {
            m.request({
              method: 'DELETE',
              url: `/api/${vnode.attrs.type}/${vnode.attrs.area}/${vnode.attrs.id}`,
            }).then(data => {
              if (data.ok) {
                m.request({
                  method: 'GET',
                  url: `/api/${vnode.attrs.type}/${vnode.attrs.area}`,
                }).then(data => {
                  if (data.length) {
                    window.$zp[vnode.attrs.type](data)
                  } else {
                    window.$zp[vnode.attrs.type](undefined)
                  }
                })
              }
            })
          } else {
            m.request({
              method: 'DELETE',
              url: `/api/${vnode.attrs.type}/${vnode.attrs.id}`,
            }).then(data => {
              if (data.ok) {
                m.request({
                  method: 'GET',
                  url: `/api/${vnode.attrs.type}`,
                }).then(data => {
                  if (data.length) {
                    window.$zp[vnode.attrs.type](data)
                  } else {
                    window.$zp[vnode.attrs.type](undefined)
                  }
                  m.route.set('/area')
                })
              }
            })
          }
        }}
        />
      </Card>
    )
  }
}
