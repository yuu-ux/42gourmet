<template>
  <div>
    <div id="map" style="height: 100vh; width: 100%;"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  showOnlyOpen: Boolean
})

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const map = ref(null)
const markers = ref([])
const stores = ref([])
const currentInfoWindow = ref(null)

const getTodayIndex = () => new Date().getDay()
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const isOpenNow = (hours) => {
  if (!hours || hours.length === 0) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const today = getTodayIndex()
  return hours.some(h => h.day_of_week === today && timeToMinutes(h.open_time) <= nowMinutes && nowMinutes <= timeToMinutes(h.close_time))
}

const getMarkerIconByGenre = (genre) => {
  switch (genre) {
    case '和食': return 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png'
    case '中華': return 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png'
    case 'イタリアン': return 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png'
    case 'フレンチ': return 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png'
    case 'カフェ': return 'https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png'
    case '居酒屋': return 'https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png'
    default: return 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png'
  }
}

const clearMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []
}

const addMarkers = () => {
  clearMarkers()

  const filteredStores = stores.value.filter(store => {
    const open = isOpenNow(store.hours)
    return props.showOnlyOpen ? open : true
  })

  filteredStores.forEach(store => {
    const marker = new google.maps.Marker({
      position: { lat: store.latitude, lng: store.longitude },
      map: map.value,
      title: store.name,
      icon: {
        url: getMarkerIconByGenre(store.genre),
        scaledSize: new google.maps.Size(32, 32)
      }
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding:5px; max-width:250px;">
          <h3>${store.name}</h3>
          <p>住所: ${store.address}</p>
          <p>ジャンル: ${store.genre}</p>
          <p>おすすめ: ${store.reason}</p>
          <p>価格帯: ${store.price}</p>
        </div>
      `
    })

    marker.addListener('click', () => {
      if (currentInfoWindow.value) {
        currentInfoWindow.value.close()
      }
      infoWindow.open({
        anchor: marker,
        map: map.value,
        shouldFocus: false
      })
      currentInfoWindow.value = infoWindow
    })

    markers.value.push(marker)
  })
}

const fetchStores = async () => {
 try {
   const response = await fetch('http://localhost:5000/api/stores')
   const data = await response.json()
   stores.value = data
   addMarkers()
 } catch (error) {
   console.error('店舗情報の取得エラー:', error)
 }
  addMarkers()
}

const initMap = async () => {
  map.value = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.690727, lng: 139.687788 },
    zoom: 16
  })

  map.value.addListener('click', () => {
    if (currentInfoWindow.value) {
      currentInfoWindow.value.close()
      currentInfoWindow.value = null
    }
  })

  await fetchStores()
  addMarkers()
}

const savedCenter = ref(null)
const savedZoom = ref(null)

// ✅ チェックボックス切り替え時にマーカーを再配置
watch(() => props.showOnlyOpen, async () => {
  if (!map.value) return

  // 現在の中心とズームを保存する
  savedCenter.value = map.value.getCenter()
  savedZoom.value = map.value.getZoom()

  clearMarkers()

  await loadGoogleMapsAPI() // ← マップを読み直す（マップ本体を再生成）

  // 読み込み完了後に、元の中心とズームを復元する
  if (savedCenter.value && savedZoom.value) {
    map.value.setCenter(savedCenter.value)
    map.value.setZoom(savedZoom.value)
  }

  addMarkers()
})

const loadGoogleMapsAPI = async () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      initMap()
      resolve()  // ここで完了通知
    }
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  await loadGoogleMapsAPI()
})
</script>
