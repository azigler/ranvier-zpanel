const { Button } = require('construct-ui')

export default class IndexPage {
  view () {
    return (
      <div class="index-page">
        <p>What would you like to do?</p>
        <Button label="Edit Entities" iconLeft="tool"
          onclick={() => {
            m.route.set('/area')
          }} />
      </div>
    )
  }
}
