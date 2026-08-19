
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/admin-users",
  name: "AdminUsers",
  component: Layout,
  redirect: "/admin-users/index",
  meta: {
    icon: "ri:team-line",
    title: "用户管理",
    rank: 20,
  },
  children: [
    {
      path: "/admin-users/index",
      name: "AdminUsersIndex",
      component: () => import("@/views/admin-users/index.vue"),
      meta: {
        title: "用户管理",
      },
    },
  ],
} satisfies RouteConfigsTable;
