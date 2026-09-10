<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message as msg } from "@/utils/message";
import { getAboutContent, updateAboutContent } from "@/api/siteConfig";
import { http } from "@/utils/http";
import { UploadFilled } from "@element-plus/icons-vue";

defineOptions({ name: "AboutEditor" });

const loading = ref(false);
const saving = ref(false);
const content = ref("");
const originalContent = ref("");

// 封面图
const coverUrl = ref("");
const originalCoverUrl = ref("");
const uploadingCover = ref(false);

const coverChanged = computed(() => coverUrl.value !== originalCoverUrl.value);
const contentChanged = computed(() => content.value !== originalContent.value);
const hasChanges = computed(() => coverChanged.value || contentChanged.value);

async function loadContent() {
  loading.value = true;
  try {
    // 拉取 about_content
    const data = await getAboutContent();
    let text = "";
    if (typeof data === "string") {
      text = data;
    } else if (data?.value !== undefined) {
      text = typeof data.value === "string" ? data.value : JSON.stringify(data.value);
    } else if (data) {
      text = String(data);
    }
    content.value = text;
    originalContent.value = text;

    // 拉取 about_cover（可能不存在，404 静默处理）
    try {
      const coverData = await http.request("get", "/api/site-config/about_cover");
      let cover = "";
      if (typeof coverData === "string") {
        cover = coverData;
      } else if (coverData?.value !== undefined) {
        cover = typeof coverData.value === "string" ? coverData.value : "";
      }
      coverUrl.value = cover;
      originalCoverUrl.value = cover;
    } catch {
      // about_cover 不存在，静默
    }
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.statusCode === 404) {
      content.value = "";
      msg("尚未创建关于页内容，编辑后保存即可", { type: "info" });
    } else {
      msg(e?.message ?? "加载失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
}

// 封面图上传
async function handleCoverUpload(file: File) {
  uploadingCover.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.request("post", "/api/upload/image", {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" }
    });
    const url = (res as any)?.url || (res as any)?.data?.url || "";
    if (url) {
      coverUrl.value = url;
      msg("封面上传成功", { type: "success" });
    } else {
      msg("上传返回无 url", { type: "error" });
    }
  } catch (e: any) {
    msg(e?.message ?? "封面上传失败", { type: "error" });
  } finally {
    uploadingCover.value = false;
  }
  return false; // 阻止 el-upload 自动上传
}

function handleCoverRemove() {
  coverUrl.value = "";
}

async function handleSave() {
  if (!content.value.trim() && !coverUrl.value) {
    msg("内容和封面不能都为空", { type: "warning" });
    return;
  }
  saving.value = true;
  try {
    // 保存内容
    if (contentChanged.value) {
      await updateAboutContent(content.value);
      originalContent.value = content.value;
    }
    // 保存封面
    if (coverChanged.value) {
      await http.request("put", "/api/site-config/about_cover", {
        data: { value: coverUrl.value, description: "关于页封面图" }
      });
      originalCoverUrl.value = coverUrl.value;
    }
    msg("保存成功", { type: "success" });
  } catch (e: any) {
    msg(e?.message ?? "保存失败", { type: "error" });
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  content.value = originalContent.value;
  coverUrl.value = originalCoverUrl.value;
  msg("已重置", { type: "info" });
}

onMounted(() => loadContent());
</script>

<template>
  <div class="p-4">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-medium">关于页编辑</span>
          <div>
            <el-button @click="handleReset" :disabled="saving || !hasChanges">重置</el-button>
            <el-button
              type="primary"
              @click="handleSave"
              :loading="saving"
              :disabled="!hasChanges"
            >
              保存
            </el-button>
          </div>
        </div>
      </template>

      <!-- 封面图上传区 -->
      <div class="mb-6">
        <div class="mb-2 text-sm font-medium text-gray-600">封面图</div>
        <div v-if="coverUrl" class="relative inline-block group">
          <img
            :src="coverUrl"
            alt="封面图预览"
            class="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <el-upload
              :show-file-list="false"
              :before-upload="handleCoverUpload"
              accept="image/*"
            >
              <el-button size="small" type="primary" :loading="uploadingCover">更换</el-button>
            </el-upload>
            <el-button size="small" type="danger" @click="handleCoverRemove">移除</el-button>
          </div>
        </div>
        <el-upload
          v-else
          :show-file-list="false"
          :before-upload="handleCoverUpload"
          accept="image/*"
          class="border-2 border-dashed border-gray-300 rounded-lg w-full max-w-md h-48 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div class="text-center text-gray-400" v-loading="uploadingCover">
            <el-icon size="32"><UploadFilled /></el-icon>
            <div class="mt-2 text-sm">点击上传封面图</div>
          </div>
        </el-upload>
      </div>

      <el-divider />

      <!-- 内容编辑区 -->
      <div class="mb-2 text-sm font-medium text-gray-600">关于页内容（Markdown）</div>
      <el-input
        v-model="content"
        type="textarea"
        :rows="24"
        placeholder="在此输入关于页内容，支持 Markdown 语法..."
        class="font-mono"
      />
      <div class="mt-2 text-xs text-gray-400">
        支持 Markdown 语法、emoji 表情、frontmatter（cover 字段将被上方封面图覆盖）
      </div>
    </el-card>
  </div>
</template>
