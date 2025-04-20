<template>
  <div id="map" style="height: 800px; width: 100%;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


const map = ref(null)
const stores = ref([])

const initMap = () => {
  map.value = new google.maps.Map(document.getElementById("map"), {
	center: { lat: 35.6907274197, lng: 139.6877882220 },
    zoom: 16
  })
}

const addMarkers = () => {
  stores.value.forEach(store => {
    new google.maps.Marker({
      position: { lat: store.latitude, lng: store.longitude },
      map: map.value,
      title: store.name
    })
  })
}

const loadGoogleMapsAPI = () => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
  script.async = true
  window.initMap = initMap
  document.head.appendChild(script)
}

onMounted(() => {
  loadGoogleMapsAPI()
})
</script>
