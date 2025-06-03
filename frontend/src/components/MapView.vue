<template>
  <div>
    <div id="map" style="height: 100vh; width: 100%;"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  showOnlyOpen: Boolean,
  reloadTrigger: Number
})

watch(() => props.reloadTrigger, async () => {
  console.log('🗺️ Reload triggered')
  await fetchStores()
  addMarkers()
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
  const today = getTodayIndex() // e.g. 1 (Monday)

  return hours.some(h => {
    const hDay = typeof h.day_of_week === 'number'
      ? h.day_of_week
      : convertDayStringToIndex(h.day_of_week)
    return hDay === today &&
      timeToMinutes(h.open_time) <= nowMinutes &&
      nowMinutes <= timeToMinutes(h.close_time)
  })
}

const convertDayStringToIndex = (dayStr) => {
  const map = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  }
  return map[dayStr] ?? -1
}

const formatPriceLevel = (level) => {
  const map = {
    1: '~500',
    2: '501~999',
    3: '1000~1500',
    4: '1501~'
  }
  return map[level] ?? '不明'
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
    const open = isOpenNow(store.operation_hours)
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
		  <p>価格帯: ${formatPriceLevel(store.price_level)}</p>
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
   const response = await fetch('http://localhost:3000/api/stores')
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

watch(() => props.showOnlyOpen, async () => {
  if (!map.value) return

  savedCenter.value = map.value.getCenter()
  savedZoom.value = map.value.getZoom()

  clearMarkers()

  await loadGoogleMapsAPI()

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
      resolve()
    }
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  await loadGoogleMapsAPI()
})
</script>
