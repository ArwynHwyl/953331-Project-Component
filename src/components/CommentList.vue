<script setup lang="ts">
import { ref, onMounted, watch, computed, watchEffect } from 'vue';
import { useNewsStore } from '@/stores/news';
import NewsService from '@/services/NewsService';
import type { Comment } from '@/types';
import { ThumbsUp } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const props = defineProps({
  id: {
    type: Number,
    required: true
  },
})

const route = useRoute();

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
const allApiComments = ref<Comment[]>([]);

async function fetchAllApiComments() {
  try {
    const res = await NewsService.getCommentsByNewsId(newsId.value);
    allApiComments.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Failed to fetch all API comments', e);
    allApiComments.value = [];
  }
}

async function fetchComments() {
  try {
    if (allApiComments.value.length === 0) {
      await fetchAllApiComments();
    }

    const newComments = newsStore.getNewCommentsByNewsId(newsId.value);

    const merged = [...allApiComments.value, ...newComments];
    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const start = (page.value - 1) * limit.value;
    const end = start + limit.value;
    comments.value = merged.slice(start, end);

    totalComment.value = allApiComments.value.length + newComments.length;
  } catch (e) {
    comments.value = [];
  }
}

onMounted(fetchComments);
watch([newsId, page, limit], () => { fetchComments() });

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
  <div class=" border-gray-200 pt-6">
    <div class="flex">
      <h2 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2 p-2 border-b">Comments ({{ totalComment }})</h2>
    </div>
    <div class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-start gap-4">
          <div class="flex-none">
            <div
              :style="{ backgroundImage: `linear-gradient(135deg,#7c3aed,#06b6d4)` }"
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            >
              {{ (String(comment.userId).charAt(0) || 'U').toUpperCase() }}
            </div>
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <div class="text-sm font-semibold text-gray-900">{{ comment.userId }}</div>

                <span
                  :class="{
                    'bg-green-100 text-green-800': comment.vote === 'trust',
                    'bg-red-100 text-red-800': comment.vote === 'fake',
                    'bg-gray-100 text-gray-800': !comment.vote
                  }"
                  class="text-xs px-2 py-0.5 rounded-full font-medium uppercase"
                >
                  {{ comment.vote || 'unknown' }}
                </span>

                <span class="text-xs text-gray-400 ml-2">{{ formatRelativeTime(comment.timestamp) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <!-- desktop / tablet like button (hidden on small screens) -->
                <button
                  @click="handleLike(comment.id)"
                  :aria-pressed="likedComments.has(comment.id)"
                  class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  :class="likedComments.has(comment.id) ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'"
                >
                  <ThumbsUp :size="14" :class="likedComments.has(comment.id) ? 'text-indigo-600' : 'text-gray-600'" />
                  <span>{{ getLikeCount(comment.id) }}</span>
                </button>
              </div>
            </div>

            <p class="mt-3 text-sm text-gray-700 leading-normal">{{ comment.text }}</p>

            <div v-if="comment.imageUrl" class="mt-3">
              <img
                :src="comment.imageUrl"
                alt="Comment image"
                loading="lazy"
                class="w-full max-w-[240px] max-h-[160px] rounded-lg object-cover border border-gray-100 shadow-sm"
              />
            </div>

            <!-- ID row: place like button on the right for small screens -->
            <div class="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
              <span class="px-2 py-0.5 bg-gray-50 rounded-full">ID #{{ comment.id }}</span>

              <!-- mobile like button (visible only on small screens) -->
              <button
                @click="handleLike(comment.id)"
                :aria-pressed="likedComments.has(comment.id)"
                class="flex sm:hidden items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                :class="likedComments.has(comment.id) ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'"
              >
                <ThumbsUp :size="14" :class="likedComments.has(comment.id) ? 'text-indigo-600' : 'text-gray-600'" />
                <span>{{ getLikeCount(comment.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 my-6 shadow-md flex justify-between items-center">
      <div class="w-1/3 flex justify-start">
        <RouterLink v-if="page !== 1" id="page-prev"
          class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
          :to="{ query: { limit, page: page - 1 } }" rel="prev">
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
          :to="{ query: { limit, page: page + 1 } }" rel="next">
          Next Page &#62;
        </RouterLink>
      </div>
    </div>
  </div>
</template>
