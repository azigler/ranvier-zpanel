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
    return [...Object.entries(metadata)].sort((entryA, entryB) => {
      const [keyA] = entryA
      const [keyB] = entryB
      return keyA > keyB ? 1 : -1
    })
  }

  updateMetadata(e, originalKey, originalValue, type) {
    console.log({e})
    const metadata = this.getMetadata()
    const inputValue = e.target.value

    if (type === 'value') {
      if (inputValue === JSON.stringify(originalValue)) {
        console.warn('Input did not change.')
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

    console.log('new ', { metadata })
    this.stream(
      Object.assign(this.stream(), {metadata})
    )
  }

  view (vnode) {
    const entries = this.getMetadataEntries()
    console.log({entries});
    return (
      <div class="form-holder">
        <div class="metadata-heading-container">
          <h4>Metadata</h4>
          <Button 
            label="Add entry"
            icon-left="plus-circle"
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
              <li>
                <FormGroup class="metadata-entry-form-group">
                  <FormLabel for={keyName}>Key</FormLabel>
                  <Input name={keyName} value={key} oninput={(e) => this.updateMetadata(e, key, value, 'key')}></Input>
                  <FormLabel for={valueName}>Value</FormLabel>
                  <Input name={valueName} value={displayValue} oninput={(e) => this.updateMetadata(e, key, value, 'value')}></Input>
                </FormGroup>
              </li>
            )
          })}
        </ul>)}
      </div>
    )
  }
}
