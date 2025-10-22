<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  trustVotes: number;
  fakeVotes: number;
  totalVotes: number;
}>();

const containerClass = computed(() => {
  if (props.fakeVotes > props.trustVotes) return 'bg-green-200';
  if (props.trustVotes > props.fakeVotes) return 'bg-red-200';
  return 'bg-gray-200';
});

const trustPercentage = computed(() =>
  props.totalVotes > 0 ? (props.trustVotes / props.totalVotes) * 100 : 0
);

const fakePercentage = computed(() =>
  props.totalVotes > 0 ? (props.fakeVotes / props.totalVotes) * 100 : 0
);

const showTrustSegment = computed(
  () => props.trustVotes >= props.fakeVotes || props.fakeVotes === 0
);

const showFakeSegment = computed(
  () => props.fakeVotes >= props.trustVotes || props.trustVotes === 0
);
</script>

<template>
  <div class="w-full rounded-full h-1.5 relative overflow-hidden mb-4 sm:mb-6" :class="containerClass">
    <div
      v-if="showTrustSegment"
      class="bg-green-500 h-1.5 rounded-r-full absolute left-0 top-0"
      :style="{ width: `${trustPercentage}%` }"
    />
    <div
      v-if="showFakeSegment"
      class="bg-red-500 h-1.5 rounded-l-full absolute right-0 top-0"
      :style="{ width: `${fakePercentage}%` }"
    />
  </div>
</template>
