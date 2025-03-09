<script setup lang="ts">

const links = ref([
  {
    label: 'Play Now!',
    to: '/play',
    icon: 'i-heroicons-play-circle',
  },
  {
    label: 'Learn more',
    to: '/about',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-heroicons-arrow-right'
  }
])
</script>

<template>
    <UPageHero title="School Escape" 
        description="School escape is a fun, educational, and interactive learning game that incorperates fractions and percentages by forcing the player to learn about risk versus reward."
        :links
        orientation="horizontal"
     >
     <img src="~/assets/hero.png" alt="School Escape" class="" />
     </UPageHero>

</template>