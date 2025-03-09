<template>
  <UModal
    title="How To Play!"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }">
    <UButton size="xl" label="How To Play" />
    <template #body>
      <ul class="list-disc list-inside">
        <li>
          Use 
          <UKbd value="arrowleft" size="lg" />
          <UKbd value="arrowup"  size="lg"/>
          <UKbd value="arrowdown"  size="lg"/>
          <UKbd value="arrowright"  size="lg"/>
          to move
        </li>
        <li>Collect points by choosing doors</li>
        <ul class="list-disc list-inside ml-6">
          <li>Press <UKbd size="lg">E</UKbd> near a door or click to choose it</li>
          <li>Higher chance doors give lower points</li>
          <li>Riskier doors give more points</li>
        </ul>
        <li>Once you die, you will restart with 0 points</li>
        <li>Press R to reset the game</li>
      </ul>
    </template>
  </UModal>
</template>