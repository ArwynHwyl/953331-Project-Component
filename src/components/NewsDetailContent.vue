<script setup lang="ts">
const props = defineProps<{
  imageUrl: string | null;
  title: string;
  fullDetail: string;
}>();
</script>

<template>
  <div>
    <img
      :src="imageUrl ?? ''"
      :alt="title"
      class="w-full h-auto object-cover rounded-lg mb-4 sm:mb-6"
    />
    <div
      class="prose max-w-none text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed"
      style="white-space: pre-wrap;"
    >
      {{ fullDetail }}
    </div>
  </div>
</template>
