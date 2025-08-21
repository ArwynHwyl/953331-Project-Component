<script setup lang="ts">
import VoteformCard from '@/components/VoteformCard.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const id = Number(route.params.id);
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-4 sm:p-8 rounded-md">
    <div class="max-w-3xl mx-auto">
      <VoteformCard />
    </div>
  </main>
</template>
