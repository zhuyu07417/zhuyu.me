<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message as msg } from "@/utils/message";
import { ElMessageBox } from "element-plus";

defineOptions({ name: "PermanentTokenIndex" });

const loading = ref(false);
const generating = ref(false);
const token = ref("");
const createdAt = ref("");
const showToken = ref(false);

function getToken(): string {
  const match = document.cookie.match(/authorized-token=([^;]+)/);
  if (!match) return "";
  try {
    const data = JSON.parse(decodeURIComponent(match[1]));
    return data.accessToken || "";
  } catch { return ""; }
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

async function fetchToken() {
  loading.value = true;
  try {
    const d = await api("GET", "/api/admin/permanent-token");
    token.value = d.token || "";
    createdAt.value = d.created_at || "";
  } catch (e: any) { msg(e?.message ?? "加载失败", { type: "error" }); }
  finally { loading.value = false; }
}

async function generateToken() {
  try {
    await ElMessageBox.confirm("生成新密钥将使旧密钥失效，确认？", "确认", { type: "warning" });
    generating.value = true;
    const d = await api("POST", "/api/admin/permanent-token/generate");
    token.value = d.token;
    showToken.value = true;
    msg("新密钥已生成", { type: "success" });
  } catch {} finally { generating.value = false; }
}

async function revokeToken() {
  try {
    await ElMessageBox.confirm("确认吊销？", "确认", { type: "warning" });
    await api("DELETE", "/api/admin/permanent-token");
    token.value = "";
    msg("已吊销", { type: "success" });
  } catch {}
}

function copyToken() {
  navigator.clipboard.writeText(token.value).then(() => msg("已复制", { type: "success" }));
}

onMounted(() => fetchToken());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header><span class="font-medium">永久管理员密钥</span></template>
      <div v-loading="loading" class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          <p class="font-medium mb-1">什么是永久密钥？</p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>不会过期，适合 API 代发等长期场景</li>
            <li>生成新密钥时旧密钥自动失效</li>
            <li>与普通登录 Token（3天过期）互不影响</li>
          </ul>
        </div>
        <div v-if="token" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">当前密钥</span>
            <el-tag type="success" size="small">有效</el-tag>
          </div>
          <div class="flex items-center gap-2">
            <el-input :model-value="showToken ? token : '******************'" readonly class="flex-1" />
            <el-button size="small" @click="showToken = !showToken">{{ showToken ? '隐藏' : '显示' }}</el-button>
            <el-button size="small" type="primary" @click="copyToken">复制</el-button>
          </div>
          <p v-if="createdAt" class="text-xs text-gray-400 mt-2">创建: {{ createdAt.replace('T',' ').slice(0,19) }}</p>
        </div>
        <div v-else class="text-center py-8 text-gray-400 text-sm">暂未设置</div>
        <div class="flex gap-3">
          <el-button type="primary" @click="generateToken" :loading="generating">{{ token ? '重新生成' : '生成密钥' }}</el-button>
          <el-button type="danger" @click="revokeToken" :disabled="!token">吊销</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
