import { defineStore } from 'pinia';
import type { Comment, VotePayload } from '@/types';

// function getNewsStatus(fake: number, trust: number): NewsStatus {
//   const total = fake + trust;
//   if (total === 0) return 'under-review';
//   if (Math.abs(fake - trust) <= 1 && total >= 2) return 'disputed';
//   return fake > trust ? 'fake' : 'trusted';
// }


export const useNewsStore = defineStore('news', {
  state: () => ({
    newComments: [] as Comment[]
  }),

  getters: {
    getNewCommentsByNewsId: (state) => {
      return (newsId: number): Comment[] => {
        return state.newComments.filter(comment => comment.newsId === newsId);
      }
    }
  },

  actions: {
    addVote(payload: VotePayload): void {
      if (!payload.newsId || !payload.userId || !payload.vote) {
        console.error("Invalid vote payload: ", payload)
        return;
      }

      const newComment: Comment = {
        id: Date.now(),
        newsId: payload.newsId,
        userId: payload.userId,
        vote: payload.vote,
        text: payload.text.trim(),
        imageUrl: payload.imageUrl?.trim() || null,
        timestamp: new Date().toISOString()
      }

      this.newComments.push(newComment);
    }
  }
})
