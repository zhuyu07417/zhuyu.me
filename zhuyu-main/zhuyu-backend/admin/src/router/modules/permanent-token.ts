const Layout = () => import("@/layout/index.vue");

export default {
  path: "/permanent-token",
  name: "PermanentToken",
  component: Layout,
  redirect: "/permanent-token/index",
  meta: {
    icon: "ri:key-2-line",
    title: "永久密钥",
    rank: 23,
  },
  children: [
    {
      path: "/permanent-token/index",
      name: "PermanentTokenIndex",
      component: () => import("@/views/permanent-token/index.vue"),
      meta: {
        title: "永久密钥",
      },
    },
  ],
} satisfies RouteConfigsTable;
