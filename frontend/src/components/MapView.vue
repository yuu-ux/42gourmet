<template>
  <div>
    <div id="map" style="height: 100vh; width: 100%;"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineExpose, watchEffect } from 'vue'

const props = defineProps({
  showOnlyOpen: Boolean,
  selectedGenre: String
})

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const map = ref(null)
const markers = ref([])
const stores = ref([])
const currentInfoWindow = ref(null)

const getTodayIndex = () => new Date().getDay()
const timeToMinutes = (t) => {
    if (!t || typeof t !== 'string') return -1; // More robust check
    const parts = t.split(':');
    if (parts.length !== 2) return -1;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    return h * 60 + m;
};

const isOpenNow = (hours) => {
    if (!hours || hours.length === 0) return false;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];
    const yesterdayIndex = (now.getDay() - 1 + 7) % 7;
    const yesterdayName = dayNames[yesterdayIndex];

    for (const h of hours) {
        if (!h.open_time || !h.close_time) continue; // Skip if times are missing

        const openMinutes = timeToMinutes(h.open_time);
        const closeMinutes = timeToMinutes(h.close_time);
        if (openMinutes === -1 || closeMinutes === -1) continue; // Skip if time parsing failed

        // Case 1 & 2: Check today's hours
        if (h.day_of_week === todayName) {
            if (openMinutes <= closeMinutes) { // Same day opening (e.g., 09:00 - 17:00)
                if (openMinutes <= nowMinutes && nowMinutes < closeMinutes) {
                    return true; // Currently open within same-day hours
                }
            } else { // Overnight opening starting today (e.g., Mon 22:00 - Tue 02:00)
                if (openMinutes <= nowMinutes) {
                    return true; // Currently open after today's opening time (before midnight)
                }
            }
        }

        // Case 3: Check yesterday's hours for overnight closing today
        if (h.day_of_week === yesterdayName) {
            if (openMinutes > closeMinutes) { // Overnight opening yesterday
                if (nowMinutes < closeMinutes) {
                    return true; // Currently open before today's closing time (after midnight)
                }
            }
        }
    }

    return false; // Store is not open now based on checks
};

const getMarkerIconByGenre = (genre) => {
  switch (genre) {
    case '和食': return 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png'
    case '中華': return 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png'
    case '洋食': return 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png'
    case 'アジアン': return 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png'
    case 'カフェ': return 'https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png'
    case '居酒屋': return 'https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png'
    default: return 'https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png'
  }
}

const clearMarkers = () => {
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []
}

// 価格レベルを円表示の文字列に変換する関数
const formatPriceLevel = (level) => {
  switch (level) {
    case 1: return '~999円';
    case 2: return '1000円~1999円';
    case 3: return '2000円~2999円';
    case 4: return '3000円~';
    default: return '不明'; // 不明な値の場合
  }
};

// 曜日マッピング（英語→日本語）表示用
const reverseDayMap = {
  'Monday': '月曜日',
  'Tuesday': '火曜日',
  'Wednesday': '水曜日',
  'Thursday': '木曜日',
  'Friday': '金曜日',
  'Saturday': '土曜日',
  'Sunday': '日曜日'
};

// 曜日の順序定義（表示用のソート）
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// 営業時間をInfoWindow用にフォーマットする関数
const formatHoursForInfoWindow = (hours) => {
  if (!hours || hours.length === 0) {
    return '<p>営業時間情報なし</p>';
  }

  // 曜日順にソート
  const sortedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));

  let hoursHtml = '<strong style="margin-top: 5px; display: inline-block;">営業時間:</strong><ul style="list-style-type: none; padding-left: 0; margin-top: 5px;">';
  sortedHours.forEach(hourInfo => {
    const dayJp = reverseDayMap[hourInfo.day_of_week] || hourInfo.day_of_week; // 日本語曜日名、なければ元の名前
    let timeStr;
    // Check for 24 hours format, assuming '00:00' - '23:59' means 24h
    if (hourInfo.open_time === '00:00' && hourInfo.close_time === '23:59') {
        timeStr = '24時間営業';
    } else if (hourInfo.open_time && hourInfo.close_time) {
      timeStr = `${hourInfo.open_time} - ${hourInfo.close_time}`;
    } else {
      timeStr = '休業日';
    }
    hoursHtml += `<li style="margin-bottom: 2px;">${dayJp}: ${timeStr}</li>`;
  });
  hoursHtml += '</ul>';
  return hoursHtml;
};

// ジャンル英語値 -> 日本語テキスト変換
const genreMap = {
  'japanese': '和食',
  'italian': 'イタリアン',
  'chinese': '中華',
  'western': '洋食',
  'asian': 'アジアン',
  'cafe': 'カフェ',
  'izakaya': '居酒屋'
};

const getGenreJapaneseName = (genreValue) => {
  return genreMap[genreValue] || genreValue; // マッピングがあれば日本語名、なければ元の値
};

const addMarkers = () => {
  console.log(`[MapView] addMarkers called. showOnlyOpen: ${props.showOnlyOpen}, selectedGenre: ${props.selectedGenre}`);
  clearMarkers()

  const filteredStores = stores.value.filter(store => {
    // 営業中フィルタ
    const open = isOpenNow(store.operation_hours)
    const passesOpenFilter = props.showOnlyOpen ? open : true

    // ジャンルフィルタ
    const passesGenreFilter = !props.selectedGenre || store.genre === props.selectedGenre

    return passesOpenFilter && passesGenreFilter // 두 필터 조건을 모두 만족해야 함
  })
  console.log(`[MapView] Filtered stores count: ${filteredStores.length}`);

  filteredStores.forEach(store => {
    const marker = new google.maps.Marker({
      position: { lat: store.latitude, lng: store.longitude },
      map: map.value,
      title: store.name,
      icon: {
        url: getMarkerIconByGenre(getGenreJapaneseName(store.genre)),
        scaledSize: new google.maps.Size(32, 32)
      }
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding:5px; max-width:250px;">
          <h3>${store.name}</h3>
          <p>住所: ${store.address}</p>
          <p>ジャンル: ${getGenreJapaneseName(store.genre)}</p>
          <p>おすすめ: ${store.reason}</p>
          <p>価格帯: ${formatPriceLevel(store.price_level)}</p>
          ${formatHoursForInfoWindow(store.operation_hours)}
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
 } catch (error) {
   console.error('店舗情報の取得エラー:', error)
 } finally {
    addMarkers()
 }
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

// Watch for changes in the showOnlyOpen prop and update markers accordingly
// watch(() => props.showOnlyOpen, () => { // 이 watch 블록 제거
//  if (!map.value) return; // Ensure map is initialized
//
//  // Just re-filter and add markers. addMarkers handles clearing existing ones.
//  addMarkers();
//  // Remove the complex logic involving API reload and state saving
// });

// watchEffect 사용하여 프롭 변경 감지 및 마커 업데이트
watchEffect(() => {
  console.log(`[MapView] watchEffect triggered. showOnlyOpen: ${props.showOnlyOpen}, selectedGenre: ${props.selectedGenre}`);
  if (map.value && stores.value.length > 0) { // 지도와 스토어 데이터가 로드된 후에만 실행
    addMarkers();
  }
});

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

// ✅ fetchStores 関数を外部に公開
defineExpose({
  fetchStores
})
</script>
