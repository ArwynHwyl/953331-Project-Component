<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import type { DetailedNewsItem, NewsStatus, Comment, VoteType } from '@/types';
import db from '../../db.json';
import {
  User, Calendar, ChevronUp, ChevronDown, ShieldCheck, ShieldX, AlertTriangle, Clock, MessageCircle, ThumbsUp
} from 'lucide-vue-next';

const route = useRoute();
const newsStore = useNewsStore();
const newCommentText = ref('');
const likedComments = ref<Set<number>>(new Set()); // Track liked comments

// Helper function to determine news status
function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total < 10) return 'under-review';
  const trustRatio = trust / total;
  if (trustRatio >= 0.7) return 'trusted';
  if (trustRatio <= 0.3) return 'fake';
  return 'disputed';
}

// Computed property to get the fully detailed news item
const detailedNewsItem = computed((): DetailedNewsItem | null => {
  const newsId = Number(route.params.id);
  const baseNews = db.news.find(n => n.id === newsId);
  if (!baseNews) return null;

  const originalComments = db.comments.filter(c => c.newsId === newsId);
  const newComments = newsStore.getNewCommentsByNewsId(newsId);
  const allComments = [...originalComments, ...newComments];

  const trustVotes = allComments.filter(c => c.vote === 'trust').length;
  const fakeVotes = allComments.filter(c => c.vote === 'fake').length;
  const status = getNewsStatus(fakeVotes, trustVotes);

  return {
    ...baseNews,
    trustVotes,
    fakeVotes,
    totalVotesCount: trustVotes + fakeVotes,
    commentCount: allComments.length,
    status,
  };
});

// Computed property for displaying all comments, sorted by date
const allComments = computed((): Comment[] => {
  if (!detailedNewsItem.value) return [];
  const originalComments = db.comments
    .filter(c => c.newsId === detailedNewsItem.value!.id)
    .map(c => ({
      ...c,
      vote: c.vote as VoteType
    }));
  const newComments = newsStore.getNewCommentsByNewsId(detailedNewsItem.value!.id)
    .map(c => ({
      ...c,
      vote: c.vote as VoteType
    }));

  return [...originalComments, ...newComments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
});

// Function to handle voting
const handleVote = (voteType: VoteType) => {
  if (detailedNewsItem.value) {
    newsStore.addVote({
      newsId: detailedNewsItem.value.id,
      userId: 'currentUser',
      vote: voteType,
      text: `Voted '${voteType}'.`,
      imageUrl: null,
    });
  }
};

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
  <div v-if="detailedNewsItem" class="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
    <!-- Header -->
     <img
      src="..\assets\forwhite.png"
      alt="Logo"
      class="h-13 mb-4 mx-auto"
    />
    <div class="flex justify-between items-start mb-4">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{{ detailedNewsItem.title }}</h1>
      <span class="flex-shrink-0 ml-4 mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="`bg-${getStatusInfo(detailedNewsItem.status).color}-100 text-${getStatusInfo(detailedNewsItem.status).color}-800`">
        <component :is="getStatusInfo(detailedNewsItem.status).icon" :size="16" class="mr-1.5" />
        {{ getStatusInfo(detailedNewsItem.status).text }}
      </span>
    </div>

    <!-- Metadata -->
    <div class="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-x-4 gap-y-1">
      <span class="flex items-center"><User :size="14" class="mr-1.5" /> By {{ detailedNewsItem.reporter }}</span>
      <span class="flex items-center"><Calendar :size="14" class="mr-1.5" /> {{ formatDate(detailedNewsItem.timestamp) }}</span>
      <span class="flex items-center"><MessageCircle :size="14" class="mr-1.5" /> {{ detailedNewsItem.commentCount }} Comments</span>
    </div>

    <!-- Voting Section -->
    <div class="flex flex-wrap items-center gap-2 border-t border-b border-gray-200 py-3 mb-6">
      <button @click="handleVote('trust')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
        <ChevronUp :size="16" class="text-green-600"/> Trust ({{ detailedNewsItem.trustVotes }})
      </button>
      <button @click="handleVote('fake')" class="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100">
        <ChevronDown :size="16" class="text-red-600"/> Fake ({{ detailedNewsItem.fakeVotes }})
      </button>
      <router-link
        v-if="detailedNewsItem"
        :to="{ name: 'comment-view', params: { id: detailedNewsItem.id } }"
        class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg flex items-center gap-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-vote"><polyline points="9 12 12 15 20 7"/><path d="M4 21V8a2 2 0 0 1 2-2h1"/><path d="M4 12H2"/><path d="M10 12H8"/><path d="M16 6H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/></svg>
        <span>Vote &amp; Comment</span>
      </router-link>
      <span class="text-sm text-gray-600 ml-auto">{{ detailedNewsItem.totalVotesCount > 0 ? Math.round((detailedNewsItem.trustVotes / detailedNewsItem.totalVotesCount) * 100) : 0 }}% believe this is trust</span>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-red-200 rounded-full h-1.5 mb-6">
      <div class="bg-green-500 h-1.5 rounded-full" :style="{ width: `${detailedNewsItem.totalVotesCount > 0 ? (detailedNewsItem.trustVotes / detailedNewsItem.totalVotesCount) * 100 : 0}%` }"></div>
    </div>

    <!-- Main Image -->
    <img :src="detailedNewsItem.imageUrl ?? ''" :alt="detailedNewsItem.title ?? ''" class="w-full h-auto object-cover rounded-lg mb-6">

    <!-- Full Detail -->
    <div class="prose max-w-none text-gray-800 mb-8" style="white-space: pre-wrap;">{{ detailedNewsItem.fullDetail }}</div>

    <!-- Comments Section -->
    <div class="border-t border-gray-200 pt-6">
      <h2 class="text-2xl font-bold mb-4">Comments ({{ detailedNewsItem.commentCount }})</h2>
      <!-- Comments List -->
      <div class="space-y-5">
        <div v-for="comment in allComments" :key="comment.id" class="p-4 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <strong class="text-sm font-semibold text-gray-900 mr-2">{{ comment.userId }}</strong>
              <span class="text-xs text-gray-500">{{ formatRelativeTime(comment.timestamp) }}</span>
            </div>
            <button
              @click="handleLike(comment.id)"
              class="flex items-center text-sm hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
              :class="likedComments.has(comment.id) ? 'text-blue-600' : 'text-gray-600'"
            >
              <ThumbsUp
                :size="16"
                class="mr-1.5"
                :class="likedComments.has(comment.id) ? 'fill-current' : ''"
              />
              <span>{{ getLikeCount(comment.id) }}</span>
            </button>
          </div>
          <p class="text-gray-800 my-3">{{ comment.text }}</p>
          <img v-if="comment.imageUrl" :src="comment.imageUrl" alt="Comment image" class="mt-2 rounded-lg max-w-xs max-h-64 object-cover border">
        </div>
      </div>
    </div>

  </div>
  <div v-else class="text-center text-gray-500 mt-10">
    <h2 class="text-2xl">News not found</h2>
    <p>The news article you are looking for does not exist.</p>
  </div>
</template>

<style>
.prose { line-height: 1.75; }
.prose p { margin-bottom: 1em; }
</style>
