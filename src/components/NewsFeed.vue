<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import type { HomeNewsItem, NewsStatus } from '@/types';
import db from '../../db.json';
import { Scale, User, Calendar, MessageCircle, ChevronUp, ChevronDown,
  ShieldCheck, ShieldX, AlertTriangle, Clock
} from 'lucide-vue-next';

const newsStore = useNewsStore();
const router = useRouter();

// Helper function to determine news status based on votes
function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total < 10) return 'under-review'; // Needs at least 10 votes to be classified
  const trustRatio = trust / total;
  if (trustRatio >= 0.7) return 'trusted';
  if (trustRatio <= 0.3) return 'fake';
  return 'disputed';
}

// Function to count disputed news (exposed to template)
const getDisputedNewsCount = () => {
  return formattedNewsList.value.filter(news => {
    const t = news.trustVotes;
    const f = news.fakeVotes;
    const total = t + f;
    if (total === 0) return false;
    if (t === f) return true;
    const trustRatio = t / total;
    const fakeRatio = f / total;
    return (
      (trustRatio >= 0.45 && trustRatio <= 0.55) ||
      (fakeRatio >= 0.45 && fakeRatio <= 0.55)
    );
  }).length;
};

// Computed property to format news data from db and combine with store data
const formattedNewsList = computed((): HomeNewsItem[] => {
  return db.news.map(newsItem => {
    const originalComments = db.comments.filter(c => c.newsId === newsItem.id);
    const newComments = newsStore.getNewCommentsByNewsId(newsItem.id);
    const allComments = [...originalComments, ...newComments];

    const trustVotes = allComments.filter(c => c.vote === 'trust').length;
    const fakeVotes = allComments.filter(c => c.vote === 'fake').length;
    const totalVotesCount = trustVotes + fakeVotes;
    const status = getNewsStatus(fakeVotes, trustVotes);

    return {
      ...newsItem,
      trustVotes,
      fakeVotes,
      totalVotesCount,
      commentCount: allComments.length,
      status,
    };
  });
});

// Function to handle voting by calling the store action
const handleVote = (newsId: number, voteType: 'trust' | 'fake') => {
  newsStore.addVote({
    newsId: newsId,
    userId: 'currentUser', // NOTE: Using a placeholder user ID
    vote: voteType,
    text: `Voted '${voteType}' on this news.`, // Placeholder comment
    imageUrl: null,
  });
};

const navigateToDetail = (newsId: number) => {
  router.push({ name: 'news-detail', params: { id: newsId } });
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusInfo = (status: NewsStatus) => {
  switch (status) {
    case 'trusted':
      return { text: 'Verified Trust', icon: ShieldCheck, color: 'green' };
    case 'fake':
      return { text: 'Verified Fake', icon: ShieldX, color: 'red' };
    case 'disputed':
      return { text: 'Disputed', icon: AlertTriangle, color: 'orange' };
    case 'under-review':
    default:
      return { text: 'Under Review', icon: Clock, color: 'gray' };
  }
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
            {{ formattedNewsList.length }}
          </span>
        </button>
        <!-- Real -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="shield-check" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Real</span>
                    <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">{{ formattedNewsList.filter(news => news.trustVotes > news.fakeVotes).length }}</span>
        </button>
        <!-- Fake -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="shield-x" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Fake</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">{{ formattedNewsList.filter(news => news.trustVotes < news.fakeVotes).length }}</span>
        </button>
        <!-- Disputed -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="alert-triangle" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Disputed</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
            {{ getDisputedNewsCount() }}
          </span>
        </button>
        <!-- Under Review -->
        <button class="group flex items-center px-4 py-2 text-sm font-semibold text-black bg-[#D9D9D9] border border-gray-500 hover:bg-red-700 transition-colors whitespace-nowrap rounded">
          <i data-lucide="clock" class="mr-2 text-black group-hover:text-white transition-colors"></i>
          <span class="group-hover:text-white">Under Review</span>
          <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
            {{ formattedNewsList.filter(news => (news.trustVotes + news.fakeVotes) === 0).length }}
          </span>
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
        v-for="news in formattedNewsList"
        :key="news.id"
        class="bg-[#FFFEFE] rounded-lg border-l-7 p-6 mb-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01] cursor-pointer border-[#E8BDBF] hover:border-[#A5212A]"
        :class="`border-${getStatusInfo(news.status).color}-500`"
      >
        <div @click="navigateToDetail(news.id)" class="cursor-pointer">
          <div class="flex flex-col sm:flex-row gap-6">
            <img :src="news.imageUrl || 'https://placehold.co/150x150'" :alt="news.title" class="w-full sm:w-36 h-36 object-cover rounded-lg">
            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold text-gray-800">{{ news.title }}</h3>
                <span class="flex-shrink-0 ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="`bg-${getStatusInfo(news.status).color}-100 text-${getStatusInfo(news.status).color}-800`">
                  <component :is="getStatusInfo(news.status).icon" :size="16" class="mr-1.5" />
                  {{ getStatusInfo(news.status).text }}
                </span>
              </div>
              <p class="text-gray-600 mb-4">{{ news.shortDetail }}</p>
              <div class="text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                <span class="flex items-center"><User :size="14" class="mr-1.5"/>By {{ news.reporter }}</span>
                <span class="flex items-center"><Calendar :size="14" class="mr-1.5"/>{{ formatDate(news.timestamp) }}</span>
                <span class="flex items-center"><MessageCircle :size="14" class="mr-1.5"/>{{ news.commentCount }} comments</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Section -->
        <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          <button @click.stop="handleVote(news.id, 'trust')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            <ChevronUp :size="16" class="text-green-600"/> Trust
            <span class="font-bold text-green-600 bg-green-100 px-2 rounded">{{ news.trustVotes }}</span>
          </button>
          <button @click.stop="handleVote(news.id, 'fake')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            <ChevronDown :size="16" class="text-red-600"/> Fake
            <span class="font-bold text-red-600 bg-red-100 px-2 rounded">{{ news.fakeVotes }}</span>
          </button>
          <button @click.stop="navigateToDetail(news.id)" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
            <Scale :size="16"/> Investigate
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
    </div>
  </div>
</template>
