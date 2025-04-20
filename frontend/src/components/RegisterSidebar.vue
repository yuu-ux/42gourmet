<template>
  <div style="padding: 20px;">
    <v-text-field
      v-model="searchQuery"
      label="店名で検索"
      @keydown.enter="searchPlace"
      hide-details
      dense
    ></v-text-field>
    <v-btn color="primary" block @click="searchPlace" class="mt-2">検索</v-btn>

    <v-list v-if="searchResults.length" class="mt-4">
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

    <div v-if="selectedPlace" class="mt-4">
      <h3>{{ selectedPlace.name }}</h3>
      <p>住所: {{ selectedPlace.formatted_address }}</p>
      <p v-if="selectedPlace.opening_hours">営業時間: {{ selectedPlace.opening_hours.weekday_text.join(' / ') }}</p>
      <p v-if="selectedPlace.price_level">価格帯: {{ '¥'.repeat(selectedPlace.price_level) }}</p>

      <v-select
        v-model="genre"
        :items="genreOptions"
        label="食事ジャンル"
        dense
        class="mt-3"
      ></v-select>

      <v-select
        v-model="reason"
        :items="reasonOptions"
        label="おすすめ理由"
        dense
        class="mt-3"
      ></v-select>

      <v-select
        v-model="price"
        :items="priceOptions"
        label="価格帯"
        dense
        class="mt-3"
      ></v-select>

      <v-btn color="success" block class="mt-4" @click="registerStore">登録する</v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const searchQuery = ref('')
const searchResults = ref([])
const selectedPlace = ref(null)

const genre = ref('')
const reason = ref('')
const price = ref('')

const genreOptions = ['和食', '中華', '洋食', 'アジアン', 'カフェ', '居酒屋', 'その他']
const reasonOptions = ['コスパが良い', '提供が早い', '味が最高', '栄養満点']
const priceOptions = ['~999', '1000~1999', '2000~2999', '3000~']

const map = ref(null)

const loadMapReference = () => {
  if (!map.value) {
    map.value = new google.maps.Map(document.createElement('div')) 
  }
}

const searchPlace = () => {
  loadMapReference()

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

const selectPlace = (place) => {
  if (!place || !place.place_id) {
    alert('このお店の情報が取得できません。別のお店を選んでください。')
    return
  }

  loadMapReference()
  const service = new google.maps.places.PlacesService(map.value)
  service.getDetails({ placeId: place.place_id }, (details, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      alert('店舗詳細情報の取得に失敗しました。')
      return
    }

    if (!details.geometry || !details.name || !details.formatted_address) {
      alert('このお店の情報が不足しています。別のお店を選んでください。')
      return
    }

    selectedPlace.value = {
      name: details.name,
      formatted_address: details.formatted_address,
      opening_hours: details.opening_hours ? details.opening_hours : null,
      geometry: details.geometry
    }

    searchResults.value = []
  })
}

const registerStore = () => {
  console.log('登録するデータ:', {
    name: selectedPlace.value.name,
    address: selectedPlace.value.formatted_address,
    hours: selectedPlace.value.opening_hours ? selectedPlace.value.opening_hours.weekday_text : '',
    price: selectedPlace.value.price_level,
    latitude: selectedPlace.value.geometry.location.lat(),
    longitude: selectedPlace.value.geometry.location.lng(),
    genre: genre.value,
    reason: reason.value
  })
  alert('登録完了！（ここで保存処理できる）')

  selectedPlace.value = null
  searchQuery.value = ''
  genre.value = ''
  reason.value = ''
}
</script>
