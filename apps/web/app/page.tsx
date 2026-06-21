"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "/workspace";
  }, []);

  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      正在跳转到工作台…
    </div>
  );
}
