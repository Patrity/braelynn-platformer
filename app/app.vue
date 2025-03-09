<template>
  <UApp>
    <NuxtLayout />
  </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

onMounted(() => {
  colorMode.value = 'dark'
})
</script>
