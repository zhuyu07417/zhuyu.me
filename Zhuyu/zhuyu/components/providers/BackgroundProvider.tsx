"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { siteConfig } from "@/siteConfig";

interface BackgroundContextType {
  bgImage: string;
  bgBlur: number;
  bgImages: string[];
  setBgImage: (img: string) => void;
  setBgBlur: (blur: number) => void;
}

const BackgroundContext = createContext<BackgroundContextType>({
  bgImage: "",
  bgBlur: 0,
  bgImages: [],
  setBgImage: () => {},
  setBgBlur: () => {},
});

export function useBackground() {
  return useContext(BackgroundContext);
}

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bgImages, setBgImages] = useState<string[]>(siteConfig.bgImages);
  const [bgImage, setBgImage] = useState("");
  const [bgBlur, setBgBlur] = useState(20);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    const savedImg = localStorage.getItem("bg-image");
    const savedBlur = localStorage.getItem("bg-blur");
    const fallback = siteConfig.bgImages[siteConfig.bgImages.length - 1] || "";
    setBgImage(savedImg || fallback);
    setBgBlur(savedBlur ? Number(savedBlur) : 20);
    setMounted(true);

    fetch(`${siteConfig.apiBaseUrl}/api/site-config/bg-images/list`)
      .then((res) => (res.ok ? res.json() : []))
      .then((images: string[]) => {
        if (!active || !images || images.length === 0) return;
        setBgImages(images);
        setBgImage((prev) =>
          images.includes(prev) ? prev : images[images.length - 1]
        );
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bg-image", bgImage);
    }
  }, [bgImage, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bg-blur", String(bgBlur));
    }
  }, [bgBlur, mounted]);

  if (!mounted) return null;

  return (
    <BackgroundContext.Provider value={{ bgImage, bgBlur, bgImages, setBgImage, setBgBlur }}>
      {children}
    </BackgroundContext.Provider>
  );
}
