<script setup lang="ts">
// import VoteComment from '@/components/VoteComment.vue';
import CommentList from '@/components/CommentList.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const id = Number(route.params.id);
const limit = Number(route.params.limit) || 2;
const page = Number(route.params.page) || 1;
</script>

<template>
  <main class=" bg-gray-50 p-4 sm:p-8 rounded-md ">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <router-link :to="`/news/${id}`"
          class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Back to News Detail</span>
        </router-link>
      </div>
      <CommentList :id="id" :limit="limit" :page="page" />
    </div>


  </main>
</template>
