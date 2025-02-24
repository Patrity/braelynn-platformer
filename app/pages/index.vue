<script setup lang="ts">

const links = ref([
  {
    label: 'Play Now!',
    to: '/getting-started',
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
    <UPageHero title="Braelynn's Game" 
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec orci urna, feugiat eget tempor id, 
        elementum ac diam. In sollicitudin, metus vel ultricies consequat, orci eros vehicula arcu, vel efficitur magna 
        mi sit amet lectus. Cras eu tincidunt urna, quis interdum massa. Integer ut arcu metus. Duis ultricies lectus 
        dui, a mollis tortor venenatis eu."
        :links
     />

</template>