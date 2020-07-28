const { Form, FormGroup, Input, FormLabel, Button, Toaster } = require('construct-ui')

export default class LoginPage {
  constructor () {
    this.username = ''
    this.password = ''
    this.isLoading = false
    this.toaster = new Toaster()
  }

  postLogin (username, password) {
    if (username.length === 0 ||
        password.length === 0) {
      return this.toaster.show({
        message: 'Please complete both fields.',
        intent: 'warning',
        size: 'lg'
      })
    }

    this.isLoading = true
    m.request({
      method: 'POST',
      url: '/api/login',
      body: {
        username: this.username,
        password: this.password
      }
    }).then(data => {
      if (data.ok === true) {
        window.$zp.username(data.username)
        m.route.set('/index')
      } else {
        this.isLoading = false
        this.toaster.show({
          message: 'An error occurred. Check your credentials and try again.',
          intent: 'warning',
          size: 'lg'
        })
      }
    })
  }

  view () {
    return (
      <div class="main-layout login-page">
        {m(this.toaster)}
        <div class="title-holder">
          <h1>zPanel</h1>
          <img src="/icon.png"/>
        </div>
        <h4>Please log in to continue...</h4>
        <Form onsubmit={(e) => {
          e.preventDefault()
          this.postLogin(this.username, this.password)
        }}>
          <FormGroup>
            <FormLabel>Username</FormLabel>
            <Input name="username" placeholder="Username..."
              oninput={(e) => { this.username = e.target.value }}></Input>
          </FormGroup>
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <Input name="password" type="password" placeholder="Password..."
              oninput={(e) => { this.password = e.target.value }}></Input>
          </FormGroup>
          <FormGroup class="button-holder">
            <Button label="Log in" type="submit" loading={this.isLoading} fluid="true" intent="primary"/>
          </FormGroup>
        </Form>
      </div>
    )
  }
}
