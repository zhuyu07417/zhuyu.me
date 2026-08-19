<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message as msg } from "@/utils/message";
import { ElMessageBox } from "element-plus";

defineOptions({ name: "FriendLinkApplyIndex" });

interface ApplyItem {
  id: number;
  name: string;
  url: string;
  avatar: string;
  description: string;
  created_at: string;
}

const loading = ref(false);
const items = ref<ApplyItem[]>([]);

function getToken(): string {
  const match = document.cookie.match(/authorized-token=([^;]+)/);
  if (!match) return "";
  try { return JSON.parse(decodeURIComponent(match[1])).accessToken || ""; } catch { return ""; }
}

async function api(method: string, url: string, body?: any) {
  const headers: any = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers["Authorization"] = "Bearer " + t;
  const opts: any = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

async function fetchPending() {
  loading.value = true;
  try { items.value = await api("GET", "/api/friend-links/pending"); }
  catch (e: any) { msg(e?.message ?? "加载失败", { type: "error" }); }
  finally { loading.value = false; }
}

async function handleApprove(item: ApplyItem) {
  try {
    await ElMessageBox.confirm(`通过 ${item.name} 的友链申请？`, "审批", { type: "info" });
    await api("POST", "/api/friend-links/approve", { link_id: item.id, approved: true });
    msg("已通过", { type: "success" });
    fetchPending();
  } catch {}
}

async function handleReject(item: ApplyItem) {
  try {
    await ElMessageBox.confirm(`拒绝并删除 ${item.name} 的申请？`, "审批", { type: "warning" });
    await api("POST", "/api/friend-links/approve", { link_id: item.id, approved: false });
    msg("已拒绝", { type: "success" });
    fetchPending();
  } catch {}
}

function formatDate(d: string) { return d ? d.replace("T", " ").slice(0, 19) : "-"; }

onMounted(() => fetchPending());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">友链申请 ({{ items.length }})</span>
          <el-button @click="fetchPending" :loading="loading" size="small">刷新</el-button>
        </div>
      </template>
      <div v-loading="loading" class="space-y-3">
        <div v-for="item in items" :key="item.id"
          class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          <img v-if="item.avatar" :src="item.avatar" class="w-10 h-10 rounded-full object-cover" />
          <div v-else class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 font-bold text-sm">{{ item.name.charAt(0) }}</div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm">{{ item.name }}</div>
            <div class="text-xs text-gray-400 truncate">{{ item.url }}</div>
            <div v-if="item.description" class="text-xs text-gray-500 mt-0.5">{{ item.description }}</div>
            <div class="text-[10px] text-gray-400 mt-1">申请于 {{ formatDate(item.created_at) }}</div>
          </div>
          <div class="flex gap-2 shrink-0">
            <el-button type="success" size="small" @click="handleApprove(item)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(item)">拒绝</el-button>
          </div>
        </div>
        <div v-if="!loading && items.length === 0" class="text-center py-12 text-gray-400 text-sm">暂无待审批申请</div>
      </div>
    </el-card>
  </div>
</template>
