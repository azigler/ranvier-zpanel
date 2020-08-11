import BackLink from '../components/back-link'
import GrammarEditor from '../components/grammar-editor'

export default class SharedGrammarEditorPage {
  view () {
    return (
      <div class="shared-grammar-page">
        <BackLink to="/index" label="Home" />
        <div class="top">
          <h1>Shared Grammar</h1>
        </div>
        <GrammarEditor type="shared" />
      </div>
    )
  }
}
