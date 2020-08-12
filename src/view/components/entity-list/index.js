import './styles.scss'
import DeleteWarning from '../../components/delete-warning'
import BackLink from '../../components/back-link'
const { List, Icon, PopoverMenu, ListItem, MenuItem, Button, Overlay, Spinner } = require('construct-ui')

export default class EntityList {
  constructor (vnode) {
    this.isLoading = true

    this.type = vnode.attrs.type
    this.typeCap = this.type.charAt(0).toUpperCase() + this.type.slice(1)
    this.area = m.route.param('area')

    this.stream = window.$zp[this.type]
    // reset the entity list stream for this type
    this.stream(undefined)

    // initialize ID for delete warning
    this.idToDelete = null
  }

  oninit (vnode) {
    if (this.type !== 'area') {
      m.request({
        method: 'GET',
        url: `/api/${this.type}/${this.area}`,
      }).then(data => {
        if (data.ok !== false && data.length > 0) {
          this.stream(data)
        }
        this.isLoading = false
      })
    } else {
      m.request({
        method: 'GET',
        url: '/api/area',
      }).then(data => {
        if (data.ok !== false && data.length > 0) {
          this.stream(data)
        }
        this.isLoading = false
      })
    }
  }

  renderList (vnode) {
    if (this.stream() !== undefined) {
      switch (this.type) {
      case 'area': {
        return (
          <List>
            {this.stream().map((value, index) => {
              return (
                <ListItem
                  key={index}
                  label={value._id}
                  onclick={() => {
                    m.route.set(`/area/${value._id}`)
                  }}
                  contentLeft={<Icon name="hexagon"/>}
                  contentRight={<Button iconLeft="book" label="Manifest"
                    onclick={() => {
                      m.route.set(`/area/edit/${value._id}`)
                    }} />}
                />
              )
            })}
          </List>
        )
      }

      default: {
        const icon = () => {
          switch (this.type) {
          case 'room': return 'grid'
          case 'item': return 'triangle'
          case 'npc': return 'users'
          }
        }
        return (<List>
          {this.stream().map((value, index) => {
            return (
              <ListItem
                key={index}
                label={value.id}
                onclick={() => {
                  m.route.set(`/${this.type}/${this.area}/edit/${value.id}`)
                }}
                contentLeft={<Icon name={icon()}/>}
                contentRight={<PopoverMenu
                  closeOnContentClick="true"
                  content={[
                    <MenuItem
                      key="edit"
                      iconLeft="edit"
                      label="Edit"
                      onclick={() => {
                        m.route.set(`/${this.type}/${this.area}/edit/${value.id}`)
                      }}
                    />,
                    <MenuItem
                      key="delete"
                      iconLeft="trash-2"
                      intent="negative"
                      label="Delete"
                      onclick={() => {
                        this.idToDelete = value.id
                        window.$zp.deleteWarning(true)
                      }}
                    />
                  ]}
                  trigger={<Button iconLeft="settings" />}
                />}
              />
            )
          })}
        </List>)
      }
      }
    } else {
      return (<Spinner fill="true" active={this.isLoading}/>)
    }
  }

  renderBackLink () {
    if (this.type !== 'area') {
      return (<BackLink to={`/area/${this.area}`} label={`${this.area}`} />)
    } else {
      return (<BackLink to="/index" label="Home" />)
    }
  }

  view (vnode) {
    return (
      <div class={`entity-list-page ${this.type}`}>
        {this.renderBackLink()}
        <div class="top edit-list">
          <h1>{this.typeCap}s</h1>
          <Button iconLeft="plus" intent="positive" onclick={() => {
            if (this.type === 'area') {
              m.route.set(`/${this.type}/new/`)
            } else {
              m.route.set(`/${this.type}/${this.area}/new/`)
            }
          }} />
        </div>
        {this.renderList(vnode)}
        <Overlay closeOnEscapeKey="true" closeOnOutsideClick="true" hasBackdrop="true"
          content={<DeleteWarning id={this.idToDelete} type={this.type} area={this.area} />}
          isOpen={window.$zp.deleteWarning()}
          onClose={() => {
            window.$zp.deleteWarning(false)
            setTimeout(function () {
              this.idToDelete = null
            }, 1000)
          }}
        />
      </div>
    )
  }
}
