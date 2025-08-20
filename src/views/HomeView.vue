<script setup lang="ts">
const totalRealNews = computed(() =>
  news.value.filter(item => item.trustVotes > item.fakeVotes).length
);
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

onMounted(async () => {
  try {
    const [newsRes, commentsRes] = await Promise.all([
      NewsService.getNews(),
      NewsService.getAllComments()
    ]);
    console.log('newsRes.data', newsRes.data);
    const allComments = commentsRes.data;
    news.value = newsRes.data.map((item: any) => {
      const newsComments = allComments.filter((c: any) => c.newsId === item.id);
      const fakeVotes = newsComments.filter((c: any) => c.vote === 'fake').length;
      const trustVotes = newsComments.filter((c: any) => c.vote === 'trust').length;
      const commentCount = newsComments.length;
      return {
        ...item,
        fakeVotes,
        trustVotes,
        totalVotesCount: fakeVotes + trustVotes,
        commentCount,
        status: item.status ?? 'under-review'
      };
    }) as HomeNewsItem[];
  } catch (error) {
    console.error('Error fetching news or comments:', error);
  }
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
          <div class="text-3xl sm:text-4xl font-bold">{{ totalRealNews }}</div>
          <div class="text-2xl sm:text-base font-bold">Real</div>
        </div>
      </div>

      <!-- Filter -->

      <!-- Card Item-->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md">
        <NewsCard v-for="item in news" :key="item.id" :news="item" :comments="[]" />
      </div>
    </div>
  </main>
</template>
