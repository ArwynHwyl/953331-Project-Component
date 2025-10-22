<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import NewsService from '@/services/NewsService';
import { useNewsStore } from '@/stores/news';
import type { NewsItem, HomeNewsItem, Comment, NewsStatus } from '@/types';

import NewsCard from '@/components/NewsCard.vue';
import {
  User, ShieldCheck, ShieldX, AlertTriangle, Clock, Search, Vote, Newspaper
} from 'lucide-vue-next';

/* ---------------- Props ---------------- */
const props = defineProps<{ limit: number; page: number }>();
const limit = computed(() => props.limit);
const page = computed(() => props.page);

/* ---------------- Router / Store ---------------- */
const router = useRouter();
const newsStore = useNewsStore();

/* ---------------- Constants ---------------- */
const TRUST_THRESHOLD = 0.55;
const FAKE_THRESHOLD  = 0.45;

/* ---------------- Local state ---------------- */
const allNews = ref<HomeNewsItem[]>([]);
const pageNews = ref<HomeNewsItem[]>([]);
const totalNews = ref(0);
const allNewsCount = ref(0);
const allTotalVotes = ref(0);

/* ---------------- Filters ---------------- */
type FilterKind = 'all' | 'real' | 'fake' | 'disputed' | 'under-review';
const filterType = ref<FilterKind>('all');

/* ---------------- Helpers ---------------- */
function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total === 0) return 'under-review';
  const ratio = trust / total;
  if (ratio >= TRUST_THRESHOLD) return 'trusted';
  if (ratio <= FAKE_THRESHOLD) return 'fake';
  return 'disputed';
}

function Home(item: NewsItem, comments: Comment[]): HomeNewsItem {
  const newsComments = comments.filter(c => c.newsId === item.id);
  const fakeVotes  = newsComments.filter(c => c.vote === 'fake').length;
  const trustVotes = newsComments.filter(c => c.vote === 'trust').length;
  const commentCount = newsComments.length;
  return {
    ...item,
    fakeVotes,
    trustVotes,
    totalVotesCount: fakeVotes + trustVotes,
    commentCount,
    status: getNewsStatus(fakeVotes, trustVotes),
  };
}

/* ---------------- Derived (counts, filters, pagination) ---------------- */
const allRealNewsCount = computed(() => allNews.value.filter(news => news.trustVotes > news.fakeVotes).length);
const allFakeNewsCount = computed(() => allNews.value.filter(news => news.trustVotes < news.fakeVotes).length);
const allDisputedNewsCount = computed(() =>
  allNews.value.filter(news => news.trustVotes === news.fakeVotes && news.totalVotesCount > 0).length
);
const allUnderReviewNewsCount = computed(() =>
  allNews.value.filter(news => news.totalVotesCount === 0).length
);

const filteredAllNews = computed<HomeNewsItem[]>(() => {
  switch (filterType.value) {
    case 'real':         return allNews.value.filter(news => news.trustVotes > news.fakeVotes);
    case 'fake':         return allNews.value.filter(news => news.trustVotes < news.fakeVotes);
    case 'disputed':     return allNews.value.filter(news => news.trustVotes === news.fakeVotes && news.totalVotesCount > 0);
    case 'under-review': return allNews.value.filter(news => news.totalVotesCount === 0);
    default:             return allNews.value;
  }
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAllNews.value.length / limit.value)));
const paginatedNews = computed<HomeNewsItem[]>(() => {
  const start = (page.value - 1) * limit.value;
  return filteredAllNews.value.slice(start, start + limit.value);
});

/* ---------------- Router helpers ---------------- */
function setFilter(newFilter: FilterKind) {
  if (filterType.value === newFilter) return;
  filterType.value = newFilter;
  router.push({ name: 'news-detail-view', query: { limit: limit.value, page: 1 } });
}

function onChangePerPage(e: Event) {
  const target = e.target as HTMLSelectElement | null;
  if (!target) return;
  const nextLimit = Number(target.value);
  router.push({ name: 'news-detail-view', query: { limit: nextLimit, page: 1 } });
}

