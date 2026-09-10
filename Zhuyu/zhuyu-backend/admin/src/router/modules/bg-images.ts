import { bgImages } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/bg-images",
  name: "BgImages",
  component: Layout,
  redirect: "/bg-images/index",
  meta: {
    icon: "ri:image-line",
    title: "背景图管理",
    rank: bgImages
  },
  children: [
    {
      path: "/bg-images/index",
      name: "BgImagesIndex",
      component: () => import("@/views/bg-images/index.vue"),
      meta: {
        title: "背景图管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
