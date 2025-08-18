<script setup lang="ts">
import NewsFeed from '@/components/NewsFeed.vue';
import { createIcons, icons } from 'lucide'
import { onMounted } from 'vue';
onMounted(() => {
  // Logic to run when the component is mounted
  createIcons({ icons });
});
</script>

<template>
  <header
    class="flex flex-col items-center py-2 px-10 w-auto"
    style="background-color: #c1c1c1; margin-left: -2rem; margin-right: -2rem; margin-top: -2rem"
  >
    <img
      src="C:\Users\sattaya_m\953331-Project-Component\src\assets\forwhite.png"
      alt="Logo"
      class="h-13 mt-8 mx-auto"
    />
  </header>
  <main class="min-h-screen p-4 sm:p-6 lg:p-8" style="background-color: #D5D5D5">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">1,000</div>
          <div class="text-2xl sm:text-base font-bold">Total Votes</div>
        </div>
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">98</div>
          <div class="text-2xl sm:text-base font-bold">News</div>
        </div>
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">40</div>
          <div class="text-2xl sm:text-base font-bold">Real</div>
        </div>
      </div>

      <!-- Filter , NewsList -->
      <NewsFeed/>
    </div>
  </main>
</template>
