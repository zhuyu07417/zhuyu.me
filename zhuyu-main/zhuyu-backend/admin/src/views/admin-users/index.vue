<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message as msg } from "@/utils/message";
import { http } from "@/utils/http";
import { ElMessageBox } from "element-plus";

defineOptions({ name: "AdminUsersIndex" });

interface UserItem {
  id: number;
  type: "github" | "qq";
  name: string;
  avatar: string;
  bio: string;
  created_at: string;
}

const loading = ref(false);
const users = ref<UserItem[]>([]);
const filterType = ref<string>("all");

const filteredUsers = computed(() => {
  if (filterType.value === "all") return users.value;
  return users.value.filter((u) => u.type === filterType.value);
});

const stats = ref({ github_count: 0, qq_count: 0, total: 0 });

async function fetchUsers() {
  loading.value = true;
  try {
    users.value = await http.get("/api/admin/users");
    stats.value = await http.get("/api/admin/users/stats");
  } catch (e: any) {
    msg(e?.message ?? "加载失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function handleDelete(user: UserItem) {
  try {
    await ElMessageBox.confirm(
      `确认删除用户 ${user.name}（${user.type}）？`,
      "删除确认",
      { type: "warning" }
    );
    await http.delete(`/api/admin/users/${user.type}/${user.id}`);
    msg("删除成功", { type: "success" });
    fetchUsers();
  } catch {}
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.replace("T", " ").slice(0, 19);
}

onMounted(() => fetchUsers());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <span class="font-medium">用户管理</span>
            <span class="text-xs text-gray-400 ml-2">
              共 {{ stats.total }} 个用户（GitHub {{ stats.github_count }} / QQ {{ stats.qq_count }}）
            </span>
          </div>
          <el-button @click="fetchUsers" :loading="loading" size="small">刷新</el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="mb-4 flex gap-2">
        <el-button :type="filterType === 'all' ? 'primary' : ''" size="small" @click="filterType = 'all'">全部</el-button>
        <el-button :type="filterType === 'github' ? 'primary' : ''" size="small" @click="filterType = 'github'">GitHub</el-button>
        <el-button :type="filterType === 'qq' ? 'primary' : ''" size="small" @click="filterType = 'qq'">QQ</el-button>
      </div>

      <!-- 用户列表 -->
      <div v-loading="loading" class="space-y-3">
        <div v-for="user in filteredUsers" :key="user.type + user.id"
          class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
          <el-avatar :src="user.avatar" :size="40" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm truncate">{{ user.name }}</span>
              <el-tag :type="user.type === 'github' ? 'info' : 'primary'" size="small">
                {{ user.type === "github" ? "GitHub" : "QQ" }}
              </el-tag>
            </div>
            <p v-if="user.bio" class="text-xs text-gray-400 truncate mt-0.5">{{ user.bio }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ formatDate(user.created_at) }}</p>
          </div>
          <el-button link type="danger" size="small" @click="handleDelete(user)">删除</el-button>
        </div>

        <div v-if="!loading && filteredUsers.length === 0" class="text-center py-12 text-gray-400 text-sm">
          暂无用户
        </div>
      </div>
    </el-card>
  </div>
</template>
