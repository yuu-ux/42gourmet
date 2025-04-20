<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-btn icon @click="toggleSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-toolbar-title>42 Gourmet</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- ✅ チェックボックス（タイトルバー右端） -->
        <v-checkbox
          v-model="showOnlyOpen"
          label="営業中のみ"
          hide-details
          density="compact"
          style="margin-right: 10px;"
        />
      </v-app-bar>

      <!-- サイドバー（省略してますがあってもOK） -->
      <v-navigation-drawer v-model="drawer" width="300">
        <RegisterSidebar />
      </v-navigation-drawer>

      <!-- ✅ MapViewにshowOnlyOpenを渡す -->
      <MapView :showOnlyOpen="showOnlyOpen" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import MapView from './components/MapView.vue'
import RegisterSidebar from './components/RegisterSidebar.vue'

const drawer = ref(false)
const showOnlyOpen = ref(true) // ✅ デフォルトは「営業中のみ」

const toggleSidebar = () => {
  drawer.value = !drawer.value
}
</script>

