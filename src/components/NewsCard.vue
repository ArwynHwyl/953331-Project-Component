<script setup lang="ts">
// import { ref } from 'vue';
import type { NewsItem, NewsStatus } from '@/types';
import type { HomeNewsItem, DetailedNewsItem } from '@/types';
import {
  Scale, User, Calendar, MessageCircle, ChevronUp, ChevronDown,
  ShieldCheck, ShieldX, AlertTriangle, Clock
} from 'lucide-vue-next';

defineProps<{
  news: HomeNewsItem;
  comments: DetailedNewsItem[];
}>();

const getStatusInfo = (status: NewsStatus) => {
  switch (status) {
    case 'trusted':
      return {
        text: 'Verified Trust',
        icon: ShieldCheck,
        badgeClasses: 'bg-green-100 text-green-800',
        // borderClasses: 'border-[#B8E986] hover:border-[#00C950]'
        borderClasses: 'border-green-200 hover:border-green-500'
      };
    case 'fake':
      return {
        text: 'Verified Fake',
        icon: ShieldX,
        badgeClasses: 'bg-red-100 text-red-800',
        // borderClasses: 'border-[#E8BDBF] hover:border-[#A5212A]'
        borderClasses: 'border-red-200 hover:border-red-500'
      };
    case 'disputed':
      return {
        text: 'Disputed',
        icon: AlertTriangle,
        badgeClasses: 'bg-amber-100 text-amber-800',
        // borderClasses: 'border-[#FFE082] hover:border-[#FFA000]'
        borderClasses: 'border-amber-200 hover:border-amber-500'
      };
    default:
      return {
        text: 'Under Review',
        icon: Clock,
        badgeClasses: 'bg-gray-100 text-gray-800',
        borderClasses: 'border-gray-200 hover:border-gray-500'
      };
  }
};

const getVerdictBarBgClass = (news: HomeNewsItem) => {
  if (news.fakeVotes > news.trustVotes) {
    return 'bg-green-200'; // Background shows non-dominant trust votes (green)
  } else if (news.trustVotes > news.fakeVotes) {
    return 'bg-red-200';   // Background shows non-dominant fake votes (red)
  } else {
    return 'bg-gray-200';  // Neutral when tied
  }
};
// const getVerdictBarBgClass = (news: HomeNewsItem) => {
//   if (news.fakeVotes > news.trustVotes) {
//     return 'bg-red-200';  // Red background when fake votes dominate
//   } else if (news.trustVotes > news.fakeVotes) {
//     return 'bg-green-200'; // Green background when trust votes dominate
//   } else {
//     return 'bg-gray-200';  // Neutral gray when tied
//   }
// };
</script>

<template>
  <RouterLink class="no-underline text-slate-700" :to="{ name: 'news-detail', params: { id: news.id } }">
    <div
      class="bg-[#FFFEFE] rounded-lg border-l-7 p-6 mb-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] cursor-pointer"
      :class="getStatusInfo(news.status).borderClasses">
      <div class="flex flex-col sm:flex-row gap-6">
        <img :src="news.imageUrl || 'https://placehold.co/150x150'" :alt="news.title"
          class="w-full sm:w-36 h-36 object-cover rounded-lg">
        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-2">
            <h3 class="text-xl font-bold text-gray-800">{{ news.title }}</h3>
            <span
              class="flex-shrink-0 mt-2 sm:mt-0 sm:ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatusInfo(news.status).badgeClasses">
              <component :is="getStatusInfo(news.status).icon" :size="16" class="mr-1.5" />
              {{ getStatusInfo(news.status).text }}
            </span>
          </div>
          <p class="text-gray-600 mb-4">{{ news.shortDetail }}</p>
          <div class="text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <span class="flex items-center">
              <User :size="14" class="mr-1.5" />By {{ news.reporter }}
            </span>
            <span class="flex items-center">
              <Calendar :size="14" class="mr-1.5" />{{ news.timestamp }}
            </span>
            <span class="flex items-center">
              <MessageCircle :size="14" class="mr-1.5" />{{ news.commentCount }} comments
            </span>
          </div>
        </div>
      </div>
      <!-- Interactive Section (buttons are now static) -->
      <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
        <button
          class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
          <ChevronUp :size="16" class="text-green-600" /> Trust
          <span class="font-bold text-green-600 bg-green-100 px-2 rounded">{{ news.trustVotes }}</span>
        </button>
        <button
          class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
          <ChevronDown :size="16" class="text-red-600" /> Fake
          <span class="font-bold text-red-600 bg-red-100 px-2 rounded">{{ news.fakeVotes }}</span>
        </button>
        <button
          class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
          <Scale :size="16" /> Investigate
        </button>
      </div>
      <!-- Verdict Bar -->
      <div class="mt-6">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-semibold text-gray-600">Community Verdict</span>
          <span class="text-sm font-semibold text-gray-700">{{ news.totalVotesCount }} votes cast</span>
        </div>
        <div class="w-full rounded-full h-2.5 relative overflow-hidden" :class="getVerdictBarBgClass(news)">

          <!-- Trust votes -->
          <div v-if="news.trustVotes >= news.fakeVotes || news.fakeVotes === 0"
            class="bg-green-500 h-2.5 rounded-r-full absolute left-0 top-0"
            :style="{ width: `${news.totalVotesCount > 0 ? (news.trustVotes / news.totalVotesCount) * 100 : 0}%` }">
          </div>

          <!-- Fake votes -->
          <div v-if="news.fakeVotes >= news.trustVotes || news.trustVotes === 0"
            class="bg-red-500 h-2.5 rounded-l-full absolute right-0 top-0"
            :style="{ width: `${news.totalVotesCount > 0 ? (news.fakeVotes / news.totalVotesCount) * 100 : 0}%` }">
          </div>
        </div>
        <div class="flex justify-between text-sm font-bold mt-1">
          <span class="text-green-600">Trust ({{ news.trustVotes }})</span>
          <span class="text-red-600">Fake ({{ news.fakeVotes }})</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
