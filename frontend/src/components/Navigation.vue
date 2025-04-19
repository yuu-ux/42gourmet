<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
  }
})

const emit = defineEmits(['update:modelValue'])
</script>
<template>
  <v-navigation-drawer :width="500" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-list-item link title="店舗登録"></v-list-item>
    <v-list-item link title="店舗検索"></v-list-item>
  </v-navigation-drawer>
</template>
<style scoped lang="scss">
</style>