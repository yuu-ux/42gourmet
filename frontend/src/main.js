import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi'
  }
})

const app = createApp(App)
const appInt = () => {
  app.use(vuetify).mount('#app')
}

appInt()
