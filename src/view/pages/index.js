const { List, ListItem, Icon, Card } = require('construct-ui')

export default class IndexPage {
  view () {
    // check if showing extension list
    let extensions
    if (Object.keys(window.$zp.extJsx()).length > 0) {
      extensions = (<h4>Extensions</h4>)
    }

    return (
      <div class="index-page">
        <p>What would you like to do?</p>
        <Card>
          <List>
            <h4>Core</h4>
            <ListItem
              label="Edit Entities"
              contentLeft={<Icon name="box"/>}
              onclick={() => {
                m.route.set('/area')
              }}
            />
            {extensions}
            {Object.keys(window.$zp.extJsx()).map((value, index) => {
              return (
                window.$zp.extJsx()[value]
              )
            })}
          </List>
        </Card>
      </div>
    )
  }
}
