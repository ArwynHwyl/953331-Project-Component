<script setup lang="ts">
import { ref } from 'vue';
import {
  BadgeCheck, Scale, User, Calendar, MessageCircle, ChevronUp, ChevronDown
} from 'lucide-vue-next';
import type { NewsItem } from '@/types';
import newsData from '../../mockdb.json';

// สร้าง interface ใหม่เพื่อเพิ่มข้อมูลคะแนนโหวต
interface InteractiveNewsItem extends NewsItem {
  realVotes: number;
  fakeVotes: number;
}

// จำลองข้อมูลเริ่มต้นพร้อมคะแนนโหวต
const newsList = ref<InteractiveNewsItem[]>(newsData.news.map(news => ({
  ...news,
  realVotes: Math.floor(Math.random() * 500),
  fakeVotes: Math.floor(Math.random() * 50),
})));

//
const handleVote = (news: InteractiveNewsItem, voteType: 'real' | 'fake') => {
  if (voteType === 'real') {
    news.realVotes++;
  } else {
    news.fakeVotes++;
  }
};

//  timestamp
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Vote Stats
const getVoteStats = (news: InteractiveNewsItem) => {
  const totalVotes = news.realVotes + news.fakeVotes;
  if (totalVotes === 0) {
    return {
      totalVotes: 0,
      realPercentage: 0,
      realPercentageText: '0%'
    };
  }
  const realPercentage = (news.realVotes / totalVotes) * 100;
  return {
    totalVotes,
    realPercentage,
    realPercentageText: `${Math.round(realPercentage)}%`
  };
};
</script>

<template>
  <div>
    <!-- Filter Section -->
    <div class="flex items-center justify-between gap-2 mb-6 overflow-x-auto rounded-sm border border-gray-500" style="background-color: #DEDEDE;">
      <div class="flex items-center gap-2 min-w-max ml-2 py-3">
        <!-- Search Icon -->
        <i data-lucide="search" class="text-gray-400 dark:text-gray-500"></i>
        <!-- All News (Active) -->
        <button
          class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded"
        >
          <i data-lucide="globe" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">All News</span>
          <span
            class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600 transition-colors"
          >
            1
          </span>
        </button>
        <!-- Real -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="shield-check" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Real</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">1</span>
        </button>
        <!-- Fake -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="shield-x" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Fake</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">1</span>
        </button>
        <!-- Disputed -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="alert-triangle" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Disputed</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">1</span>
        </button>
        <!-- Under Review -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="clock" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Under Review</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">1</span>
        </button>
      </div>
      <!-- Per Page Dropdown (right aligned) -->
      <div class="flex items-center gap-1 ml-4 mr-4">
        <label for="per-page" class="text-sm text-gray-700">Show</label>
        <select id="per-page" class="border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span class="text-sm text-gray-700">per page</span>
      </div>
    </div>
    <!-- News list Card -->
     <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md">
    <div
      v-for="news in newsList"
      :key="news.id"
      class="bg-[#FFFEFE] rounded-lg border-l-7 p-6 mb-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] cursor-pointer border-[#E8BDBF] hover:border-[#A5212A]"
    >
      <div class="flex flex-col sm:flex-row gap-6">
        <img :src="news.imageUrl || 'https://placehold.co/150x150'" :alt="news.title" class="w-full sm:w-36 h-36 object-cover rounded-lg">
        <div class="flex-1">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold text-gray-800">{{ news.title }}</h3>
            <span v-if="getVoteStats(news).realPercentage >= 75" class="flex-shrink-0 ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <BadgeCheck :size="16" class="mr-1.5" />
              Verified Real
            </span>
          </div>
          <p class="text-gray-600 mb-4">{{ news.shortDetail }}</p>
          <div class="text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <span class="flex items-center"><User :size="14" class="mr-1.5"/>By {{ news.reporter }}</span>
            <span class="flex items-center"><Calendar :size="14" class="mr-1.5"/>{{ formatDate(news.timestamp) }}</span>
            <span class="flex items-center"><MessageCircle :size="14" class="mr-1.5"/>6 comments</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button @click="handleVote(news, 'real')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
              <ChevronUp :size="16" class="text-green-600"/> Real
              <span class="font-bold text-green-600 bg-green-100 px-2 rounded">{{ news.realVotes }}</span>
            </button>
            <button @click="handleVote(news, 'fake')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
              <ChevronDown :size="16" class="text-red-600"/> Fake
              <span class="font-bold text-red-600 bg-red-100 px-2 rounded">{{ news.fakeVotes }}</span>
            </button>
            <button class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
              <Scale :size="16"/> Investigate
            </button>
          </div>
        </div>
        <div class="hidden lg:flex flex-col items-end justify-start text-right flex-shrink-0 w-40">
            <div class="text-sm text-gray-500">
                <span class="font-bold text-green-600">{{ getVoteStats(news).realPercentageText }} verified</span>
                <p>{{ getVoteStats(news).totalVotes }} total votes</p>
            </div>
        </div>
      </div>
      <div class="mt-6">
        <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-semibold text-gray-600">Community Verdict</span>
            <span class="text-sm font-semibold text-red-600">{{ getVoteStats(news).totalVotes }} votes cast</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 relative">
          <div class="bg-[#A5212A] h-2.5 rounded-full" :style="{ width: `${getVoteStats(news).realPercentage}%` }"></div>
        </div>
        <div class="flex justify-between text-sm font-bold mt-1">
          <span class="text-green-600">Real ({{ news.realVotes }})</span>
          <span class="text-red-600">Fake ({{ news.fakeVotes }})</span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
