<script setup lang="ts">
// import VoteComment from '@/components/VoteComment.vue';
import CommentList from '@/components/CommentList.vue';

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-3xl mx-auto">
      <CommentList :id="props.id" />
    </div>
  </main>
</template>
