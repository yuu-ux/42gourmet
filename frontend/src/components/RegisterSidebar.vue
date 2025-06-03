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
	    :item-title="(item) => ['~500', '500~999', '1000~1500', '1500~'][item - 1]"
	    :item-value="(item) => item"
	  />

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
const priceOptions = [1, 2, 3, 4]

const map = ref(null)

const emit = defineEmits(['store-registered'])

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

    console.log('▶ opening_hours.weekday_text', details.opening_hours?.weekday_text || '(none)')
  })
}

const registerStore = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: selectedPlace.value.name,
        address: selectedPlace.value.formatted_address,
        latitude: selectedPlace.value.geometry.location.lat(),
        longitude: selectedPlace.value.geometry.location.lng(),
        price_level: price.value,
        genre: genre.value,
        reason: reason.value,
        operation_hours: selectedPlace.value.opening_hours
          ? parseOpeningHours(selectedPlace.value.opening_hours.weekday_text)
          : []
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`サーバーエラー: ${response.status} ${errText}`)
    }

    alert('登録完了しました！')
	emit('store-registered') 

    selectedPlace.value = null
    searchQuery.value = ''
    searchResults.value = []
    genre.value = ''
    reason.value = ''
    price.value = ''

  } catch (error) {
    console.error('店舗登録エラー:', error)
    alert('登録に失敗しました: ' + error.message)
  }
}

function convertTo24Hour(timeStr, suffix) {
  if (!timeStr || !suffix) {
    console.warn('Invalid time input:', timeStr, suffix)
    return '00:00'
  }

  let [hour, minute] = timeStr.split(':').map(Number)

  if (isNaN(hour) || isNaN(minute)) {
    console.warn('Invalid time format:', timeStr)
    return '00:00'
  }

  if (suffix.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (suffix.toUpperCase() === 'AM' && hour === 12) hour = 0

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

const parseOpeningHours = (weekdayText) => {
  const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const result = []

  for (const entry of weekdayText) {
    const normalizedEntry = entry
      .replace(/[\u202F\u2009\u00A0]/g, ' ')
      .replace(/[–—ー−]/g, '-') 
      .replace(/\s*-\s*/g, '-') 
      .replace(/\s+/g, ' ')
      .trim()

    const match = normalizedEntry.match(/^([A-Za-z]+):\s*(.+)$/)
    if (!match) continue

    const dayString = match[1]
    const timeRanges = match[2]
    if (!validDays.includes(dayString)) continue
    if (timeRanges.toLowerCase().includes('closed')) continue

    const ranges = timeRanges.split(',').map(r => r.trim())

    for (const range of ranges) {
      const timeMatch = range.match(/(\d{1,2}:\d{2})(?:\s*(AM|PM))?-(\d{1,2}:\d{2})(?:\s*(AM|PM))?/i)
      if (!timeMatch) {
        console.warn('⛔ 不明な時間形式:', range)
        continue
      }

      let [, open, openSuffix, close, closeSuffix] = timeMatch

      if (!openSuffix && closeSuffix) openSuffix = closeSuffix
      if (!closeSuffix && openSuffix) closeSuffix = openSuffix
      if (!openSuffix && !closeSuffix) openSuffix = closeSuffix = 'AM'

      const openTime = convertTo24Hour(open, openSuffix)
      const closeTime = convertTo24Hour(close, closeSuffix)

      result.push({
        day_of_week: dayString,
        open_time: openTime,
        close_time: closeTime
      })
    }
  }

  console.log('▶ parseOpeningHours result:', result)
  return result
}

</script>
