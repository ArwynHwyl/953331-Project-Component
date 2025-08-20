<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import type { NewsItem, VoteType } from '@/types';
import db from '../../db.json';
import { User, Calendar, ChevronUp, ChevronDown , ChevronLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();

const newsId = Number(route.params.id);

// Form state
const selectedVote = ref<VoteType | null>(null);
const userName = ref('');
const commentText = ref('');
const imageUrl = ref('');
const errorMessage = ref('');

// Find the news item to display its summary
const newsItem = computed((): NewsItem | undefined => {
  return db.news.find(n => n.id === newsId);
});

const handleSubmit = () => {
  if (!selectedVote.value) {
    errorMessage.value = 'Please select your vote (Real or Fake).';
    return;
  }
  if (!userName.value.trim()) {
    errorMessage.value = 'Please enter your name.';
    return;
  }
  if (!commentText.value.trim()) {
    errorMessage.value = 'Please enter your comment.';
    return;
  }
  errorMessage.value = '';

  newsStore.addVote({
    newsId: newsId,
    userId: userName.value.trim(),
    vote: selectedVote.value,
    text: commentText.value.trim(),
    imageUrl: imageUrl.value.trim() || null,
  });

  // Navigate back to the detail page after submission
  router.push({ name: 'news-detail', params: { id: newsId } });
};

const handleCancel = () => {
  router.back();
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Back Button -->
    <div class="mb-6">
      <router-link
        :to="{ name: 'news-detail', params: { id: newsId } }"
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft :size="20" class="mr-2" />
        Back to News Detail
      </router-link>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <h1 class="text-lg font-medium text-gray-900 mb-6">Vote on News Article</h1>

      <!-- News Summary Card -->
      <div v-if="newsItem" class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-3">{{ newsItem.title }}</h2>
        <p class="text-gray-600 text-sm mb-4">{{ newsItem.shortDetail }}</p>
        <div class="flex items-center text-sm text-gray-500 mb-4">
          <User :size="14" class="mr-1" />
          <span class="mr-4">By {{ newsItem.reporter }}</span>
          <Calendar :size="14" class="mr-1" />
          <span>{{ formatDate(newsItem.timestamp) }}</span>
        </div>
        <img
          :src="newsItem.imageUrl ?? ''"
          :alt="newsItem.title ?? ''"
          class="w-full max-w-md h-64 object-cover rounded-lg"
        >

        <!-- Vote Statistics -->
        <div class="flex gap-4 mt-4">
          <div class="flex items-center gap-2">
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Real: 342</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">Fake: 21</span>
          </div>
          <div class="text-sm text-gray-600">94% believe this is real</div>
        </div>
      </div>

      <!-- Voting Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Your Vote</label>
          <p class="text-sm text-gray-600 mb-4">Do you believe this news is real or fake?</p>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="selectedVote = 'trust'"
              :aria-pressed="selectedVote === 'trust'"
              class="flex flex-col items-center justify-center gap-1.5 px-3 py-2 border-2 rounded-lg w-full transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-4"
              :class="selectedVote === 'trust'
              ? 'border-green-500 bg-gradient-to-b from-green-50 to-white text-green-800 shadow-md'
              : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 focus:ring-green-200'"
            >
              <ChevronUp
              :size="18"
              :class="selectedVote === 'trust' ? 'text-green-600' : 'text-gray-400'"
              />
              <div class="text-sm font-semibold leading-snug">This is Real News</div>
              <div class="text-xs text-gray-500">Confident / Supported by evidence</div>
            </button>

            <button
              type="button"
              @click="selectedVote = 'fake'"
              :aria-pressed="selectedVote === 'fake'"
              class="flex flex-col items-center justify-center gap-1.5 px-3 py-2 border-2 rounded-lg w-full transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-4"
              :class="selectedVote === 'fake'
              ? 'border-[#A5212A] bg-gradient-to-b from-red-50 to-white text-[#A5212A] shadow-md'
              : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 focus:ring-red-200'"
            >
              <ChevronDown
              :size="18"
              :class="selectedVote === 'fake' ? 'text-red-600' : 'text-gray-400'"
              />
              <div class="text-sm font-semibold leading-snug">This is Fake News</div>
              <div class="text-xs text-gray-500">Suspicious / Lacks reliable sources</div>
            </button>
          </div>
        </div>

        <div>
          <label for="userName" class="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="userName"
            type="text"
            id="userName"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A5212A] focus:border-[#A5212A]"
            placeholder="Enter your name..."
          >
        </div>

        <div>
          <label for="commentText" class="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
          <p class="text-sm text-gray-500 mb-2">Explain why you believe this news is real/fake</p>
          <textarea
            v-model="commentText"
            id="commentText"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A5212A] focus:border-[#A5212A]"
            placeholder="Share your reasoning and evidence..."
          ></textarea>
        </div>

        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">Supporting Image URL (Optional)</label>
          <p class="text-sm text-gray-500 mb-2">Add an image that supports your argument</p>
          <input
            v-model="imageUrl"
            type="url"
            id="imageUrl"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A5212A] focus:border-[#A5212A]"
            placeholder="https://example.com/supporting-image.jpg"
          >
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {{ errorMessage }}
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button
            type="button"
            @click="handleCancel"
            class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-2 text-sm font-medium text-white bg-[#d6414b] rounded-md hover:bg-[#A5212A] transition-colors"
          >
            Submit Vote & Comment
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
