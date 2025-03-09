<template>
  <div class="mt-4">
    <div class="flex flex-row gap-2 items-center mb-1">
      <UIcon name="i-eos-icons-three-dots-loading" size="xl" />
      <p>{{ description }}</p>
    </div>
    <UButton v-if="link" :to="link" target="_blank" variant="ghost" label="Reference" trailing-icon="i-heroicons-solid-external-link" />
  </div>
</template>

<script setup lang="ts">
import { UButton, UIcon } from '#components';

const props = defineProps<{
  description: string
  link: string
}>()
</script>