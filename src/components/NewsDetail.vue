<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import NewsService from '@/services/NewsService';
import { useNewsStore } from '@/stores/news';
import type { Comment, DetailedNewsItem, NewsItem, NewsStatus } from '@/types';
import NewsDetailContent from '@/components/NewsDetailContent.vue';
import NewsDetailHeader from '@/components/NewsDetailHeader.vue';
import NewsMetadata from '@/components/NewsMetadata.vue';
import NewsVerdictSummary from '@/components/NewsVerdictSummary.vue';

const props = defineProps<{
  id: number;
}>();

const newsStore = useNewsStore();

const news = ref<DetailedNewsItem | null>(null);
const loading = ref<boolean>(false);
const error = ref<string>('');

const TRUST_THRESHOLD = 0.55;
const FAKE_THRESHOLD = 0.45;

function resolveStatus(fakeVotes: number, trustVotes: number): NewsStatus {
  const total = fakeVotes + trustVotes;
  if (total === 0) return 'under-review';

  const trustRatio = trustVotes / total;
  if (trustRatio >= TRUST_THRESHOLD) return 'trusted';
  if (trustRatio <= FAKE_THRESHOLD) return 'fake';
  return 'disputed';
}

function mergeComments(original: Comment[], appended: Comment[]): Comment[] {
  return [...original, ...appended].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function mapDetailedNews(base: NewsItem, commentsList: Comment[]): DetailedNewsItem {
  const trustVotes = commentsList.filter(comment => comment.vote === 'trust').length;
  const fakeVotes = commentsList.filter(comment => comment.vote === 'fake').length;

  return {
    ...base,
    trustVotes,
    fakeVotes,
    totalVotesCount: trustVotes + fakeVotes,
    commentCount: commentsList.length,
    status: resolveStatus(fakeVotes, trustVotes),
  };
}

async function refresh(): Promise<void> {
  const id = props.id;
  if (id === undefined || id === null) return;

  loading.value = true;
  error.value = '';

  try {
    const [{ data: newsResponse }, { data: commentsResponse }] = await Promise.all([
      NewsService.getNewsById(id),
      NewsService.getCommentsByNewsId(id),
    ]);

    const baseNews = (newsResponse as NewsItem[])[0] ?? null;

    if (!baseNews) {
      news.value = null;
      return;
    }

    const storeComments = newsStore.getNewCommentsByNewsId(id);
    const combined = mergeComments(commentsResponse as Comment[], storeComments);

    news.value = mapDetailedNews(baseNews, combined);
  } catch (err) {
    console.error(err);
    error.value = 'Failed to load news detail.';
    news.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refresh();
});

watch(
  () => props.id,
  () => {
    void refresh();
  }
);

watch(
  () => newsStore.newComments,
  () => {
    void refresh();
  },
  { deep: true }
);
</script>

<template>
  <div v-if="news" class="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
    <img src="../../src/assets/forwhite.png" alt="Logo" class="h-10 sm:h-13 mb-3 sm:mb-4 mx-auto" />
    <NewsDetailHeader :title="news.title" :status="news.status" />
    <NewsMetadata
      :reporter="news.reporter"
      :timestamp="news.timestamp"
      :comment-count="news.commentCount"
    />
    <NewsVerdictSummary
      :trust-votes="news.trustVotes"
      :fake-votes="news.fakeVotes"
      :total-votes="news.totalVotesCount"
    />
    <NewsDetailContent
      :image-url="news.imageUrl"
      :title="news.title"
      :full-detail="news.fullDetail"
    />
  </div>
  <div
    v-else-if="loading"
    class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg text-center text-gray-600"
  >
    Loading news…
  </div>
  <div
    v-else
    class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg text-center text-gray-600"
  >
    {{ error || 'News detail not found.' }}
  </div>
</template>
