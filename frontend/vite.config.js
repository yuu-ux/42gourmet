import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

const { defineConfig } = require('/opt/app/node_modules/vite')
// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vuetify({ autoImport: true })],
});
