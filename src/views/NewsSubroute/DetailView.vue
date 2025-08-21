<script setup lang="ts">

import NewsDetail from '@/components/NewsDetail.vue'

defineProps<{
  id: string
}>()
</script>
<template>
  <main class="min-h-screen bg-[#D5D5D5] p-4 sm:p-8">
    <div class="max-w-4xl mx-auto ">
      <div class="mb-8">
        <router-link to="/"
          class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Back to News List</span>
        </router-link>
      </div>
      <NewsDetail :id="Number(id)" />
      <!-- Tabs for switching between Comment and Vote views -->
      <div class="my-6 border-b border-gray-300">
        <nav class="flex -mb-px space-x-6 " aria-label="Tabs">
          <router-link
            :to="{ name: 'comment-view', params: { id } }"
            class="px-1 py-3 text-sm font-medium border-b-2"
            active-class="border-red-600 text-red-600"
            inactive-class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Comments
          </router-link>
          <router-link
            :to="{ name: 'vote-view', params: { id } }"
            class="px-1 py-3 text-sm font-medium border-b-2"
            active-class="border-red-600 text-red-600"
            inactive-class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Vote & Add Comment
          </router-link>
        </nav>
      </div>
      <RouterView />
    </div>

  </main>
</template>
<style></style>
