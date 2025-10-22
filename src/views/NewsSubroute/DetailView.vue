<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import NewsService from '@/services/NewsService';
import { useNewsStore } from '@/stores/news';
import type { DetailedNewsItem, Comment } from '@/types';
import NewsDetail from '@/components/NewsDetail.vue';

defineOptions({ name: 'DetailView' });

const props = defineProps<{ id: string }>();
const newsId = computed(() => Number(props.id) || 0);

const newsDetail = ref<DetailedNewsItem | null>(null);
const comments   = ref<Comment[]>([]);

const route = useRoute();
const store = useNewsStore();

const topics = [
  { name: 'comment-view', label: 'Comments' },
  { name: 'vote-view',    label: 'Vote & Add Comment' },
] as const;

function load(): Promise<void> {
  return Promise.all([
    NewsService.getNewsById(newsId.value),
    NewsService.getCommentsByNewsId(newsId.value),
  ]).then(([newsRes, commentRes]) => {
    const base = (newsRes.data as DetailedNewsItem[])[0] ?? null;
    const originals = (commentRes.data ?? []) as Comment[];
    const injected  = store.getNewCommentsByNewsId(newsId.value) as Comment[];
    const all = [...originals, ...injected].sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
    );

    if (base) {
      const trust = all.filter(c => c.vote === 'trust').length;
      const fake  = all.filter(c => c.vote === 'fake').length;
      const total = trust + fake;

      newsDetail.value = {
        ...base,
        trustVotes: trust,
        fakeVotes: fake,
        totalVotesCount: total,
        commentCount: all.length,
        status:
          total === 0
            ? 'under-review'
            : trust / total >= 0.55
              ? 'trusted'
              : trust / total <= 0.45
                ? 'fake'
                : 'disputed',
      };
      comments.value = all;
    } else {
      // No data: render nothing (v-if will prevent child from mounting)
      newsDetail.value = null;
      comments.value = [];
    }
  });
}

const isActiveTab = (name: string) => route.name === name;

watch(
  () => [newsId.value, store.newComments],
  () => { load(); },
  { immediate: true, deep: true }
);
</script>

<template>
  <main class="min-h-screen bg-[#D5D5D5] p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Back -->
      <div class="mb-8">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Back to News List</span>
        </RouterLink>
      </div>

      <!-- Render only when data exists; no placeholder -->
      <NewsDetail
        v-if="newsDetail"
        :news-detail="newsDetail"
        :comments="comments"
      />

      <!-- Tabs -->
      <div class="my-6 border-b border-gray-300">
        <nav class="flex -mb-px space-x-6" aria-label="Tabs">
          <RouterLink
            v-for="topic in topics"
            :key="topic.name"
            :to="{ name: topic.name, params: { id: String(newsId) } }"
            class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="isActiveTab(topic.name)
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            {{ topic.label }}
          </RouterLink>
        </nav>
      </div>

      <RouterView />
    </div>
  </main>
</template>
