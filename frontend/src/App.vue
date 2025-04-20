<template>
  <v-app>
    <v-main>
      <v-app-bar app color="primary" dark>
        <v-btn icon @click="toggleSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-toolbar-title>42 Gourmet</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- ✅ ジャンル選択ドロップダウン -->
        <v-select
          v-model="selectedGenre"
          :items="genres"
          item-title="text"
          item-value="value"
          label="ジャンル"
          density="compact"
          hide-details
          clearable
          style="max-width: 150px; margin-right: 10px;"
        />

        <!-- ✅ チェックボックス（タイトルバー右端） -->
        <v-checkbox
          v-model="showOnlyOpen"
          label="営業中のみ"
          hide-details
          density="compact"
          style="margin-right: 10px;"
        />
      </v-app-bar>

      <!-- サイドバー -->
      <v-navigation-drawer v-model="drawer" width="300">
        <!-- ✅ registration-successful イベントをリッスン -->
        <RegisterSidebar @registration-successful="handleRegistrationSuccess" />
      </v-navigation-drawer>

      <!-- ✅ MapViewにrefを設定し、showOnlyOpen と selectedGenre を渡す -->
      <MapView ref="mapViewRef" :showOnlyOpen="showOnlyOpen" :selectedGenre="selectedGenre" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import MapView from './components/MapView.vue'
import RegisterSidebar from './components/RegisterSidebar.vue'

const drawer = ref(false)
const showOnlyOpen = ref(true) // ✅ デフォルトは「営業中のみ」
const mapViewRef = ref(null) // ✅ MapView コンポーネントへの参照
const selectedGenre = ref('') // ✅ 選択されたジャンル（空は全ジャンル）

// ✅ ジャンルリスト (valueがAPIのクエリ、textが表示用)
const genres = ref([
  { text: '全て', value: '' },
  { text: '和食', value: 'japanese' },
  { text: 'イタリアン', value: 'italian' },
  { text: '中華', value: 'chinese' },
  { text: '洋食', value: 'western' },
  { text: 'アジアン', value: 'asian' },
  { text: 'カフェ', value: 'cafe' },
  { text: '居酒屋', value: 'izakaya' },
  // 必要に応じて他のジャンルを追加
])

const toggleSidebar = () => {
  drawer.value = !drawer.value
}

// ✅ 登録成功時のハンドラー
const handleRegistrationSuccess = () => {
  drawer.value = false // サイドバーを閉じる
  if (mapViewRef.value) {
    mapViewRef.value.fetchStores() // MapView のデータ再取得メソッドを呼び出す
  }
}
</script>

