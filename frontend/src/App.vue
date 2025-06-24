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
		  item-title="title"
		  item-value="value"
          label="価格帯"
          clearable
          hide-details
          density="compact"
          style="max-width: 150px; margin-right: 10px"
          @update:modelValue="reloadMapTrigger++"
        />

        <v-select
          v-model="selectedGenre"
          :items="genreOptions"
		  item-title="title"
		  item-value="value"
          label="ジャンル"
          clearable
          hide-details
          density="compact"
          style="max-width: 150px; margin-right: 10px"
          @update:modelValue="reloadMapTrigger++"
        />

        <v-select
          v-model="selectedReason"
          :items="reasonOptions"
		  item-title="title"
		  item-value="value"
          label="おすすめ理由"
          clearable
          hide-details
          density="compact"
          style="max-width: 150px; margin-right: 10px"
          @update:modelValue="reloadMapTrigger++"
        />

        <v-checkbox
          v-model="showOnlyOpen"
          label="営業中のみ"
          hide-details
          density="compact"
          style="margin-right: 10px"
        />

        <v-btn icon @click="resetFilters" style="margin-right: 10px">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
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
import { ref } from "vue";
import MapView from "./components/MapView.vue";
import RegisterSidebar from "./components/RegisterSidebar.vue";
import { genreOptions, reasonOptions, priceOptions, priceLabels } from "@/config/options";

const drawer = ref(false);
const showOnlyOpen = ref(false);

const reloadMapTrigger = ref(0);
const handleStoreRegistered = () => {
  reloadMapTrigger.value++;
};

const toggleSidebar = () => {
  drawer.value = !drawer.value;
};

const selectedGenre = ref(null);
const selectedPrice = ref(null);
const selectedReason = ref(null);

const resetFilters = () => {
  selectedGenre.value = null;
  selectedPrice.value = null;
  selectedReason.value = null;
  showOnlyOpen.value = false;
  reloadMapTrigger.value++;
};
</script>
