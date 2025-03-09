<template>
  <UPage  class="max-w-6xl mx-auto">
    <template #left>
      <UPageAside>
        <h2 class="mt-16 mb-4 text-lg font-semibold">
          Table of Contents
        </h2>
        <UNavigationMenu orientation="vertical" :items="navItems" />
      </UPageAside>
    </template>
    <template #default>
      <UPageBody>
        <UPageHeader id="article" class="mt-24">
            <div class="flex flex-row justify-between items-center">
              <h1 class="text-4xl font-bold dark:text-pink-400 text-pink-600">Game On!</h1>
              <div class="flex flex-col">
                <p>Posted: Mar 11, 2025</p>
                <p>Posted By: Braelynn Costanzo</p>
              </div>
            </div>
        </UPageHeader>
        <div class="flex flex-col gap-4">
          <h3 class="text-2xl" id="plan">The Plan</h3>
          <p>
            For this game project, I will use type-script. In this game, 
            I will be designing a game that incorporates fractions, risk 
            versus reward, and percentages. I plan to create a school-themed 
            game where you can choose between two options. One will be 
            safer with a lower reward, and one will be riskier with a chance 
            of a higher reward. 
          </p>
          <p>
            I will incorporate math by having a fraction on 
            both doors, for example, one with ⅘ and one with a ⅕. ⅘ is the safer 
            option, but might not have any reward. ⅕ is clearly the riskier option, 
            with a risk of dying, but you might also get a very high reward. 
          </p>
          <p>
            There will be different settings and modes you can set the game to, 
            such as instead of fractions, you can change it to percentages. If we get 
            far enough into the game, I would like to create an item shop where players 
            can spend their coins while playing the game. 
          </p>
          <h3 class="text-2xl" id="future">The Future</h3>
          <p>
            I think it would be cool 
            to create a leaderboard of all the player's highest scores. Another 
            feature I would like to incorporate into my game is an avatar editor. 
            Before entering the game, I would like to allow players to customize 
            what they look like, and I want them to also have the opportunity to 
            buy more clothes with tokens from the game. I would like to sell tokens 
            for US dollars to give players a chance to buy items. As you can see, 
            I have very high hopes for this game.
          </p>
          <p>
            In addition to that, I want to add achievements that players can earn 
            as they reach certain points in the game. This will encourage them to 
            keep playing and boost their overall experience. Each achievement will 
            come with unique rewards, unlocking special items or features in the game. 
          </p>
        </div>
        <UPageHeader id="research" class="mt-24">
          <h1 class="text-4xl font-bold text-(--ui-primary)">Research Questions</h1>
        </UPageHeader>
          <UAccordion :items="accordianItems">
            <template #content="{ item }">
              <p class="text-sm pb-3.5 text-(--ui-primary)">
                {{ item.content }}
              </p>
            </template>
          </UAccordion>

        <UPageHeader id="notes" class="mt-24">
          <h1 class="text-4xl font-bold text-(--ui-primary)">Research Notes & References</h1>
        </UPageHeader>
        <ResearchNote
          description="I was recommended to use Phaser 3 for my game engine. This gives me tools so that I don’t have to start from scratch. Phaser.io is a fun, free fast 2D game framework for making HTML5 for desktop and mobile web browsers supporting Canvas and WebGL rendering."
          link="https://phaser.io/"
          />
        <ResearchNote
          description="Since I'm using Phaser, I have a choice of Javascript or TypeScript. I chose TypeScript because it makes fixing bugs easier when there is a lot of code."
          link="https://www.typescriptlang.org/"
          />
        <ResearchNote
          description="Nuxt is a free and open source framework with an intuitive and extendable way to create type-safe, performant and production-grade full-stack web applications and websites with Vue.js. Using Nuxt helps create the website where the game will be hosted."
          link="https://nuxtjs.org/"
          />
        <ResearchNote
          description="Probability will be based off the door the player chooses. Fractions and decimals will be incorporated into the game. The player will have to choose between two doors, one with a higher chance of winning, but a lower reward, and one with a lower chance of winning, but a higher reward."
          />
        <ResearchNote
          description="I will use Visual Studio Code to write my code. Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications."
          link="https://code.visualstudio.com/"
          />
        <ResearchNote
          description="I will make a 2D game instead of 3D since it is much simpler and I am new to game development. 2D games are also easier to make and require less code. I will create a top-down view of the game."
          />
        <ResearchNote
          description="I will find school-themed game assets on itch.io. Itch.io is a website where you can find, sell, and share games and assets. I will use these assets to create the game."
          link="https://itch.io/"
          />
      </UPageBody>
    </template>
  </UPage>
</template>

<script lang="ts" setup>
import { UNavigationMenu, UPageHeader } from '#components';
import ResearchNote from '~/components/ResearchNote.vue';

const navItems = [
  {
    label: 'Article',
    icon: 'i-heroicons-newspaper',
    to: '#article',
  },
  {
    label: 'Research Questions',
    icon: 'i-heroicons-academic-cap',
    to: '#research'
  },
  {
    label: 'Research Notes',
    icon: 'i-heroicons-document-text',
    to: '#notes'
  }
]
const accordianItems = ref([
  {
    label: 'Who is your consumer?',
    content: 'My consumer will be ages 10-16'
  },
  {
    label: 'How will you find out if they like the game?',
    content: 'I will put the game out for beta testing to see if anyone enjoys it.'
  },
  {
    label: 'How much will the game cost to make?',
    content: 'For this prototype, it will cost nothing. I can use my dads webhosting and domain. which usually costs around $10 per month.'
  },
  {
    label: 'How will you advertise the game?',
    content: 'I will advertise the game on common websites for kids. I will also use social media to get the word out.'
  },
  {
    label: 'How much will you sell the game for?',
    content: 'I want this game to benefit kids, and them not having to worry about money, so my game will be free to all.'
  },
  {
    label: 'How much profit will you make?',
    content: 'To make profit, I will sell online items for money, such as power ups, which I don’t have an exact price for yet.'
  },
  {
    label: 'What problems might you run into? How might you solve them?',
    content: 'I might run into problems with errors in my code. I can fix this by problem solving, and checking my code for errors and problems.'
  },
  {
    label: 'How will you know if the game will be successful?',
    content: 'I will put my game out for beta testing to see what players like, and dislike.'
  },
  {
    label: 'What resources will you need?',
    content: 'I will need a computer, internet, webhosting, and a domain.'
  },
  {
    label: 'What about your prototype is successful?',
    content: 'In my prototype, my goal was to give players two choices with two doors, with one holding a reward, and the other with a risk of losing.'
  },
  {
    label: 'Who is your target audience for you game?',
    content: 'My target audience is kids/schools from ages 10-16.'
  },
  {
    label: 'What is new or unique about your game?',
    content: 'My game is new or unique because you can either choose from a safe option or a risky option.'
  },
  {
    label: 'How much does it cost to manufacture?',
    content: 'Currently, it has cost me nothing to manufacture. In the future, I will need to pay for webhosting and a domain, if the game needs to expand a lot, I might need to hire other programmers.'
  }
])
</script>

<style>

</style>