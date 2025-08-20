<script setup lang="ts">
import NewsDetail from '@/components/NewsDetail.vue'
</script>
<template>
  <main class="min-h-screen bg-[#D5D5D5] p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
      <router-link
      to="/"
      class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
      >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-4 w-4"
      >
        <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
      <span>Back to News List</span>
      </router-link>
      </div>
      <NewsDetail />
    </div>
  </main>
</template>

<style></style>
