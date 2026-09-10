import { about } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/about",
  name: "AboutEditor",
  component: Layout,
  redirect: "/about/index",
  meta: {
    icon: "ri:user-3-line",
    title: "关于页编辑",
    rank: about
  },
  children: [
    {
      path: "/about/index",
      name: "AboutEditorIndex",
      component: () => import("@/views/about/index.vue"),
      meta: {
        title: "关于页编辑",
        keepAlive: true
      }
    }
  ]
} satisfies RouteConfigsTable;
