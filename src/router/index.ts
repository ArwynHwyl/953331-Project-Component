import { createRouter, createWebHistory } from 'vue-router'
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import HomeView from '../views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import CommentView from '@/views/CommentView.vue'
import VoteComment from '@/components/VoteComment.vue'

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
      component: DetailView,
      props: true
    },
    {
      path: '/news/:id/comment',
      name: 'comment-view',
      component: CommentView,
      props: true
    },
    {
      path: '/news/:id/vote',
      name: 'vote-view',
      component: VoteComment,
      props: true
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
