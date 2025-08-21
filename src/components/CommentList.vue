<script setup lang="ts">
import { ref, onMounted, watch, computed, watchEffect } from 'vue';
import { useNewsStore } from '@/stores/news';
import NewsService from '@/services/NewsService';
import type { Comment } from '@/types';
import { ThumbsUp } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  id: {
    type: Number,
    required: true
  },
})

const route = useRoute();
const router = useRouter();

const page = computed(() => Number(route.query.page) || 1);
const limit = computed(() => Number(route.query.limit) || 2);


const newsId = computed(() => props.id)

const totalComment = ref(0)

const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalComment.value / limit.value)
  return page.value < totalPages
})

const newsStore = useNewsStore();
const likedComments = ref<Set<number>>(new Set());
const comments = ref<Comment[]>([]);

async function fetchComments() {
  watchEffect(async () => {
    try {
      const commentsRes = await NewsService.getCommentsByNewsId(newsId.value, limit.value, page.value);
      const originalComments = commentsRes.data as Comment[];
      const newComments = newsStore.getNewCommentsByNewsId(newsId.value);
      comments.value = [...originalComments, ...newComments]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      totalComment.value = commentsRes.headers['x-total-count']
    } catch (e) {
      comments.value = [];
    }
  })
}

onMounted(fetchComments);
watch([() => newsId.value, () => route.query.page, () => route.query.limit], () => { fetchComments });

const handleLike = (commentId: number) => {
  if (likedComments.value.has(commentId)) {
    likedComments.value.delete(commentId);
  } else {
    likedComments.value.add(commentId);
  }
};

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
</script>

<template>
  <div class="border-t border-gray-200 pt-6">
    <div class="flex">
      <h2 class="text-2xl font-bold mb-4">Comments ({{ comments.length }})</h2>
      <router-link :to="{ name: 'vote-view', params: { id: $route.params.id } }"
        class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg flex items-center gap-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-vote">
          <polyline points="9 12 12 15 20 7" />
          <path d="M4 21V8a2 2 0 0 1 2-2h1" />
          <path d="M4 12H2" />
          <path d="M10 12H8" />
          <path d="M16 6H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" />
        </svg>
        <span>Vote &amp; Comment</span>
      </router-link>
    </div>
    <div class="space-y-5">
      <div v-for="comment in comments" :key="comment.id" class="p-4 bg-white rounded-lg border border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <strong class="text-sm font-semibold text-gray-900 mr-2">{{ comment.userId }}</strong>
            <span class="text-xs text-gray-500">{{ formatRelativeTime(comment.timestamp) }}</span>
          </div>
          <button @click="handleLike(comment.id)"
            class="flex items-center text-sm hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
            :class="likedComments.has(comment.id) ? 'text-blue-600' : 'text-gray-600'">
            <ThumbsUp :size="16" class="mr-1.5" :class="likedComments.has(comment.id) ? 'fill-current' : ''" />
            <span>{{ getLikeCount(comment.id) }}</span>
          </button>
        </div>
        <p class="text-gray-800 my-3">{{ comment.text }}</p>
        <img v-if="comment.imageUrl" :src="comment.imageUrl" alt="Comment image"
          class="mt-2 rounded-lg max-w-xs max-h-64 object-cover border">
      </div>
    </div>

    <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md flex justify-between items-center">
      <div class="w-1/3 flex justify-start">
        <RouterLink v-if="page !== 1" id="page-prev"
          class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
          :to="{ name: 'comment-view', query: { limit, page: page - 1 } }" rel="prev">
          &#60; Prev Page
        </RouterLink>
      </div>

      <div class="w-1/3 flex justify-center">
        <span class="whitespace-nowrap">
          Page {{ page }} of {{ Math.ceil(totalComment / limit) || 1 }}
        </span>
      </div>

      <div class="w-1/3 flex justify-end">
        <RouterLink v-if="hasNextPage" id="page-next"
          class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
          :to="{ name: 'comment-view', query: { limit, page: page + 1 } }" rel="next">
          Next Page &#62;
        </RouterLink>
      </div>
    </div>
  </div>
</template>
