const Layout = () => import("@/layout/index.vue");
export default {
  path: "/friend-link-apply",
  name: "FriendLinkApply",
  component: Layout,
  redirect: "/friend-link-apply/index",
  meta: { icon: "ri:links-line", title: "友链审批", rank: 24 },
  children: [
    { path: "/friend-link-apply/index", name: "FriendLinkApplyIndex", component: () => import("@/views/friend-link-apply/index.vue"), meta: { title: "友链审批" } },
  ],
} satisfies RouteConfigsTable;
