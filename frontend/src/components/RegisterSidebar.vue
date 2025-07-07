<template>
  <div style="padding: 20px">
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
      <p v-if="selectedPlace.opening_hours">
        営業時間: {{ selectedPlace.opening_hours.weekday_text.join(" / ") }}
      </p>
      <p v-if="selectedPlace.price_level">
        価格帯: {{ "¥".repeat(selectedPlace.price_level) }}
      </p>

      <v-select
        v-model="genre"
        :items="genreOptions"
        label="食事ジャンル"
        dense
		item-title="title"
		item-value="value"
        class="mt-3"
      ></v-select>

      <v-select
        v-model="reason"
        :items="reasonOptions"
        label="おすすめ理由"
        dense
		multiple
		item-title="title"
		item-value="value"
        class="mt-3"
      ></v-select>

      <v-select
        v-model="price"
        :items="priceOptions"
        label="価格帯"
        dense
        class="mt-3"
		item-title="title"
        item-value="value"
      />

      <v-btn color="success" block class="mt-4" @click="registerStore"
        >登録する</v-btn
      >
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { genreOptions, reasonOptions, priceOptions } from "@/config/options";


const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const searchQuery = ref("");
const searchResults = ref([]);
const selectedPlace = ref(null);

const genre = ref(null);
const reason = ref(null);
const price = ref(null);

const map = ref(null);

const emit = defineEmits(["store-registered"]);

const loadMapReference = () => {
  if (!map.value) {
    map.value = new google.maps.Map(document.createElement("div"));
  }
};

const searchPlace = () => {
  loadMapReference();

  if (!searchQuery.value) return;

  const service = new google.maps.places.PlacesService(map.value);
  service.textSearch({ query: searchQuery.value }, (results, status) => {
    if (
      status !== google.maps.places.PlacesServiceStatus.OK ||
      !results.length
    ) {
      alert("検索結果がありません");
      return;
    }
    searchResults.value = results;
  });
};

const selectPlace = async (place) => {
  const getDetailsPromise = (placeId) => {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(map.value);
      service.getDetails({ placeId }, (details, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(details);
        } else {
          reject(new Error("getDetails に失敗しました"));
        }
      });
    });
  };

  if (!place || !place.place_id) {
    alert("このお店の情報が取得できません。別のお店を選んでください。");
    return;
  }

  loadMapReference();

  const details = await getDetailsPromise(place.place_id);

    if (!details.geometry || !details.name || !details.formatted_address) {
      alert("このお店の情報が不足しています。別のお店を選んでください。");
      return;
    }

    const lat = details.geometry.location.lat();
    const lng = details.geometry.location.lng();
    const jaAddress = await fetchJapaneseAddress(lat, lng);

    selectedPlace.value = {
      name: details.name,
      formatted_address: jaAddress,
      opening_hours: details.opening_hours ? details.opening_hours : null,
      geometry: details.geometry,
    };

    searchResults.value = [];
};

const fetchJapaneseAddress = async (lat, lng) => {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ja&key=${API_KEY}`
  );
  const data = await res.json();
  return data.results?.[0]?.formatted_address || "住所不明";
}

const registerStore = async () => {
  if (!genre.value || !reason.value || !price.value) {
    alert("ジャンル・理由・価格帯をすべて選択してください。");
    return;
  }
  try {
    const response = await fetch("http://localhost:3000/api/stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: selectedPlace.value.name,
        address: selectedPlace.value.formatted_address,
        latitude: selectedPlace.value.geometry.location.lat(),
        longitude: selectedPlace.value.geometry.location.lng(),
        price_level: price.value,
        genre: genre.value,
		reason: JSON.stringify(reason.value),
        operation_hours: selectedPlace.value.opening_hours
          ? parseOpeningHours(selectedPlace.value.opening_hours.weekday_text)
          : [],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`サーバーエラー: ${response.status} ${errText}`);
    }

    alert("登録完了しました！");
    emit("store-registered");

    selectedPlace.value = null;
    searchQuery.value = "";
    searchResults.value = [];
    genre.value = null;
    reason.value = null;
    price.value = null;
  } catch (error) {
    console.error("📡 店舗登録エラー:", error.message, error.stack);
    alert("登録に失敗しました: " + error.message);
  }
};

const convertTo24Hour = (timeStr, suffix) => {
  if (!timeStr || !suffix) {
    console.warn("Invalid time input:", timeStr, suffix);
    return "00:00";
  }

  let [hour, minute] = timeStr.split(":").map(Number);

  if (isNaN(hour) || isNaN(minute)) {
    console.warn("Invalid time format:", timeStr);
    return "00:00";
  }

  if (suffix.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (suffix.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

const parseOpeningHours = (weekdayText) => {
  try {
    if (!Array.isArray(weekdayText)) {
      console.warn("Invalid weekdayText format:", weekdayText);
      return [];
    }

    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const result = [];

    for (const entry of weekdayText) {
      if (typeof entry !== "string") {
        console.warn("Invalid entry format:", entry);
        continue;
      }
      const normalizedEntry = entry
        .replace(/[\u202F\u2009\u00A0]/g, " ")
        .replace(/[–—ー−]/g, "-")
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+/g, " ")
        .trim();

      const match = normalizedEntry.match(/^([A-Za-z]+):\s*(.+)$/);
      if (!match) continue;

      const dayString = match[1];
      const timeRanges = match[2];
      if (!validDays.includes(dayString)) continue;
      if (timeRanges.toLowerCase().includes("closed")) continue;

      const ranges = timeRanges.split(",").map((r) => r.trim());

      for (const range of ranges) {
        const timeMatch = range.match(
          /(\d{1,2}:\d{2})(?:\s*(AM|PM))?-(\d{1,2}:\d{2})(?:\s*(AM|PM))?/i,
        );
        if (!timeMatch) {
          console.warn("⛔ 不明な時間形式:", range);
          continue;
        }

        let [, open, openSuffix, close, closeSuffix] = timeMatch;

        if (!openSuffix && closeSuffix) openSuffix = closeSuffix;
        if (!closeSuffix && openSuffix) closeSuffix = openSuffix;
        if (!openSuffix && !closeSuffix) openSuffix = closeSuffix = "AM";

        const openTime = convertTo24Hour(open, openSuffix);
        const closeTime = convertTo24Hour(close, closeSuffix);

        result.push({
          day_of_week: dayString,
          open_time: openTime,
          close_time: closeTime,
        });
      }
    }

    return result;
  } catch (e) {
    console.error("parseOpeningHours で例外:", e);
    return [];
  }
};
</script>
