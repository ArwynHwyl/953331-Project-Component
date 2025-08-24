<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <header
    v-if="!$route.path.startsWith('/news/') || $route.path === '/news'"
    class="flex flex-col items-center py-2 px-10 w-full bg-[#c1c1c1] -mt-8"
  >
    <img
      src="@/assets/forwhite.png"
      alt="Logo"
      class="h-[3.25rem] mt-8 mx-auto"
    />
  </header>
  <div class="dark">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
