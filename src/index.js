import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { Routes, DefaultRoute } from './view/routes'
import './app.scss'

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!')
  console.log('Env var test ===>', process.env.BASE_URL, process.env.BASE_URL_EXPAND)
}

const $root = document.body.querySelector('#root')
m.route($root, DefaultRoute, Routes)
