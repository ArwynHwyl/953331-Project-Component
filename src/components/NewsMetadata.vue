<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, MessageCircle, User } from 'lucide-vue-next';

const props = defineProps<{
  reporter: string;
  timestamp: string;
  commentCount: number;
}>();

const formattedTimestamp = computed(() =>
  new Date(props.timestamp).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
);
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-xs sm:text-sm text-gray-500 mb-4 gap-1 sm:gap-x-4 sm:gap-y-1">
    <span class="flex items-center">
      <User :size="12" class="mr-1 sm:mr-1.5" /> By {{ reporter }}
    </span>
    <span class="flex items-center">
      <Calendar :size="12" class="mr-1 sm:mr-1.5" /> {{ formattedTimestamp }}
    </span>
    <span class="flex items-center">
      <MessageCircle :size="12" class="mr-1 sm:mr-1.5" /> {{ commentCount }} Comments
    </span>
  </div>
</template>
