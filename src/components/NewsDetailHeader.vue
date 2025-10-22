<script setup lang="ts">
import { computed } from 'vue';
import type { NewsStatus } from '@/types';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldX,
} from 'lucide-vue-next';

const props = defineProps<{
  title: string;
  status: NewsStatus;
}>();

const statusInfo = computed(() => {
  switch (props.status) {
    case 'trusted':
      return {
        text: 'Verified as Trust',
        badgeClasses: 'bg-green-100 text-green-800',
        icon: ShieldCheck,
      };
    case 'fake':
      return {
        text: 'Verified as Fake',
        badgeClasses: 'bg-red-100 text-red-800',
        icon: ShieldX,
      };
    case 'disputed':
      return {
        text: 'Disputed',
        badgeClasses: 'bg-amber-100 text-amber-800',
        icon: AlertTriangle,
      };
    default:
      return {
        text: 'Under Review',
        badgeClasses: 'bg-gray-100 text-gray-800',
        icon: Clock,
      };
  }
});
</script>

<template>
  <div class="mb-4">
    <h1 class="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2">
      {{ title }}
    </h1>
    <span
      class="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium w-fit"
      :class="statusInfo.badgeClasses"
    >
      <component :is="statusInfo.icon" :size="16" class="mr-1.5" />
      {{ statusInfo.text }}
    </span>
  </div>
</template>
