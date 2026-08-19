"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type"); // "qq" or null (github)
    const redirectParam = searchParams.get("redirect");
    if (token) {
      if (type === "qq") {
        localStorage.setItem("qq_token", token);
        localStorage.removeItem("github_token");
        localStorage.removeItem("github_user");
        // 获取 QQ 用户信息
        fetch(`${process.env.NEXT_PUBLIC_API_BASE || ""}/api/auth/qq/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              localStorage.setItem(
                "qq_user",
                JSON.stringify({
                  login: data.login || data.nickname || "QQ用户",
                  avatar: data.avatar || "",
                  type: "qq",
                })
              );
            }
          })
          .catch(() => {})
                    .finally(() => {
            const redirectTo = redirectParam || sessionStorage.getItem("github_redirect") || "/moments";
            sessionStorage.removeItem("github_redirect");
            router.replace(redirectTo);
          });
      } else {
        localStorage.setItem("github_token", token);
        localStorage.removeItem("qq_token");
        localStorage.removeItem("qq_user");
        const redirectTo = redirectParam || sessionStorage.getItem("github_redirect") || "/messages";
        sessionStorage.removeItem("github_redirect");
        router.replace(redirectTo);
      }
    } else {
      router.replace("/moments");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );
}
