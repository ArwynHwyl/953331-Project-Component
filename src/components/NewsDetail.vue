<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { DetailedNewsItem, Comment, NewsStatus } from '@/types';
import {
  User, Calendar, ChevronUp, ChevronDown,
  ShieldCheck, ShieldX, AlertTriangle, Clock, MessageCircle
} from 'lucide-vue-next';

const props = defineProps<{
  newsDetail: DetailedNewsItem;
  comments: Comment[];
}>();

/** Local refs for clearer intent */
const news = toRef(props, 'newsDetail');
const comments = toRef(props, 'comments');

/* ---------- Helpers ---------- */
const formatDate = (ts: string) =>
  new Date(ts).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const statusInfo = computed(() => {
  const status = news.value.status as NewsStatus | undefined;
  switch (status) {
    case 'trusted':  return { text: 'Verified as Trust', icon: ShieldCheck,   badge: 'bg-green-100 text-green-800' };
    case 'fake':     return { text: 'Verified as Fake',  icon: ShieldX,       badge: 'bg-red-100 text-red-800' };
    case 'disputed': return { text: 'Disputed',          icon: AlertTriangle, badge: 'bg-amber-100 text-amber-800' };
    default:         return { text: 'Under Review',      icon: Clock,         badge: 'bg-gray-100 text-gray-800' };
  }
});

/* ---------- Derived UI ---------- */
const trustPercent = computed(() => {
  const t = news.value.trustVotes ?? 0;
  const total = news.value.totalVotesCount ?? 0;
  return total > 0 ? Math.round((t / total) * 100) : 0;
});

const verdictBarBgClass = computed(() => {
  const { trustVotes = 0, fakeVotes = 0 } = news.value;
  if (fakeVotes > trustVotes) return 'bg-green-200';
  if (trustVotes > fakeVotes) return 'bg-red-200';
  return 'bg-gray-200';
});

/** Safe fallbacks (in case parent forgot to compute) */
const safeCommentCount = computed(() => news.value.commentCount ?? comments.value.length);

</script>

<template>
  <article class="max-w-4xl mx-auto" aria-labelledby="news-title">
    <section class="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
      <!-- Header -->
      <img
        src="../../src/assets/forwhite.png"
        alt="Logo"
        class="h-10 sm:h-13 mb-3 sm:mb-4 mx-auto"
      />

      <header class="mb-4">
        <h1 id="news-title" class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2">
          {{ news.title }}
        </h1>

        <span
          class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium w-fit"
          :class="statusInfo.badge"
          aria-live="polite"
        >
          <component :is="statusInfo.icon" :size="16" class="mr-1.5" aria-hidden="true" />
          {{ statusInfo.text }}
        </span>
      </header>

      <!-- Metadata -->
      <dl class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-xs sm:text-sm text-gray-500 mb-4 gap-1 sm:gap-x-4 sm:gap-y-1">
        <div class="flex items-center">
          <User :size="12" class="mr-1 sm:mr-1.5" aria-hidden="true" />
          <dt class="sr-only">Reporter</dt>
          <dd>By {{ news.reporter }}</dd>
        </div>

        <div class="flex items-center">
          <Calendar :size="12" class="mr-1 sm:mr-1.5" aria-hidden="true" />
          <dt class="sr-only">Published</dt>
          <dd>{{ formatDate(news.timestamp) }}</dd>
        </div>

        <div class="flex items-center">
          <MessageCircle :size="12" class="mr-1 sm:mr-1.5" aria-hidden="true" />
          <dt class="sr-only">Comments</dt>
          <dd>{{ safeCommentCount }} Comments</dd>
        </div>
      </dl>

      <!-- Voting Summary -->
      <section class="border-t border-b border-gray-200 py-3 mb-4 sm:mb-6" aria-label="Community votes">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          <div class="flex items-center gap-2 flex-1">
            <button
              type="button"
              disabled
              class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 opacity-80 flex-1 sm:flex-none justify-center"
              aria-disabled="true"
            >
              <ChevronUp :size="14" class="text-green-600" aria-hidden="true" />
              Trust ({{ news.trustVotes }})
            </button>

            <button
              type="button"
              disabled
              class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 opacity-80 flex-1 sm:flex-none justify-center"
              aria-disabled="true"
            >
              <ChevronDown :size="14" class="text-red-600" aria-hidden="true" />
              Fake ({{ news.fakeVotes }})
            </button>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            {{ trustPercent }}% believe this is true
          </p>
        </div>
      </section>

      <!-- Verdict Bar -->
      <div class="w-full rounded-full h-1.5 relative overflow-hidden mb-4 sm:mb-6" :class="verdictBarBgClass" aria-label="Vote distribution">
        <div
          class="bg-green-500 h-1.5 rounded-r-full absolute left-0 top-0"
          :style="{ width: `${news.totalVotesCount > 0 ? (news.trustVotes / news.totalVotesCount) * 100 : 0}%` }"
          aria-hidden="true"
        />
        <div
          class="bg-red-500 h-1.5 rounded-l-full absolute right-0 top-0"
          :style="{ width: `${news.totalVotesCount > 0 ? (news.fakeVotes / news.totalVotesCount) * 100 : 0}%` }"
          aria-hidden="true"
        />
      </div>

      <!-- Main Image -->
      <figure>
        <img
          :src="news.imageUrl ?? ''"
          :alt="news.title ?? ''"
          class="w-full h-auto object-cover rounded-lg mb-4 sm:mb-6"
        />
      </figure>

      <!-- Full Detail -->
      <section class="prose max-w-none text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
        {{ news.fullDetail }}
      </section>
    </section>
  </article>
</template>
