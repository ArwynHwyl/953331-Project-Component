<script setup lang="ts">
import VoteformCard from '@/components/VoteformCard.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const id = Number(route.params.id);
</script>

<template>
  <main class=" bg-gray-50 p-4 sm:p-8 rounded-md">
    <div class="max-w-3xl mx-auto">
      <VoteformCard :id="id" />
    </div>
  </main>
</template>
