import DeleteWarning from '../components/delete-warning'
import BackLink from '../components/back-link'
const { List, Icon, ListItem, Overlay } = require('construct-ui')

export default class AreaDetailsPage {
  constructor () {
    this.area = m.route.param('id')
    this.type = 'area'
  }

  view () {
    return (
      <div class={`area-details-page entity-list-page ${this.type}`}>
        <BackLink to="/area" label="Areas" />
        <div class="top edit-list">
          <h1>Area: <pre>{this.area}</pre></h1>
        </div>
        <List>
          <ListItem
            contentLeft={<Icon name="book"/>}
            label="Manifest"
            onclick={() => {
              m.route.set(`/area/edit/${this.area}`)
            }}
          />
          <ListItem
            contentLeft={<Icon name="grid"/>}
            label="Rooms"
            onclick={() => {
              m.route.set(`/room/${this.area}`)
            }}
          />
          <ListItem
            contentLeft={<Icon name="triangle"/>}
            label="Items"
            onclick={() => {
              m.route.set(`/item/${this.area}`)
            }}
          />
          <ListItem
            contentLeft={<Icon name="users"/>}
            label="Npcs"
            onclick={() => {
              m.route.set(`/npc/${this.area}`)
            }}
          />
          <ListItem
            contentLeft={<Icon intent="negative" name="trash-2"/>}
            label="Delete"
            onclick={() => {
              this.activeId = this.area
              window.$zp.deleteWarning(true)
            }}
          />
        </List>
        <Overlay closeOnEscapeKey="true" closeOnOutsideClick="true" hasBackdrop="true"
          content={<DeleteWarning id={this.activeId} type={this.type} />}
          isOpen={window.$zp.deleteWarning()}
          onClose={() => {
            window.$zp.deleteWarning(false)
            setTimeout(function () {
              this.activeId = null
            }, 1000)
          }}
        />
      </div>)
  }
}
