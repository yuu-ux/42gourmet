<template>
  <v-app>
    <v-main>

      <v-app-bar app color="primary" dark>

        <v-btn icon @click="toggleSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <v-toolbar-title>42 Gourmet</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-select
          v-model="selectedPrice"
          :items="priceOptions"
          label="価格帯"
          clearable
          hide-details
          density="compact"
          style="max-width: 150px; margin-right: 10px;"
          @update:modelValue="reloadMapTrigger++"
        />

		<v-select
		  v-model="selectedGenre"
		  :items="genreOptions"
		  label="ジャンル"
		  clearable
		  hide-details
		  density="compact"
          style="max-width: 150px; margin-right: 10px;"
		  @update:modelValue="reloadMapTrigger++"
		/>

		<v-select
		  v-model="selectedReason"
		  :items="reasonOptions"
		  label="おすすめ理由"
		  clearable
		  hide-details
		  density="compact"
		  style="max-width: 150px; margin-right: 10px;"
		  @update:modelValue="reloadMapTrigger++"
		/>

        <v-checkbox
          v-model="showOnlyOpen"
          label="営業中のみ"
          hide-details
          density="compact"
          style="margin-right: 10px;"
        />
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" width="300">
        <RegisterSidebar @store-registered="handleStoreRegistered" />
      </v-navigation-drawer>

	  <MapView
	    :showOnlyOpen="showOnlyOpen"
	    :reloadTrigger="reloadMapTrigger"
	    :selectedGenre="selectedGenre"
		:selectedPrice="selectedPrice"
		:selectedReason="selectedReason"
	  />

    </v-main>
  </v-app>
</template>

<script setup>

import { ref } from 'vue'
import MapView from './components/MapView.vue'
import RegisterSidebar from './components/RegisterSidebar.vue'

const drawer = ref(false)
const showOnlyOpen = ref(false)

const reloadMapTrigger = ref(0)
const handleStoreRegistered = () => {
  reloadMapTrigger.value++
}

const toggleSidebar = () => {
  drawer.value = !drawer.value
}

const selectedGenre = ref(null)
const selectedPrice = ref(null)
const selectedReason = ref(null)

const genreOptions = ['和食', '中華', '洋食', 'アジアン', 'カフェ', '居酒屋', 'その他']
const priceOptions = ['~500', '501~999', '1000~1500', '1501~']
const reasonOptions = ['コスパが良い', '提供が早い', '味が最高', '栄養満点']

</script>
