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
        <v-list-item-title>{{ place.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ place.formatted_address }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <div v-if="selectedPlace" class="mt-4">
      <h3>{{ selectedPlace.name }}</h3>
      <p>住所: {{ selectedPlace.formatted_address }}</p>
      <div v-if="selectedPlace.transformedHours && selectedPlace.transformedHours.length" class="mt-2">
        <strong>営業時間:</strong>
        <ul>
          <li v-for="hourInfo in sortedHours(selectedPlace.transformedHours)" :key="hourInfo.day_of_week">
            {{ reverseDayMap[hourInfo.day_of_week] }}:
            <span v-if="hourInfo.open_time === '00:00' && hourInfo.close_time === '23:59'">24時間営業</span>
            <span v-else-if="hourInfo.open_time && hourInfo.close_time">{{ hourInfo.open_time }} - {{ hourInfo.close_time }}</span>
            <span v-else>休業日</span>
          </li>
        </ul>
      </div>
      <p v-if="selectedPlace.google_price_level">価格帯: {{ '¥'.repeat(selectedPlace.google_price_level) }}</p>

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
import { ref, defineEmits } from 'vue'

// ✅ 'registration-successful' イベントを定義
const emit = defineEmits(['registration-successful'])

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const searchQuery = ref('')
const searchResults = ref([])
const selectedPlace = ref(null)

const genre = ref('')
const reason = ref('')
const price = ref('')

const genreOptions = ['和食', '中華', '洋食', 'アジアン', 'カフェ', '居酒屋', 'その他']
// ✅ 日本語 -> 英語のジャンルマッピング
const genreMap = {
  '和食': 'japanese',
  '中華': 'chinese',
  '洋食': 'western',
  'アジアン': 'asian',
  'カフェ': 'cafe',
  '居酒屋': 'izakaya',
  'その他': 'other'
}

const reasonOptions = ['コスパが良い', '提供が早い', '味が最高', '栄養満点']
const priceOptions = ['~999', '1000~1999', '2000~2999', '3000~']
const priceMap = {
  '~999': 1,
  '1000~1999': 2,
  '2000~2999': 3,
  '3000~': 4
}

// 曜日のマッピング（日本語→英語）
const dayMap = {
  '月曜日': 'Monday',
  '火曜日': 'Tuesday',
  '水曜日': 'Wednesday',
  '木曜日': 'Thursday',
  '金曜日': 'Friday',
  '土曜日': 'Saturday',
  '日曜日': 'Sunday'
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

// 時間文字列の解析とフォーマット関数
const parseTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/(\d{1,2})時(\d{2})分/);
  if (match) {
    const hour = match[1].padStart(2, '0');
    const minute = match[2];
    return `${hour}:${minute}`;
  }
  return null; // 形式が一致しない場合はnullを返す
};

// weekday_text配列をoperation_hours形式に変換する関数
const transformHours = (weekdayText) => {
  if (!Array.isArray(weekdayText) || weekdayText.length === 0) {
    return [];
  }

  return weekdayText.map(text => {
    const parts = text.split(': ');
    if (parts.length !== 2) return null; // 形式エラー

    const dayJp = parts[0];
    const timeRange = parts[1];

    const dayEn = dayMap[dayJp];
    if (!dayEn) return null; // マッピングされる曜日がない

    // "24時間営業"の処理
    if (timeRange === '24 時間営業') {
        return { day_of_week: dayEn, open_time: '00:00', close_time: '23:59' };
    }
    // "休業日"の処理
    if (timeRange === '休業日') {
        return { day_of_week: dayEn, open_time: null, close_time: null };
    }

    const times = timeRange.split('～');
    if (times.length !== 2) return null; // 時間形式エラー

    const openTime = parseTime(times[0]);
    const closeTime = parseTime(times[1]);

    // 解析失敗時は項目を除外
    if (openTime === null || closeTime === null) return null;

    return {
      day_of_week: dayEn,
      open_time: openTime,
      close_time: closeTime
    };
  }).filter(item => item !== null); // nullの項目（形式エラーなど）を除去
};

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
  service.getDetails({
    placeId: place.place_id,
    fields: ['name', 'formatted_address', 'geometry', 'opening_hours', 'price_level', 'place_id'] // 必要なフィールドを明示
   }, (details, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      alert('店舗詳細情報の取得に失敗しました。')
      return
    }

    if (!details.geometry || !details.name || !details.formatted_address) {
      alert('このお店の情報が不足しています。別のお店を選んでください。')
      return
    }

    // 変換された営業時間の計算
    const transformedHours = details.opening_hours ? transformHours(details.opening_hours.weekday_text) : [];

    selectedPlace.value = {
      name: details.name,
      formatted_address: details.formatted_address,
      geometry: details.geometry,
      // opening_hours: details.opening_hours, // 元のデータ（必要な場合に保持）
      google_price_level: details.price_level, // Googleの価格情報（オプション）
      transformedHours: transformedHours // 変換された営業時間を追加
    }

    searchResults.value = []
  })
}

// 営業時間の表示ソート関数
const sortedHours = (hours) => {
  if (!hours) return [];
  return [...hours].sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));
}

const registerStore = async () => {
  const priceValueToSend = priceMap[price.value] || null;

  if (priceValueToSend === null) {
     alert('価格帯を選択してください。');
     return;
  }
  // ✅ 選択された日本語ジャンルを英語に変換
  const genreToSend = genreMap[genre.value] || 'other'; // マッピングがない場合は 'other' にフォールバック

  // 変換された営業時間は既に selectedPlace.value.transformedHours にあります
  const operationHours = selectedPlace.value.transformedHours;

  try {
    const response = await fetch('http://localhost:3000/api/stores', { // ✅ レスポンスを変数に格納
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: selectedPlace.value.name,
        address: selectedPlace.value.formatted_address,
        latitude: selectedPlace.value.geometry.location.lat(),
        longitude: selectedPlace.value.geometry.location.lng(),
        price_level: priceValueToSend,
        genre: genreToSend, // ✅ 英語に変換したジャンルを送信
        reason: reason.value,
        operation_hours: operationHours
      })
    })

    // ✅ 登録成功チェック (より堅牢な方法)
    if (!response.ok) {
      // エラーレスポンスの内容をログに出力するなど、より詳細なエラーハンドリングが可能
      console.error('店舗登録エラー:', response.status, await response.text());
      alert('登録に失敗しました');
      return; // エラーの場合はここで処理を中断
    }

    alert('登録完了しました！')
    emit('registration-successful') // ✅ 登録成功イベントを発火

    // フォームのリセットなど
    selectedPlace.value = null
    searchQuery.value = ''
    searchResults.value = []
    genre.value = ''
    reason.value = ''
    price.value = ''

  } catch (error) {
    console.error('店舗登録エラー:', error)
    alert('登録に失敗しました')
  }
}

</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}
li {
  margin-bottom: 4px;
}
</style>
