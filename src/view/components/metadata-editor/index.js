import './styles.scss'
const { Button, Form, FormGroup, Input, FormLabel, Icon } = require('construct-ui')

import './styles.scss'

export default class MetdataEditor {
  constructor() {
    this.stream = window.$zp.editor
  }

  getMetadata() {
    const data = this.stream()
    return (data || {}).metadata
  }

  getMetadataEntries() {
    const metadata = this.getMetadata()
    if (!metadata) return []

    // We sort alphabetically by key so that the entries do not shift while editing.
    return [...Object.entries(metadata)].sort((entryA, entryB) => {
      const [keyA] = entryA
      const [keyB] = entryB
      return keyA > keyB ? 1 : -1
    })
  }

  updateMetadata(e, originalKey, originalValue, type) {
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

    this.stream(
      Object.assign(this.stream(), {metadata})
    )
  }

  // TODO: Test this, add delete functionality.
  addEntry () {
    const metadata = this.getMetadata()
    metadata[''] = ''
    this.stream(
      Object.assign(this.stream(), {metadata})
    )
  }

  deleteEntry (key) {
    if (window.confirm('Delete entry?')) {
      const metadata = this.getMetadata()
      delete metadata[key]
      this.stream(
        Object.assign(this.stream(), {metadata})
      )
    }
  }

  view (vnode) {
    const entries = this.getMetadataEntries()
    return (
      <div class="form-holder">
        <div class="metadata-heading-container">
          <h4>Metadata</h4>
          <Button
            label="Add entry"
            iconLeft="plus-circle"
            onclick={e => this.addEntry()}
            rounded
          />
        </div>
        {entries.length && (<ul class="metadata-entries-list">
          {entries.map((entry, i) => {
            const [ key, value ] = entry
            const displayValue = value && typeof value === 'object'
              ? JSON.stringify(value)
              : value
            const keyName = `meta-key-${i}`
            const valueName = `meta-value-${i}`
            return (
              <li class="metadata-entry-list-item">
                <FormGroup>
                  <FormLabel for={keyName}>Key</FormLabel>
                  <Input name={keyName} value={key} oninput={(e) => this.updateMetadata(e, key, value, 'key')}></Input>
                  <FormLabel for={valueName}>Value</FormLabel>
                  <Input name={valueName} value={displayValue} oninput={(e) => this.updateMetadata(e, key, value, 'value')}></Input>
                  <Button
                    class="delete-metadata-button"
                    label="Delete"
                    iconRight="trash-2"
                    intent="negative"
                    onclick={() => this.deleteEntry(key)}
                    size="xs"
                  />
                </FormGroup>
              </li>
            )
          })}
        </ul>)}
      </div>
    )
  }
}
