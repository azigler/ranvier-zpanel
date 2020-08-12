import './styles.scss'
import BackLink from '../back-link'
import MetadataEditor from '../metadata-editor'
import merge from 'mergerino'
const { Form, FormGroup, Input, FormLabel, Button, Toaster, Select, TextArea } = require('construct-ui')

export default class EntityEditor {
  constructor (vnode) {
    this.id = m.route.param('id') || ''
    this.area = m.route.param('area')
    this.type = vnode.attrs.type
    this.typeCap = this.type.charAt(0).toUpperCase() + this.type.slice(1)

    this.toaster = new Toaster()

    this.label = 'Edit'
    this.isLoading = true
    this.isNew = false

    if (Array.isArray(window.$zp.bundles()) && window.$zp.bundles().includes('ranvier-tracery')) {
      this.checkTraceryGrammar = true
    }

    this.initializeEditor()
  }

  initializeEditor () {
    switch (this.type) {
    // INITIALIZE EDITOR FOR AREA
    case 'area': {
      window.$zp.editor({
        _id: this.id,
        title: '',
        bundle: 'ranvier-zpanel',
        metadata: {
          "": ""
        }
      })
      this.stream = window.$zp.editor
      this.isLoading = false
      if (this.id.length > 0) {
        this.isNew = false
        m.request({
          method: 'GET',
          url: `/api/area/${this.id}`,
        }).then(data => {
          this.isLoading = false
          this.stream(merge(this.stream(), data))
          console.log('Looking at area data:', this.stream())
        })
      } else {
        console.log('NEW AREA!')
        this.label = 'Create'
        this.isNew = true
      }
      break
    }
    // INITIALIZE EDITOR FOR ITEM
    case 'item': {
      window.$zp.editor({
        id: this.id,
        name: '',
        description: '',
        roomDesc: '',
        metadata: {
          "": ""
        }
      })
      this.stream = window.$zp.editor
      this.isLoading = false
      if (this.id.length > 0) {
        this.isNew = false

        m.request({
          method: 'GET',
          url: `/api/item/${this.area}/${this.id}`,
        }).then(data => {
          this.stream(merge(this.stream(), data))
          console.log('Looking at item data:', this.stream())
        })
      } else {
        console.log('NEW ITEM!')
        this.label = 'Create'
        this.isNew = true
      }
      break
    }
    // INITIALIZE EDITOR FOR NPC
    case 'npc': {
      window.$zp.editor({
        id: this.id,
        name: '',
        description: '',
        metadata: {
          "": ""
        }
      })
      this.stream = window.$zp.editor
      this.isLoading = false
      if (this.id.length > 0) {
        this.isNew = false

        m.request({
          method: 'GET',
          url: `/api/npc/${this.area}/${this.id}`,
        }).then(data => {
          this.stream(merge(this.stream(), data))
          console.log('Looking at npc data:', this.stream())
        })
      } else {
        console.log('NEW NPC!')
        this.label = 'Create'
        this.isNew = true
      }
      break
    }
    // INITIALIZE EDITOR FOR ROOM
    case 'room': {
      window.$zp.editor({
        id: this.id,
        title: '',
        description: '',
        coordinates: [null, null, null],
        items: [],
        npcs: [],
        metadata: {
          "": ""
        }
      })
      this.stream = window.$zp.editor
      this.isLoading = false
      if (this.id.length > 0) {
        this.isNew = false

        m.request({
          method: 'GET',
          url: `/api/room/${this.area}/${this.id}`,
        }).then(data => {
          this.stream(merge(this.stream(), data))
          console.log('Looking at room data:', this.stream())
        })
      } else {
        console.log('NEW ROOM!')
        this.label = 'Create'
        this.isNew = true
      }
    }
    }
  }

