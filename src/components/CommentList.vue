<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import NewsService from '@/services/NewsService';
import type { Comment } from '@/types';
import { ThumbsUp } from 'lucide-vue-next';

/* -------------------- Props -------------------- */
const props = defineProps<{ id: number }>();

/* -------------------- Router -------------------- */
const route = useRoute();
const toInt = (v: unknown, fallback: number) => {
  const number = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
};
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;

const page = computed(() => toInt(route.query.page, DEFAULT_PAGE));
const limit = computed(() => toInt(route.query.limit, DEFAULT_LIMIT));

/* -------------------- Store -------------------- */
const newsStore = useNewsStore();

/* -------------------- Mutable state (raw API only) -------------------- */
const loading = ref<boolean>(true);
const error = ref<string>('');
const apiComments = ref<Comment[]>([]);  // fetched once per newsId

/* -------------------- Derived state -------------------- */
const injectedComments = computed<Comment[]>(
  () => newsStore.getNewCommentsByNewsId(props.id) as Comment[]
);

const allComments = computed<Comment[]>(() =>
  [...apiComments.value, ...injectedComments.value].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
  )
);

const totalComments = computed(() => allComments.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalComments.value / limit.value)));
const safePage = computed(() => Math.min(Math.max(page.value, 1), totalPages.value));

const pageSlice = computed<[number, number]>(() => {
  const start = (safePage.value - 1) * limit.value;
  return [start, start + limit.value];
});

const pagedComments = computed<Comment[]>(() => {
  const [start, end] = pageSlice.value;
  return allComments.value.slice(start, end);
});

const hasPrevPage = computed(() => safePage.value > 1);
const hasNextPage = computed(() => safePage.value < totalPages.value);

/* -------------------- Likes (UI-only) -------------------- */
const liked = ref<Set<number>>(new Set());
const toggleLike = (id: number) => (liked.value.has(id) ? liked.value.delete(id) : liked.value.add(id));
const likeCountFor = (id: number) => {
  const base = (id * 3 + 5) % 25;
  return liked.value.has(id) ? base + 1 : base;
};

/* -------------------- Utils -------------------- */
const relativeTime = (ts: string) => {
  const s = Math.max(0, Math.floor((Date.now() - +new Date(ts)) / 1000));
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
};

/* -------------------- Data loading -------------------- */
function loadComments(newsId: number): Promise<void> {
  loading.value = true;
  error.value = '';
  apiComments.value = [];
  return NewsService.getCommentsByNewsId(newsId)
    .then((res) => {
      apiComments.value = Array.isArray(res?.data) ? (res.data as Comment[]) : [];
    })
    .catch(() => {
      error.value = 'Failed to load comments.';
      apiComments.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => loadComments(props.id));
watch(() => props.id, (nid) => loadComments(nid));
/* No watch on page/limit/store: all derived via computed */
</script>

<template>
  <div class="pt-6">
    <div class="flex">
      <h2 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2 p-2 border-b">
        Comments ({{ totalComments }})
      </h2>
    </div>

    <!-- List -->
    <div class="space-y-4">
      <div
        v-for="comment in pagedComments"
        :key="comment.id"
        class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div class="flex-none">
            <div
              :style="{ backgroundImage: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }"
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            >
              {{ (String(comment.userId).charAt(0) || 'U').toUpperCase() }}
            </div>
          </div>

          <!-- Body -->
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <div class="text-sm font-semibold text-gray-900">{{ comment.userId }}</div>

                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium uppercase"
                  :class="{
                    'bg-green-100 text-green-800': comment.vote === 'trust',
                    'bg-red-100 text-red-800': comment.vote === 'fake',
                    'bg-gray-100 text-gray-800': !comment.vote
                  }"
                >
                  {{ comment.vote || 'unknown' }}
                </span>

                <span class="text-xs text-gray-400 ml-2">{{ relativeTime(comment.timestamp) }}</span>
              </div>

              <!-- Like (desktop/tablet) -->
              <button
                @click="toggleLike(comment.id)"
                :aria-pressed="liked.has(comment.id)"
                class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                :class="liked.has(comment.id) ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'"
              >
                <ThumbsUp :size="14" :class="liked.has(comment.id) ? 'text-indigo-600' : 'text-gray-600'" />
                <span>{{ likeCountFor(comment.id) }}</span>
              </button>
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

            <!-- Footer row -->
            <div class="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
              <span class="px-2 py-0.5 bg-gray-50 rounded-full">ID #{{ comment.id }}</span>

              <!-- Like (mobile) -->
              <button
                @click="toggleLike(comment.id)"
                :aria-pressed="liked.has(comment.id)"
                class="flex sm:hidden items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
                :class="liked.has(comment.id) ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'"
              >
                <ThumbsUp :size="14" :class="liked.has(comment.id) ? 'text-indigo-600' : 'text-gray-600'" />
                <span>{{ likeCountFor(comment.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 my-6 shadow-md flex justify-between items-center">
        <div class="w-1/3 flex justify-start">
          <RouterLink
            v-if="hasPrevPage"
            id="page-prev"
            class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
            :to="{ query: { limit, page: safePage - 1 } }"
            rel="prev"
          >
            &#60; Prev Page
          </RouterLink>
        </div>

        <div class="w-1/3 flex justify-center">
          <span class="whitespace-nowrap">
            Page {{ safePage }} of {{ totalPages }}
          </span>
        </div>

        <div class="w-1/3 flex justify-end">
          <RouterLink
            v-if="hasNextPage"
            id="page-next"
            class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
            :to="{ query: { limit, page: safePage + 1 } }"
            rel="next"
          >
            Next Page &#62;
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
