<script setup lang="ts">
import { computed } from 'vue';
import NewsService from '@/services/NewsService';
import type { NewsStatus, HomeNewsItem } from '@/types';
import { ref, onMounted } from 'vue';
import NewsCard from '@/components/NewsCard.vue';
import { User, ShieldCheck, ShieldX, AlertTriangle, Clock, Search } from 'lucide-vue-next';

const news = ref<HomeNewsItem[]>([]);
const filterType = ref<'all' | 'real' | 'fake' | 'disputed' | 'under-review'>('all');
const filteredNews = computed(() => {
  switch (filterType.value) {
    case 'real':
      return news.value.filter(item => item.trustVotes > item.fakeVotes);
    case 'fake':
      return news.value.filter(item => item.trustVotes < item.fakeVotes);
    case 'disputed':
      return news.value.filter(item => item.trustVotes === item.fakeVotes && (item.trustVotes + item.fakeVotes) > 0);
    case 'under-review':
      return news.value.filter(item => (item.trustVotes + item.fakeVotes) === 0);
    case 'all':
    default:
      return news.value;
  }
});

const totalRealNews = computed(() =>
  news.value.filter(item => item.trustVotes > item.fakeVotes).length
);

const totalVotes = computed(() =>
  news.value.reduce((sum, item) => sum + (item.fakeVotes ?? 0) + (item.trustVotes ?? 0), 0)
);

function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total === 0) return 'under-review';
  const trustRatio = trust / total;
  if (trustRatio >= 0.55) return 'trusted';
  if (trustRatio <= 0.45) return 'fake';
  if (trustRatio > 0.45 && trustRatio < 0.55) return 'disputed';
  // fallback (should not reach here)
  return 'disputed';
}

onMounted(async () => {
  try {
    const [newsRes, commentsRes] = await Promise.all([
      NewsService.getNews(),
      NewsService.getAllComments()
    ]);
    const allComments = commentsRes.data as import('@/types').Comment[];
    news.value = (newsRes.data as import('@/types').NewsItem[]).map((item) => {
      const newsComments = allComments.filter((c) => c.newsId === item.id);
      const fakeVotes = newsComments.filter((c) => c.vote === 'fake').length;
      const trustVotes = newsComments.filter((c) => c.vote === 'trust').length;
      const commentCount = newsComments.length;
      return {
        ...item,
        fakeVotes,
        trustVotes,
        totalVotesCount: fakeVotes + trustVotes,
        commentCount,
        status: getNewsStatus(fakeVotes, trustVotes)
      };
    });
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
      <div class="flex items-center justify-between gap-2 mb-6 overflow-x-auto rounded-sm border border-gray-500"
        style="background-color: #DEDEDE;">
        <div class="flex items-center gap-2 min-w-max ml-2 py-3">
          <!-- Search Icon -->
          <Search :size="18" class="text-gray-400 dark:text-gray-500 mr-2" />
          <!-- All News (Active) -->
          <button @click="filterType = 'all'"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 transition-colors whitespace-nowrap rounded', filterType === 'all' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <User :size="18" class="mr-2 text-black group-hover:text-white transition-colors" />
            <span class="group-hover:text-white">All News</span>
            <span
              class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600 transition-colors">
              {{ news.length }}
            </span>
          </button>
          <!-- Real -->
          <button @click="filterType = 'real'"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 transition-colors whitespace-nowrap rounded', filterType === 'real' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <ShieldCheck :size="18" class="mr-2 text-black group-hover:text-white transition-colors" />
            <span class="group-hover:text-white">Real</span>
            <span
              class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">{{
                news.filter(item => item.trustVotes > item.fakeVotes).length }}</span>
          </button>
          <!-- Fake -->
          <button @click="filterType = 'fake'"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 transition-colors whitespace-nowrap rounded', filterType === 'fake' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <ShieldX :size="18" class="mr-2 text-black group-hover:text-white transition-colors" />
            <span class="group-hover:text-white">Fake</span>
            <span
              class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">{{
                news.filter(item => item.trustVotes < item.fakeVotes).length }}</span>
          </button>
          <!-- Disputed -->
          <button @click="filterType = 'disputed'"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 transition-colors whitespace-nowrap rounded', filterType === 'disputed' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <AlertTriangle :size="18" class="mr-2 text-black group-hover:text-white transition-colors" />
            <span class="group-hover:text-white">Disputed</span>
            <span
              class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{news.filter(item => item.trustVotes === item.fakeVotes && (item.trustVotes + item.fakeVotes) >
              0).length }}
            </span>
          </button>
          <!-- Under Review -->
          <button @click="filterType = 'under-review'"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 transition-colors whitespace-nowrap rounded', filterType === 'under-review' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <Clock :size="18" class="mr-2 text-black group-hover:text-white transition-colors" />
            <span class="group-hover:text-white">Under Review</span>
            <span
              class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{news.filter(item => (item.trustVotes + item.fakeVotes) === 0).length}}
            </span>
          </button>
        </div>
        <!-- Pagination -->
        <!-- <div class="flex items-center gap-1 ml-4 mr-4">
          <label for="per-page" class="text-sm text-gray-700">Show</label>
          <select id="per-page"
            class="border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span class="text-sm text-gray-700">per page</span>
        </div> -->
      </div>
      <!-- Card Item-->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md">
        <NewsCard v-for="item in filteredNews" :key="item.id" :news="item" :comments="[]" />
      </div>
    </div>
  </main>
</template>
