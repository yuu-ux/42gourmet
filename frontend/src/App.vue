<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="openRegisterSidebar" />
      <v-toolbar-title>42gourmet</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="registerSidebar"
      right
      temporary
      width="400"
    >
      <RegisterSidebar @close="registerSidebar = false" />
    </v-navigation-drawer>

    <v-main>
      <MapView ref="mapViewRef" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import MapView from './components/MapView.vue'
import RegisterSidebar from './components/RegisterSidebar.vue'

const registerSidebar = ref(false)

const openRegisterSidebar = () => {
  registerSidebar.value = true
}
</script>
