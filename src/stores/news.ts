import { defineStore } from 'pinia';
import type { NewsItem, HomeNewsItem, NewsStatus, DetailedNewsItem, NewsPayload, Comment, VotePayload } from '@/types';

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
      return state.newsList.map(news => {
        const { fake, trust } = news.totalVotes;
        const totalVotesCount = fake + trust;

        return {
          id: news.id,
          title: news.title,
          shortDetail: news.shortDetail,
          reporter: news.reporter,
          imageUrl: news.imageUrl,
          timestamp: news.timestamp,
          fakeVotes: fake,
          trustVotes: trust,
          totalVotesCount,
          commentCount: news.comments.length,
          status: getNewsStatus(fake, trust),
        };
      });
    },

    getNewsById: (state): ((newsId: number) => DetailedNewsItem | undefined) => {
      return (newsId: number): DetailedNewsItem | undefined => {
        const news = state.newsList.find((n) => (n.id === newsId));

        if (!news) { return undefined };

        const { fake, trust } = news.totalVotes;
        const totalVotesCount = fake + trust;

        return {
          ...news,
          fakeVotes: fake,
          trustVotes: trust,
          totalVotesCount,
          commentCount: news.comments.length,
          status: getNewsStatus(fake, trust),
        };
      };
    },
  },

  actions: {
    addNews(payload: NewsPayload): void {
      const news: NewsItem = {
        id: Date.now(),
        title: payload.title.trim(),
        shortDetail: payload.shortDetail.trim(),
        fullDetail: payload.fullDetail.trim(),
        imageUrl: payload.imageUrl?.trim() || null,
        reporter: payload.reporter,
        timestamp: new Date().toISOString(),
        totalVotes: { fake: 0, trust: 0 },
        comments: [],
      };
      this.newsList.unshift(news);
    },

    voteOnNews(payload: VotePayload): void {
      const news = this.newsList.find((n) => (n.id === payload.newsId));
      if (!news) return;

      const comment: Comment = {
        id: Date.now(),
        userId: payload.userId,
        vote: payload.vote,
        text: payload.text.trim(),
        imageUrl: payload.imageUrl?.trim() || null,
        timestamp: new Date().toISOString(),
      };

      news.comments.unshift(comment);

      if (payload.vote === 'fake') {
        news.totalVotes.fake++;
      } else {
        news.totalVotes.trust++;
      }
    },
  }
})
