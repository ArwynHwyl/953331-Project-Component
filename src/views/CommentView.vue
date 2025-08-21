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
  <main class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-3xl mx-auto">
      <CommentList :id="id" :limit="limit" :page="page" />
    </div>
  </main>
</template>
