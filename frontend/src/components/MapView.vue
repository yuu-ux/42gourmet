<template>
  <div>
    <div id="map" style="height: 100vh; width: 100%"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  showOnlyOpen: Boolean,
  reloadTrigger: Number,
  selectedGenre: String,
  selectedPrice: String,
  selectedReason: String,
});

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const map = ref(null);
const markers = ref([]);
const stores = ref([]);
const currentInfoWindow = ref(null);
const savedCenter = ref(null);
const savedZoom = ref(null);

const convertDayStringToIndex = (dayStr) =>
  ({
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  })[dayStr] ?? -1;

const getTodayIndex = () => new Date().getDay();
const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isOpenNow = (hours) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getTodayIndex();

  return hours?.some((h) => {
    const hDay =
      typeof h.day_of_week === "number"
        ? h.day_of_week
        : convertDayStringToIndex(h.day_of_week);
    return (
      hDay === today &&
      timeToMinutes(h.open_time) <= nowMinutes &&
      nowMinutes <= timeToMinutes(h.close_time)
    );
  });
};

const formatPriceLevel = (level) =>
  ({
    1: "~500",
    2: "501~999",
    3: "1000~1500",
    4: "1501~",
  })[level] ?? "不明";

const getMarkerIconByGenre = (genre) =>
  ({
    和食: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
    中華: "https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png",
    洋食: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
    アジアン: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
    カフェ: "https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png",
    居酒屋: "https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png",
  })[genre] ?? "https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png";

let mapsApiLoaded = false;
const loadGoogleMapsAPI = async () => {
  if (mapsApiLoaded) return;
  mapsApiLoaded = true;

  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

const initMap = () => {
  if (map.value instanceof google.maps.Map) return;

  map.value = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.690727, lng: 139.687788 },
    zoom: 16,
  });

  map.value.addListener("click", () => {
    currentInfoWindow.value?.close();
    currentInfoWindow.value = null;
  });
};

const clearMarkers = () => {
  markers.value.forEach((marker) => {
    google.maps.event.clearInstanceListeners(marker);
    marker.setVisible(false);
    marker.setMap(null);
  });
  markers.value = [];
};

const addMarkers = () => {
  if (!map.value || !google?.maps) {
    console.error("📛 Google Maps APIが未ロード");
    return;
  }

  clearMarkers();

  const filtered = stores.value.filter((store) => {
    const openMatch = props.showOnlyOpen
      ? isOpenNow(store.operation_hours)
      : true;
    const genreMatch = props.selectedGenre
      ? store.genre === props.selectedGenre
      : true;
    const priceMatch = props.selectedPrice
      ? formatPriceLevel(store.price_level) === props.selectedPrice
      : true;
    const reasonMatch = props.selectedReason
      ? store.reason === props.selectedReason
      : true;
    return openMatch && genreMatch && priceMatch && reasonMatch;
  });

  filtered.forEach((store) => {
    const marker = new google.maps.Marker({
      position: { lat: store.latitude, lng: store.longitude },
      map: map.value,
      title: store.name,
      icon: {
        url: getMarkerIconByGenre(store.genre),
        scaledSize: new google.maps.Size(32, 32),
      },
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding:5px; max-width:250px;">
          <h3>${store.name}</h3>
          <p>住所: ${store.address}</p>
          <p>ジャンル: ${store.genre}</p>
          <p>おすすめ: ${store.reason}</p>
          <p>価格帯: ${formatPriceLevel(store.price_level)}</p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      currentInfoWindow.value?.close();
      infoWindow.open({ anchor: marker, map: map.value, shouldFocus: false });
      currentInfoWindow.value = infoWindow;
    });

    markers.value.push(marker);
  });
};

const fetchStores = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/stores");
    stores.value = await res.json();
  } catch (err) {
    console.error("📡 店舗データ取得失敗:", err);
  }
};

watch(
  () => [
    props.reloadTrigger,
    props.showOnlyOpen,
    props.selectedGenre,
    props.selectedPrice,
    props.selectedReason,
  ],
  async () => {
    if (!map.value) return;
    savedCenter.value = map.value.getCenter();
    savedZoom.value = map.value.getZoom();

    await fetchStores();
    addMarkers();
  },
);

onMounted(async () => {
  await loadGoogleMapsAPI();
  initMap();
  await fetchStores();
  addMarkers();
});
</script>
