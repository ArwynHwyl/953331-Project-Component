import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import CommentView from '@/views/CommentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-detail-view',
      component: HomeView,
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: DetailView,
    },{
      path: '/news/:id/comment',
      name: 'comment-view',
      component: CommentView,
    },
  ],
})

export default router