  saveEntity (id, data) {
    if (data.metadata[''] !== undefined) {
      delete data.metadata['']
    }

    switch (this.type) {
    // SAVE AREA ENTITY
    case 'area': {
      console.log('saving area', id, 'with data:', data)
      this.isLoading = true
      if (data._id.length === 0 ||
        data.title.length === 0 ||
        data.bundle.length === 0) {
        this.isLoading = false
        return this.toaster.show({
          message: 'All fields are required.',
          intent: 'warning'
        })
      }
      m.request({
        method: 'PUT',
        url: `/api/area/${id}`,
        body: data
      }).then(data1 => {
        this.toaster.show({
          message: 'Save successful.',
          intent: 'positive'
        })
        console.log('area edited:', data1)
        m.request({
          method: 'GET',
          url: '/api/area',
        }).then(data2 => {
          window.$zp.area(data2)
          this.isLoading = false
        })
      })
      if (Object.keys(window.$zp.editor().metadata).length === 0) {
        window.$zp.editor(merge(window.$zp.editor(), {metadata: {"": ""}}))
      }
      break
    }
    // SAVE ITEM ENTITY
    case 'item': {
      console.log('saving item', id, 'with data:', data)
      this.isLoading = true
      if (data.id.length === 0 ||
        data.name.length === 0 ||
        data.description.length === 0 ||
        data.roomDesc.length === 0) {
        this.isLoading = false
        return this.toaster.show({
          message: 'All fields are required.',
          intent: 'warning',
        })
      }
      if (this.checkTraceryGrammar) {
        if (!data.name.match(/!(.*)!/g) ||
            (!data.roomDesc.match(/!(.*)!/g))) {
          this.isLoading = false
          return this.toaster.show({
            message: 'Tracery grammar is enabled, so Name and Room Description fields require the subject to be surrounded by exclamation marks (e.g., !dog!).',
            intent: 'warning',
            timeout: 6000
          })
        }
      }
      m.request({
        method: 'PUT',
        url: `/api/item/${this.area}/${id}`,
        body: data
      }).then(data1 => {
        this.toaster.show({
          message: 'Save successful.',
          intent: 'positive',
        })
        window.$zp.item(data1)
        console.log('item edited :', data1)
        this.isLoading = false
      })
      if (Object.keys(window.$zp.editor().metadata).length === 0) {
        window.$zp.editor(merge(window.$zp.editor(), {metadata: {"": ""}}))
      }
      break
    }
    // SAVE NPC ENTITY
    case 'npc': {
      console.log('saving npc', id, 'with data:', data)
      this.isLoading = true
      if (data.id.length === 0 ||
        data.name.length === 0 ||
        data.description.length === 0) {
        this.isLoading = false
        return this.toaster.show({
          message: 'All fields are required.',
          intent: 'warning',
        })
      }
      if (this.checkTraceryGrammar) {
        if (!data.name.match(/!(.*)!/g)) {
          this.isLoading = false
          return this.toaster.show({
            message: 'Tracery grammar is enabled, so the Name field requires the subject to be surrounded by exclamation marks (e.g., !dog!).',
            intent: 'warning',
            timeout: 6000
          })
        }
      }
      m.request({
        method: 'PUT',
        url: `/api/npc/${this.area}/${id}`,
        body: data
      }).then(data1 => {
        this.toaster.show({
          message: 'Save successful.',
          intent: 'positive',
        })
        console.log('npc edited:', data1)
        window.$zp.npc(data1)
        this.isLoading = false
      })
      if (Object.keys(window.$zp.editor().metadata).length === 0) {
        window.$zp.editor(merge(window.$zp.editor(), {metadata: {"": ""}}))
      }
      break
    }
    // SAVE ROOM ENTITY
    case 'room': {
      console.log('saving room', id, 'with data:', data)
      this.isLoading = true
      if (data.id.length === 0 ||
        data.title.length === 0 ||
        data.description.length === 0) {
        this.isLoading = false
        return this.toaster.show({
          message: 'All fields are required.',
          intent: 'warning',
        })
      }
      data.items = (Array.isArray(data.items) ? data.items : data.items.split(','))
      data.npcs = (Array.isArray(data.npcs) ? data.npcs : data.npcs.split(','))
      m.request({
        method: 'PUT',
        url: `/api/room/${this.area}/${id}`,
        body: data
      }).then(data1 => {
        this.toaster.show({
          message: 'Save successful.',
          intent: 'positive',
        })
        console.log('room edited:', data1)
        window.$zp.room(data1)
        this.isLoading = false
      })
      if (Object.keys(window.$zp.editor().metadata).length === 0) {
        window.$zp.editor(merge(window.$zp.editor(), {metadata: {"": ""}}))
      }
      break
    }
    }
  }