/* ---------------- Data loading (Promise-based) ---------------- */
function loadAll(): Promise<void> {
  return Promise.all([
    NewsService.getNews(limit.value, page.value), // paginated slice from API
    NewsService.getAllComments(),
    NewsService.initNews(),                       // full news list (unpaginated)
  ])
    .then(([newsRes, commentsRes, initRes]) => {
      // Merge API comments with in-memory new comments from store
      const allComments: Comment[] = [
        ...(Array.isArray(commentsRes.data) ? commentsRes.data : []),
        ...newsStore.newComments,
      ];

      // Full list (for filter & counts)
      allNews.value = (initRes.data as NewsItem[]).map(item => Home(item, allComments));
      allNewsCount.value = initRes.data.length;

      // Page list (for the visible cards)
      pageNews.value = (newsRes.data as NewsItem[]).map(item => Home(item, allComments));
      totalNews.value = Number(newsRes.headers?.['x-total-count'] ?? pageNews.value.length);

      // Global votes stat (existing + new)
      const existingVotes = (commentsRes.data as Comment[]).filter(c => c.vote === 'fake' || c.vote === 'trust').length;
      allTotalVotes.value = existingVotes + newsStore.getAllComments.length; // store accessor
    })
}

/* ---------------- Lifecycle / Reactions ---------------- */
onMounted(loadAll);
// Re-load when pagination props or new store comments change
watch(() => [limit.value, page.value, newsStore.newComments], () => { loadAll(); }, { deep: true });
</script>

