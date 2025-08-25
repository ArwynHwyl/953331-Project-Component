<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNewsStore } from '@/stores/news';
import type { DetailedNewsItem, NewsStatus, Comment } from '@/types';
import NewsService from '@/services/NewsService';
import {
  User, Calendar, ChevronUp, ChevronDown, ShieldCheck, ShieldX, AlertTriangle, Clock, MessageCircle, ThumbsUp
} from 'lucide-vue-next';

// Define props
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const newsId = computed(() => props.id)

const newsStore = useNewsStore();
const likedComments = ref<Set<number>>(new Set()); // Track liked comments

// Helper function to determine news status
function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total === 0) return 'under-review';
  const trustRatio = trust / total;
  if (trustRatio >= 0.55) return 'trusted';
  if (trustRatio <= 0.45) return 'fake';
  if (trustRatio > 0.45 && trustRatio < 0.55) return 'disputed';
  return 'disputed';
}

import { onMounted, watch, reactive } from 'vue';

const state = reactive({
  news: null as DetailedNewsItem | null,
  comments: [] as Comment[],
  loading: true,
  error: ''
});

async function fetchNewsDetail() {
  state.loading = true;
  state.error = '';
  // Use props.id instead of route.params.id

  try {
    const newsRes = await NewsService.getNewsById(newsId.value);
    const newsArray = newsRes.data as DetailedNewsItem[];
    const baseNews = newsArray.length > 0 ? newsArray[0] : null;

    if (!baseNews) {
      state.news = null;
      state.comments = [];
      state.loading = false;
      return;
    }

    // fetch comments
    const commentsRes = await NewsService.getCommentsByNewsId(newsId.value);
    const originalComments = commentsRes.data as Comment[];
    const newComments = newsStore.getNewCommentsByNewsId(newsId.value);
    const allComments = [...originalComments, ...newComments];
    const trustVotes = allComments.filter(c => c.vote === 'trust').length;
    const fakeVotes = allComments.filter(c => c.vote === 'fake').length;
    const status = getNewsStatus(fakeVotes, trustVotes);
    state.news = {
      ...baseNews,
      trustVotes,
      fakeVotes,
      totalVotesCount: trustVotes + fakeVotes,
      commentCount: allComments.length,
      status,
    };
    state.comments = allComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    state.error = 'Failed to load news detail.';
    state.news = null;
    state.comments = [];
  } finally {
    state.loading = false;
  }
}

onMounted(fetchNewsDetail);
// Watch props.id instead of route.params.id
watch([() => props.id, () => newsStore.newComments], fetchNewsDetail, { deep: true });

// Function to handle comment likes
const handleLike = (commentId: number) => {
  if (likedComments.value.has(commentId)) {
    likedComments.value.delete(commentId);
  } else {
    likedComments.value.add(commentId);
  }
};

// Function to get like count for a comment
const getLikeCount = (commentId: number) => {
  const baseLikes = (commentId * 3 + 5) % 25;
  return likedComments.value.has(commentId) ? baseLikes + 1 : baseLikes;
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// Helper for status display
const getStatusInfo = (status: NewsStatus) => {
  switch (status) {
    case 'trusted': return { text: 'Verified as Trust', icon: ShieldCheck, color: 'green' };
    case 'fake': return { text: 'Verified as Fake', icon: ShieldX, color: 'red' };
    case 'disputed': return { text: 'Disputed', icon: AlertTriangle, color: 'orange' };
    default: return { text: 'Under Review', icon: Clock, color: 'gray' };
  }
};

// Helper for date formatting
const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};
</script>

<template>
   <div v-if="state.news" class="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
    <!-- Header -->
    <img src="../../src/assets/forwhite.png" alt="Logo" class="h-10 sm:h-13 mb-3 sm:mb-4 mx-auto" />
    <div class="mb-4">
      <h1 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2">{{ state.news.title }}</h1>
      <span class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium w-fit"
        :class="`bg-${getStatusInfo(state.news.status).color}-100 text-${getStatusInfo(state.news.status).color}-800`">
        <component :is="getStatusInfo(state.news.status).icon" :size="14" class="mr-1 sm:mr-1.5" />
        {{ getStatusInfo(state.news.status).text }}
      </span>
    </div>

    <!-- Metadata -->
    <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-xs sm:text-sm text-gray-500 mb-4 gap-1 sm:gap-x-4 sm:gap-y-1">
      <span class="flex items-center">
        <User :size="12" class="mr-1 sm:mr-1.5" /> By {{ state.news.reporter }}
      </span>
      <span class="flex items-center">
        <Calendar :size="12" class="mr-1 sm:mr-1.5" /> {{ formatDate(state.news.timestamp) }}
      </span>
      <span class="flex items-center">
        <MessageCircle :size="12" class="mr-1 sm:mr-1.5" /> {{ state.news.commentCount }} Comments
      </span>
    </div>

    <!-- Voting Section -->
    <div class="border-t border-b border-gray-200 py-3 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
        <div class="flex items-center gap-2 flex-1">
          <button disabled aria-disabled="true"
            class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 cursor-not-allowed opacity-80 flex-1 sm:flex-none justify-center">
            <ChevronUp :size="14" class="text-green-600" /> Trust ({{ state.news.trustVotes }})
          </button>
          <button disabled aria-disabled="true"
            class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 cursor-not-allowed opacity-80 flex-1 sm:flex-none justify-center">
            <ChevronDown :size="14" class="text-red-600" /> Fake ({{ state.news.fakeVotes }})
          </button>
        </div>
        <span class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">{{ state.news.totalVotesCount > 0 ? Math.round((state.news.trustVotes
          / state.news.totalVotesCount) * 100) : 0 }}% believe this is trust</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-red-200 rounded-full h-1.5 mb-4 sm:mb-6">
      <div class="bg-green-500 h-1.5 rounded-full"
        :style="{ width: `${state.news.totalVotesCount > 0 ? (state.news.trustVotes / state.news.totalVotesCount) * 100 : 0}%` }">
      </div>
    </div>

    <!-- Main Image -->
    <img :src="state.news.imageUrl ?? ''" :alt="state.news.title ?? ''"
      class="w-full h-auto object-cover rounded-lg mb-4 sm:mb-6">

    <!-- Full Detail -->
    <div class="prose max-w-none text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed" style="white-space: pre-wrap;">{{ state.news.fullDetail }}</div>

  </div>
</template>

