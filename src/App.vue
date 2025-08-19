<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header
    v-if="!$route.path.startsWith('/news/') || $route.path === '/news'"
    class="flex flex-col items-center py-2 px-10 w-auto"
    style="background-color: #c1c1c1; margin-left: -2rem; margin-right: -2rem; margin-top: -2rem"
  >
    <img
      src="@/assets/forwhite.png"
      alt="Logo"
      class="h-13 mt-8 mx-auto"
    />
  </header>
  <div class="dark">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
