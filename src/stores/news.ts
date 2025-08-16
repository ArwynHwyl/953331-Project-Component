import { defineStore } from 'pinia';
import type { NewsItem, HomeNewsItem, NewsStatus } from '@/types';

// Fake user id to check if user already comment on that news or not
const USER_ID = 'monkey'

function getNewsStatus(fake: number, trust: number): NewsStatus {
  const total = fake + trust;
  if (total === 0) return 'under-review';
  if (Math.abs(fake - trust) <= 1 && total >= 2) return 'disputed';
  return fake > trust ? 'fake' : 'trusted';
}

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [] as NewsItem[],
  }),

  getters: {
    getHomeNewsList: (state): HomeNewsItem[] => {
      return state.newsList.map(({
        id,
        title,
        shortDetail,
        reporter,
        imageUrl,
        totalVotes,
        comments,
        timestamp
      }) => {
        const { fake, trust } = totalVotes;
        const totalVotesCount = fake + trust;

        return {
          id,
          title,
          shortDetail,
          status: getNewsStatus(fake, trust),
          reporter,
          imageUrl,
          fakeVotes: fake,
          trustVotes: trust,
          totalVotesCount,
          commentCount: comments.length,
          timestamp,
        };
      });
    }
  }
})