  renderEditor () {
    switch (this.type) {
    case 'area': {
      return (
        <div class="form-holder area">
          <FormGroup>
            <FormLabel>ID</FormLabel>
            <Input name="id" placeholder="id" disabled={!this.isNew} value={this.stream()._id}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { _id: e.target.value })) }}></Input>
          </FormGroup>
          <FormGroup>
            <FormLabel>Title</FormLabel>
            <Input name="title" placeholder="title" value={this.stream().title}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { title: e.target.value })) }}></Input>
          </FormGroup>
          <FormGroup>
            <FormLabel>Bundle</FormLabel>
            <Select options={window.$zp.bundles()} name="bundle" fluid="true" defaultValue={this.stream().bundle}
              onchange={(e) => { this.stream(Object.assign(this.stream(), { bundle: e.target.value })) }}/>
          </FormGroup>
          <MetadataEditor type="area" />
        </div>
      )
    }
    case 'item': {
      return (
        <div class="form-holder item">
          <FormGroup>
            <FormLabel>ID</FormLabel>
            <Input name="id" placeholder="id" disabled={!this.isNew} value={this.stream().id}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { id: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Prototype</FormLabel>
            <Input name="prototype" placeholder="area:id" value={this.stream().prototype}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { prototype: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <Input name="name" placeholder="name" value={this.stream().name}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { name: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Room Description</FormLabel>
            <TextArea name="room-description" placeholder="room description" value={this.stream().roomDesc}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { roomDesc: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Description</FormLabel>
            <TextArea name="description" placeholder="description" value={this.stream().description}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { description: e.target.value })) }}/>
          </FormGroup>
          <MetadataEditor type="item" />
        </div>
      )
    }
    case 'npc': {
      return (
        <div class="form-holder npc">
          <FormGroup>
            <FormLabel>ID</FormLabel>
            <Input name="id" placeholder="id" disabled={!this.isNew} value={this.stream().id}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { id: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Prototype</FormLabel>
            <Input name="prototype" placeholder="area:id" value={this.stream().prototype}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { prototype: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <Input name="name" placeholder="name" value={this.stream().name}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { name: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Description</FormLabel>
            <TextArea name="description" placeholder="description" value={this.stream().description}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { description: e.target.value })) }}/>
          </FormGroup>
          <MetadataEditor type="npc" />
        </div>
      )
    }
    case 'room': {
      return (
        <div class="form-holder room">
          <FormGroup>
            <FormLabel>ID</FormLabel>
            <Input name="id" placeholder="id" disabled={!this.isNew} value={this.stream().id}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { id: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Prototype</FormLabel>
            <Input name="prototype" placeholder="area:id" value={this.stream().prototype}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { prototype: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Title</FormLabel>
            <Input name="title" placeholder="title" value={this.stream().title}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { title: e.target.value })) }}/>
          </FormGroup>
          <FormGroup class="coordinate x">
            <FormLabel>X</FormLabel>
            <Input name="x" placeholder="x" value={this.stream().coordinates[0]}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { coordinates: [parseInt(e.target.value), this.stream().coordinates[1], this.stream().coordinates[2]] })) }}/>
          </FormGroup>
          <FormGroup class="coordinate y">
            <FormLabel>Y</FormLabel>
            <Input name="y" placeholder="y" value={this.stream().coordinates[1]}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { coordinates: [this.stream().coordinates[0], parseInt(e.target.value), this.stream().coordinates[2]] })) }}/>
          </FormGroup>
          <FormGroup class="coordinate z">
            <FormLabel>Z</FormLabel>
            <Input name="z" placeholder="z" value={this.stream().coordinates[2]}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { coordinates: [this.stream().coordinates[0], this.stream().coordinates[1], parseInt(e.target.value)] })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Default Items</FormLabel>
            <Input name="default-items" placeholder="default items" value={this.stream().items}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { items: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Default NPCs</FormLabel>
            <Input name="default-npcs" placeholder="default npcs" value={this.stream().npcs}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { npcs: e.target.value })) }}/>
          </FormGroup>
          <FormGroup>
            <FormLabel>Description</FormLabel>
            <TextArea name="description" placeholder="description" value={this.stream().description}
              oninput={(e) => { this.stream(Object.assign(this.stream(), { description: e.target.value })) }}/>
          </FormGroup>
          <MetadataEditor type="room" />
        </div>
      )
    }
    }
  }

  renderBackLink () {
    if (this.type === 'area') {
      return (<BackLink to="/area" label="Areas" />)
    } else {
      return (<BackLink to={`/${this.type}/${this.area}`} label={`${this.area} ${this.typeCap}s`} />)
    }
  }

  renderPreId () {
    if (this.id.length > 0) {
      return <pre>{this.id}</pre>
    }
  }

  view () {
    return (
      <div class={`entity-edit-page ${this.type}`}>
        {m(this.toaster)}
        {this.renderBackLink()}
        <h2>{this.label} {this.renderPreId()} {this.typeCap}</h2>
        <Form autocomplete="off" onsubmit={(e) => {
          e.preventDefault()
          if (
            window.document.activeElement.parentElement.className === 'cui-tag-input-values' ||
            window.document.activeElement.parentElement.className === 'cui-input cui-positive' ||
            window.document.activeElement.parentElement.className === 'cui-input'
          ) {
            return
          }

          if (this.type === 'area') {
            this.saveEntity(this.stream()._id, this.stream())
          } else {
            this.saveEntity(this.stream().id, this.stream())
          }
        }}>
          {this.renderEditor()}
          <FormGroup class="button-holder">
            <Button label="Save" type="submit" loading={this.isLoading} fluid="true" intent="primary"/>
          </FormGroup>
        </Form>
      </div>
    )
  }
}
