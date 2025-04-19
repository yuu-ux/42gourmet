<script setup lang="ts">
import { ref } from 'vue'
import MapView from './components/MapView.vue'
import Navigation from './components/Navigation.vue'

const drawer = ref(false)

const goToNavigation = () => {
  drawer.value = !drawer.value
}
</script>

<template>
  <v-app>
    <div>
      <v-app-bar>
        <div class="d-flex align-center ml-5">
          <v-icon size="large" color="status-blue" @click="goToNavigation">mdi-menu</v-icon>
          <h1 class="ml-5">42gourmet</h1>
        </div>
      </v-app-bar>
      <Navigation v-model="drawer" />
      <v-main>
        <MapView />
      </v-main>
    </div>
  </v-app>
</template>
