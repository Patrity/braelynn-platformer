<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
    label: 'Home',
    to: '/',
    icon: 'i-heroicons-home-20-solid',
    active: route.path === '/'
}, {
    label: 'Play Now',
    to: '/play',
    icon: 'i-heroicons-play-circle',
    active: route.path.startsWith('/play')
}, {
    label: 'About',
    to: '/about',
    icon: 'i-heroicons-book-open',
    active: route.path.startsWith('/about')
}, {
    label: 'Code',
    to: 'https://github.com/Patrity/braelynn-platformer/',
    target: '_blank',
    icon: 'i-mdi-github'
}
])
</script>

<template>
    <UHeader>
        <template #title>
            <h1 class="text-2xl font-bold text-pink-600 dark:text-pink-400">Game On!</h1>
        </template>
        <UNavigationMenu :items="items" />
        <template #right>
            <UColorModeSwitch />
        </template>
        <template #content>
            <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
        </template>
    </UHeader>
    <UMain>
        <NuxtPage />
    </UMain>
</template>