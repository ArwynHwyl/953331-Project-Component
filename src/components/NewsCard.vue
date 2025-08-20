<script setup lang="ts">
import { ref } from 'vue';
import type { HomeNewsItem, DetailedNewsItem } from '@/types';
defineProps<{
  news: HomeNewsItem;
  comments: DetailedNewsItem[];
}>();
</script>

<template>
  <RouterLink
    class="no-underline text-slate-700"
    :to="{ name: 'news-detail', params: { id: String(news.id), comments: String(comments.map(c => c.id)) } }"
  >
      <div class="bg-[#FFFEFE] rounded-lg border-l-7 p-6 mb-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] cursor-pointer border-[#E8BDBF] hover:border-[#A5212A]">
        <div class="flex flex-col sm:flex-row gap-6">
          <img :src="news.imageUrl || 'https://placehold.co/150x150'" :alt="news.title" class="w-full sm:w-36 h-36 object-cover rounded-lg">
          <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-gray-800">{{ news.title }}</h3>
            </div>
            <p class="text-gray-600 mb-4">{{ news.shortDetail }}</p>
            <div class="text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <span class="flex items-center">By {{ news.reporter }}</span>
              <span class="flex items-center">{{ news.timestamp }}</span>
              <span class="flex items-center">{{ news.commentCount }} comments</span>
            </div>
          </div>
        </div>
        <!-- Interactive Section (buttons are now static) -->
        <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <button class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            Trust
            <span class="font-bold text-green-600 bg-green-100 px-2 rounded">{{ news.trustVotes }}</span>
          </button>
          <button class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            Fake
            <span class="font-bold text-red-600 bg-red-100 px-2 rounded">{{ news.fakeVotes }}</span>
          </button>
          <button class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            Investigate
          </button>
        </div>
        <!-- Verdict Bar -->
        <div class="mt-6">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-semibold text-gray-600">Community Verdict</span>
            <span class="text-sm font-semibold text-gray-700">{{ news.totalVotesCount }} votes cast</span>
          </div>
          <div class="w-full bg-red-200 rounded-full h-2.5 relative">
            <div class="bg-green-500 h-2.5 rounded-full" :style="{ width: `${news.totalVotesCount > 0 ? (news.trustVotes / news.totalVotesCount) * 100 : 0}%` }"></div>
          </div>
          <div class="flex justify-between text-sm font-bold mt-1">
            <span class="text-green-600">Trust ({{ news.trustVotes }})</span>
            <span class="text-red-600">Fake ({{ news.fakeVotes }})</span>
          </div>
        </div>
      </div>
  </RouterLink>
</template>
