import './styles.scss'
import merge from 'mergerino'
import GrammarEditor from '../grammar-editor'
const { Button, FormGroup, Input, FormLabel, Card } = require('construct-ui')

export default class MetadataEditor {
  constructor (vnode) {
    this.id = m.route.param('id') || ''
    this.area = m.route.param('area')
    this.stream = window.$zp.editor
    this.isArea = (vnode.attrs.type === 'area')
  }

  getMetadata () {
    const data = this.stream()
    return (data || { metadata: {} }).metadata
  }

  getMetadataEntries () {
    const metadata = this.getMetadata()
    if (!metadata) return []

    // We sort alphabetically by key so that the entries do not shift while editing.
    return [...Object.entries(metadata)].sort((entryA, entryB) => {
      const [keyA] = entryA
      const [keyB] = entryB
      return keyA > keyB ? 1 : -1
    })
  }

  updateMetadata (e, originalKey, originalValue, type) {
    const metadata = this.getMetadata()
    const inputValue = e.target.value

    if (type === 'value') {
      if (inputValue === JSON.stringify(originalValue)) {
        return
      }

      metadata[originalKey] = inputValue
    }

    if (type === 'key') {
      if (inputValue === originalKey) {
        return
      }

      delete metadata[originalKey]
      metadata[inputValue] = originalValue
    }

    this.mergeMetadata(metadata)
  }

  addEntry () {
    const metadata = this.getMetadata()
    metadata[''] = ''
    this.mergeMetadata(metadata)
  }

  deleteEntry (key) {
    if (window.confirm('Delete entry?')) {
      const metadata = this.getMetadata()
      delete metadata[key]
      this.mergeMetadata(metadata)
      if (Object.keys(metadata).filter(prop => prop[0] !== 'grammar').length === 0) {
        this.addEntry()
      }
    }
  }

  mergeMetadata (metadata) {
    this.stream(
      merge(this.stream(), { metadata })
    )
  }

  view (vnode) {
    const entries = this.getMetadataEntries()
    return (
      <div class="metadata-editor">
        <div class="header">
          <h3>Metadata</h3>
          <Button
            iconLeft="plus"
            intent="positive"
            onclick={e => this.addEntry()}
          />
        </div>
        {entries.length && (<ul class="metadata-entries-list">
          {entries.filter(entry => entry[0] !== 'grammar').map((entry, i) => {
            const [key, value] = entry
            const displayValue = value && typeof value === 'object'
              ? JSON.stringify(value)
              : value
            const keyName = `meta-key-${i}`
            const valueName = `meta-value-${i}`
            return (
              <Card key={i}>
                <FormGroup>
                  <FormLabel for={keyName}>Key</FormLabel>
                  <Input name={keyName} value={key} onchange={(e) => this.updateMetadata(e, key, value, 'key')}></Input>
                  <FormLabel for={valueName}>Value</FormLabel>
                  <Input name={valueName} value={displayValue} onchange={(e) => this.updateMetadata(e, key, value, 'value')}></Input>
                  <Button
                    class="delete-metadata-button"
                    iconLeft="trash-2"
                    intent="negative"
                    onclick={() => this.deleteEntry(key)}
                    size="xs"
                  />
                </FormGroup>
              </Card>
            )
          })}
        </ul>)}
        <FormGroup class={`area-${this.isArea}`}>
          <h3 class="grammar-editor-title">Grammar</h3>
          <GrammarEditor type="npc" area={this.area} id={this.id} />
        </FormGroup>
      </div>
    )
  }
}
