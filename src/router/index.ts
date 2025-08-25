import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import HomeView from '../views/HomeView.vue'
import DetailView from '@/views/NewsSubroute/DetailView.vue'
import CommentView from '@/views/NewsSubroute/CommentView.vue'
import VoteformView from '@/views/NewsSubroute/VoteformView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      props: true,
      children: [
        {
          path: 'comment',
          name: 'comment-view',
          component: CommentView,
          props: true
        },
        {
          path: 'vote',
          name: 'vote-view',
          component: VoteformView,
          props: true
        }
      ]
    },
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
