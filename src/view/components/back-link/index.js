import './styles.scss'
const { Icon } = require('construct-ui')

export default class BackLink {
  view (vnode) {
    return (
      <div class="back-link" onclick={() => {
        m.route.set(vnode.attrs.to)
      }}>
        <Icon name="arrow-left"/>Back to {vnode.attrs.label}
      </div>
    )
  }
}
