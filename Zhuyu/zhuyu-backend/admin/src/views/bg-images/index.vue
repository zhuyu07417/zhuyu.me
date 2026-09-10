<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message as msg } from "@/utils/message";
import { UploadFilled } from "@element-plus/icons-vue";
import {
  getBgImages,
  uploadBgImage,
  deleteBgImage,
  setBgImages
} from "@/api/bgImages";

defineOptions({ name: "BgImagesIndex" });

const loading = ref(false);
const images = ref<string[]>([]);

async function onSearch() {
  loading.value = true;
  try {
    images.value = (await getBgImages()) || [];
  } catch {
    images.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleUpload(options: any) {
  const file = options.file as File;
  try {
    const res = await uploadBgImage(file);
    images.value = res.images || [];
    msg("上传成功", { type: "success" });
  } catch (e: any) {
    msg(e?.message ?? "上传失败", { type: "error" });
  }
}

async function handleDelete(index: number) {
  try {
    const res = await deleteBgImage(index);
    images.value = res.images || [];
    msg("删除成功", { type: "success" });
  } catch (e: any) {
    msg(e?.message ?? "删除失败", { type: "error" });
  }
}

async function handleMove(index: number, direction: "up" | "down") {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= images.value.length) return;
  const list = [...images.value];
  [list[index], list[target]] = [list[target], list[index]];
  try {
    await setBgImages(list);
    images.value = list;
    msg("排序成功", { type: "success" });
  } catch (e: any) {
    msg(e?.message ?? "排序失败", { type: "error" });
  }
}

onMounted(() => onSearch());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">背景图管理</span>
          <el-upload
            :show-file-list="false"
            :auto-upload="true"
            :http-request="handleUpload"
            accept="image/jpeg,image/png,image/webp"
          >
            <el-button type="primary">
              <el-icon class="mr-1"><UploadFilled /></el-icon>
              上传背景图
            </el-button>
          </el-upload>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        class="mb-4"
        title="上传的图片会自动添加到前端背景图列表中，用户可在设置面板切换。"
      />

      <div
        v-loading="loading"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <div
          v-for="(url, index) in images"
          :key="url"
          class="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video"
        >
          <img
            :src="url.startsWith('/') ? 'http://your_server_ip' + url : url"
            :alt="`背景图 ${index + 1}`"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs bg-black/60 text-white">
            {{ index + 1 }}
          </div>
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <el-button size="small" circle :disabled="index === 0" @click="handleMove(index, 'up')">↑</el-button>
            <el-button size="small" circle :disabled="index === images.length - 1" @click="handleMove(index, 'down')">↓</el-button>
            <el-popconfirm :title="`确认删除第 ${index + 1} 张背景图？`" @confirm="handleDelete(index)">
              <template #reference>
                <el-button size="small" circle type="danger">✕</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && images.length === 0" description="还没有背景图，点击右上角上传吧" />
    </el-card>
  </div>
</template>
