import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/home"
    },
    {
      path: "/home",
      component: () => import("@/views/home.vue")
    },
    {
      path: "/graphdisplay",
      component: () => import("@/views/graph-display.vue")
    },
    {
      path: "/graphsearch",
      name: "graphsearch",
      component: () => import("@/views/graph-search.vue")
    },
    {
      path: "/graphcreate",
      component: () => import("@/views/graph-create.vue")
    },
    {
      path: "/question",
      component: () => import("@/views/Question.vue")
    },
    // {
    //   path: "/ner",
    //   component: () => import("@/views/Ner.vue")
    // },
    // {
    //   path: "/graphcompletion",
    //   component: () => import("@/views/graph-completion.vue")
    // },
  ]
})

export default router