<template>
  <main class="min-h-screen p-4 sm:p-6 lg:p-8" style="background-color: #d5d5d5">
    <div class="max-w-7xl mx-auto">
      <!-- Stats -->
      <div class="mb-6">
        <!-- Mobile -->
        <div class="flex gap-4 overflow-x-auto pb-2 sm:hidden">
          <div class="flex-shrink-0 w-30 bg-[#312E2F] text-white rounded-md p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl font-bold mb-2">{{ allTotalVotes }}</div>
            <div class="flex items-center justify-center text-sm font-bold gap-4">
              <Vote :size="14" /><span>Votes</span>
            </div>
          </div>

          <div class="flex-shrink-0 w-30 bg-[#312E2F] text-white rounded-md p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl font-bold mb-2">{{ allNewsCount }}</div>
            <div class="flex items-center justify-center text-sm font-bold gap-2">
              <Newspaper :size="14" /><span>News</span>
            </div>
          </div>

          <div class="flex-shrink-0 w-30 bg-[#312E2F] text-white rounded-md p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl font-bold mb-2">{{ allRealNewsCount }}</div>
            <div class="flex items-center justify-center text-sm font-bold gap-2">
              <ShieldCheck :size="14" /><span>Real</span>
            </div>
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden sm:grid sm:grid-cols-3 gap-4">
          <div class="bg-[#312E2F] text-white rounded-md p-4 sm:p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ allTotalVotes }}</div>
            <div class="flex items-center justify-center text-sm sm:text-base font-bold gap-2">
              <Vote :size="16" /><span>Total Votes</span>
            </div>
          </div>

          <div class="bg-[#312E2F] text-white rounded-md p-4 sm:p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ allNewsCount }}</div>
            <div class="flex items-center justify-center text-sm sm:text-base font-bold gap-2">
              <Newspaper :size="16" /><span>News</span>
            </div>
          </div>

          <div class="bg-[#312E2F] text-white rounded-md p-4 sm:p-2 text-center border border-gray-500 shadow-md">
            <div class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{{ allRealNewsCount }}</div>
            <div class="flex items-center justify-center text-sm sm:text-base font-bold gap-2">
              <ShieldCheck :size="16" /><span>Real</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter + Per Page -->
      <div class="flex items-center justify-between gap-2 mb-6 overflow-x-auto rounded-sm border border-gray-500" style="background-color: #dedede">
        <div class="flex items-center gap-2 min-w-max ml-2 py-3">
          <Search :size="18" class="text-gray-400 mr-2" />

          <button
            @click="setFilter('all')"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 whitespace-nowrap rounded transition-colors',
                     filterType === 'all' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <User :size="18" class="mr-2 group-hover:text-white" :class="filterType === 'all' ? 'text-white' : 'text-black'" />
            <span class="group-hover:text-white">All News</span>
            <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{ allNewsCount }}
            </span>
          </button>

          <button
            @click="setFilter('real')"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 whitespace-nowrap rounded transition-colors',
                     filterType === 'real' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <ShieldCheck :size="18" class="mr-2 group-hover:text-white" :class="filterType === 'real' ? 'text-white' : 'text-black'" />
            <span class="group-hover:text-white">Real</span>
            <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{ allRealNewsCount }}
            </span>
          </button>

          <button
            @click="setFilter('fake')"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 whitespace-nowrap rounded transition-colors',
                     filterType === 'fake' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <ShieldX :size="18" class="mr-2 group-hover:text-white" :class="filterType === 'fake' ? 'text-white' : 'text-black'" />
            <span class="group-hover:text-white">Fake</span>
            <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{ allFakeNewsCount }}
            </span>
          </button>

          <button
            @click="setFilter('disputed')"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 whitespace-nowrap rounded transition-colors',
                     filterType === 'disputed' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <AlertTriangle :size="18" class="mr-2 group-hover:text-white" :class="filterType === 'disputed' ? 'text-white' : 'text-black'" />
            <span class="group-hover:text-white">Disputed</span>
            <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{ allDisputedNewsCount }}
            </span>
          </button>

          <button
            @click="setFilter('under-review')"
            :class="['group flex items-center px-4 py-2 text-sm font-semibold border border-gray-500 whitespace-nowrap rounded transition-colors',
                     filterType === 'under-review' ? 'bg-red-700 text-white' : 'bg-[#D9D9D9] text-black hover:bg-red-700']">
            <Clock :size="18" class="mr-2 group-hover:text-white" :class="filterType === 'under-review' ? 'text-white' : 'text-black'" />
            <span class="group-hover:text-white">Under Review</span>
            <span class="ml-2 bg-white text-black text-xs px-2 py-0.5 border rounded-sm group-hover:bg-white group-hover:text-red-600">
              {{ allUnderReviewNewsCount }}
            </span>
          </button>
        </div>

        <!-- Per page (Desktop) -->
        <div class="hidden sm:flex items-center gap-1 ml-4 mr-4">
          <label for="per-page" class="text-sm text-gray-700">Show</label>
          <select
            id="per-page"
            class="border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            :value="limit"
            @change="onChangePerPage"
          >
            <option v-for="n in Array.from({ length: allNewsCount }, (_, i) => i + 1)" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="text-sm text-gray-700">per page</span>
        </div>
      </div>

      <!-- Per page (Mobile) -->
      <div class="sm:hidden bg-[#DEDEDE] rounded-sm border border-gray-500 p-4 mb-6">
        <div class="flex items-center justify-center gap-2">
          <label for="per-page-mobile" class="text-sm text-gray-700">Show</label>
          <select
            id="per-page-mobile"
            class="border border-gray-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            :value="limit"
            @change="onChangePerPage"
          >
            <option v-for="n in Array.from({ length: allNewsCount }, (_, i) => i + 1)" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="text-sm text-gray-700">per page</span>
        </div>
      </div>

      <!-- Cards (use paginatedNews derived from filteredAllNews) -->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md">
        <NewsCard v-for="item in paginatedNews" :key="item.id" :news="item" :comments="[]" />
      </div>

      <!-- Pagination -->
      <div class="bg-[#E5E5E5] rounded-lg border-[#B0B0B0] border-2 p-6 mb-6 shadow-md flex justify-between items-center">
        <div class="w-1/3 flex justify-start">
          <RouterLink
            v-if="page > 1"
            id="page-prev"
            class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
            :to="{ name: 'news-detail-view', query: { limit, page: page - 1 } }"
            rel="prev"
          >
            &#60; Prev Page
          </RouterLink>
        </div>

        <div class="w-1/3 flex justify-center">
          <span class="whitespace-nowrap">
            Page {{ page }} of {{ totalPages }}
          </span>
        </div>

        <div class="w-1/3 flex justify-end">
          <RouterLink
            v-if="page < totalPages"
            id="page-next"
            class="no-underline text-gray-700 hover:text-gray-900 whitespace-nowrap"
            :to="{ name: 'news-detail-view', query: { limit, page: page + 1 } }"
            rel="next"
          >
            Next Page &#62;
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
