import { http } from "@/utils/http";

/** 获取背景图列表（公开接口） */
export const getBgImages = () => {
  return http.request<string[]>("get", "/api/site-config/bg-images/list");
};

/** 上传背景图（自动追加到列表） */
export const uploadBgImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.request<{ url: string; images: string[] }>(
    "post",
    "/api/site-config/bg-images/upload",
    {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
};

/** 整体替换背景图列表 */
export const setBgImages = (images: string[]) => {
  return http.request<{ ok: boolean; images: string[] }>(
    "put",
    "/api/site-config/bg-images",
    { data: images }
  );
};

/** 删除指定索引的背景图 */
export const deleteBgImage = (index: number) => {
  return http.request<{ ok: boolean; images: string[] }>(
    "delete",
    `/api/site-config/bg-images/${index}`
  );
};
