import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-detail-view',
      component: HomeView,
      props: (route) => ({
        page: parseInt(route.query.page?.toString() || '1'),
        limit: parseInt(route.query.limit?.toString() || '2'),
      }),
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: () => import('../views/DetailView.vue'),
    }, {
      path: '/news/:id/comment',
      name: 'comment-view',
      component: () => import('../views/CommentView.vue'),
    },
  ],
})

export default router
