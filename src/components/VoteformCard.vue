<script setup lang="ts">
import { ref } from 'vue'
const imageUrl = ref('');
const selectedVote = ref<'trust' | 'fake' | null>(null)
</script>

<template>
  <!-- Voting Form -->
    <form class="space-y-6 mx-auto max-w-3xl" aria-hidden="false" novalidate>
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
            <!-- Up chevron -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" :class="selectedVote === 'trust' ? 'text-green-600' : 'text-gray-400'">
              <path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

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
            <!-- Down chevron -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" :class="selectedVote === 'fake' ? 'text-red-600' : 'text-gray-400'">
              <path d="M18 9l-6 6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

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
          value=""
          type="text"
          id="userName"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A5212A] focus:border-[#A5212A]"
          placeholder="Enter your name..."
          aria-label="Your Name (UI only)"
        />
      </div>

      <div>
        <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <textarea
          id="comment"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A5212A] focus:border-[#A5212A]"
          placeholder="Add your comment"
          aria-label="Comment"
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

      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 "
        >
          Submit
        </button>
      </div>
    </form>
</template>


