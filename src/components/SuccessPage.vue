<template>
  <div class="overlay success">
    <div class="success__wrap">
      <button class="success__btn-close" @click="$emit('close')"></button>
      <p class="success__descr">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  close: []
}>()
</script>
<style scoped lang="scss">
@use '../assets/scss/success';
</style>