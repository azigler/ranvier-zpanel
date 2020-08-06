import './styles.scss'
const { Icon } = require('construct-ui')

export default class MetdataEditor {
  view (vnode) {
    console.log({vnode})
    return (
      <div class="form-holder metadata">
        <h4>Metadata</h4>
        <Icon name="plus-circle"/><p>Add entry</p>
      </div>
    )
  }
}
