<script setup lang="ts">
import { computed } from 'vue';
import NewsService from '@/services/NewsService';
import type { NewsItem, HomeNewsItem } from '@/types';
import { ref, onMounted } from 'vue';
import NewsCard from '@/components/NewsCard.vue';
import { createIcons, icons } from 'lucide'

const news = ref<HomeNewsItem[]>([]);

const totalVotes = computed(() =>
  news.value.reduce((sum, item) => sum + (item.fakeVotes ?? 0) + (item.trustVotes ?? 0), 0)
);
const totalComments = computed(() =>
  news.value.reduce((sum, item) => sum + (item.commentCount ?? 0), 0)
);

onMounted(() => {
  NewsService.getNews()
    .then(response => {
      news.value = response.data.map((item: any) => ({
        ...item,
        fakeVotes: item.fakeVotes ?? 0,
        trustVotes: item.trustVotes ?? 0,
        totalVotesCount: item.totalVotesCount ?? 0,
        commentCount: item.commentCount ?? 0,
        status: item.status ?? 'under-review'
      })) as HomeNewsItem[];
    })
    .catch(error => {
      console.error('Error fetching news:', error);
    });
});
</script>

<template>
  <main class="min-h-screen p-4 sm:p-6 lg:p-8" style="background-color: #D5D5D5">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">{{ totalVotes }}</div>
          <div class="text-2xl sm:text-base font-bold">Total Votes</div>
        </div>
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">{{ news.length }}</div>
          <div class="text-2xl sm:text-base font-bold">News</div>
        </div>
        <div class="bg-[#312E2F] text-white rounded-md p-6 text-center">
          <div class="text-3xl sm:text-4xl font-bold">{{ totalComments }}</div>
          <div class="text-2xl sm:text-base font-bold">Comments</div>
        </div>
      </div>

      <!-- Filter , NewsList -->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md">
  <NewsCard v-for="item in news" :key="item.id" :news="item" />
      </div>
    </div>
  </main>
</template>
