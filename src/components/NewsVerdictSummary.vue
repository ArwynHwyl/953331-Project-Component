<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import VerdictProgressBar from '@/components/VerdictProgressBar.vue';

const props = defineProps<{
  trustVotes: number;
  fakeVotes: number;
  totalVotes: number;
}>();

const trustRatio = computed(() =>
  props.totalVotes > 0 ? Math.round((props.trustVotes / props.totalVotes) * 100) : 0
);
</script>

<template>
  <div class="border-t border-b border-gray-200 py-3 mb-4 sm:mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
      <div class="flex items-center gap-2 flex-1">
        <button
          disabled
          aria-disabled="true"
          class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 cursor-not-allowed opacity-80 flex-1 sm:flex-none justify-center"
        >
          <ChevronUp :size="14" class="text-green-600" /> Trust ({{ trustVotes }})
        </button>
        <button
          disabled
          aria-disabled="true"
          class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold border border-gray-300 rounded-md flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 cursor-not-allowed opacity-80 flex-1 sm:flex-none justify-center"
        >
          <ChevronDown :size="14" class="text-red-600" /> Fake ({{ fakeVotes }})
        </button>
      </div>
      <span class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        {{ trustRatio }}% believe this is true
      </span>
    </div>
    <VerdictProgressBar :trust-votes="trustVotes" :fake-votes="fakeVotes" :total-votes="totalVotes" />
  </div>
</template>
