<template>
  <div>
    <!-- 検索バーとボタン（modeがsearchまたはregisterのとき表示） -->
    <div v-if="mode === 'search' || mode === 'register'" style="padding: 10px; display: flex; gap: 10px; align-items: center;">
      <v-text-field
        v-model="searchQuery"
        label="店舗名で検索"
        @keydown.enter="searchPlace"
        hide-details
        dense
        style="flex: 1;"
      ></v-text-field>
      <v-btn color="primary" @click="searchPlace">検索</v-btn>
    </div>

    <!-- 検索結果リスト -->
    <v-list v-if="searchResults.length && (mode === 'search' || mode === 'register')" style="padding: 0 10px;">
      <v-list-item
        v-for="(place, index) in searchResults"
        :key="index"
        @click="selectPlace(place)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ place.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ place.formatted_address }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <!-- 選択した店舗情報（modeがselectのときだけ表示） -->
    <div v-if="selectedPlace && mode === 'select'" style="position: absolute; top: 100px; right: 20px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0px 2px 6px rgba(0,0,0,0.2); z-index: 1000; max-width: 300px;">
      <h3 style="margin: 0 0 10px;">{{ selectedPlace.name }}</h3>
      <p style="margin: 5px 0;">住所: {{ selectedPlace.formatted_address }}</p>
      <p v-if="selectedPlace.opening_hours" style="margin: 5px 0;">営業時間: <br>{{ selectedPlace.opening_hours.weekday_text.join(' / ') }}</p>
      <p v-if="selectedPlace.price_level" style="margin: 5px 0;">価格帯: {{ '¥'.repeat(selectedPlace.price_level) }}</p>
      <v-btn color="success" small @click="registerStore" style="margin-top: 10px;">登録する</v-btn>
    </div>

    <!-- マップ -->
    <div id="map" style="height: calc(100vh - 64px); width: 100%;"></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const map = ref(null)
const mode = ref('default') // 'default' | 'search' | 'register'
const searchQuery = ref('')
const searchResults = ref([])
const selectedPlace = ref(null)

const initMap = () => {
  map.value = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.6907274197, lng: 139.6877882220 },
    zoom: 16
  })
}

// 検索ボタン押したとき
const searchPlace = () => {
  if (!searchQuery.value) return

  const service = new google.maps.places.PlacesService(map.value)
  service.textSearch({ query: searchQuery.value }, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
      alert('検索結果がありません')
      return
    }
    searchResults.value = results
  })
}

// 店舗を選択したとき
const selectPlace = (place) => {
  selectedPlace.value = place
  map.value.setCenter(place.geometry.location)
  map.value.setZoom(18)

  // ★ 登録フローだけここに進む
  if (mode.value === 'register') {
    mode.value = 'select'
  }
}

// 登録ボタン押したとき
const registerStore = () => {
  console.log('保存するデータ:', {
    name: selectedPlace.value.name,
    address: selectedPlace.value.formatted_address,
    hours: selectedPlace.value.opening_hours ? selectedPlace.value.opening_hours.weekday_text : '',
    price: selectedPlace.value.price_level,
    latitude: selectedPlace.value.geometry.location.lat(),
    longitude: selectedPlace.value.geometry.location.lng()
  })
  alert('登録完了！（ここでサーバー送信できる）')
  selectedPlace.value = null
  searchQuery.value = ''
  searchResults.value = []
  mode.value = 'default'
}

const loadGoogleMapsAPI = () => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  script.onload = () => {
    initMap()
  }
  document.head.appendChild(script)
}

onMounted(() => {
  loadGoogleMapsAPI()
})

// expose関数
const startSearchMode = () => {
  mode.value = 'search'
}

const startRegisterMode = () => {
  mode.value = 'register'
}

defineExpose({ startSearchMode, startRegisterMode })
</script>
