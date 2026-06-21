"use client";

import dynamic from "next/dynamic";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false }
);

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  className?: string;
}

export function DiffViewer({
  original,
  modified,
  language = "typescript",
  className = "",
}: DiffViewerProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700/50 ${className}`}>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          folding: true,
          automaticLayout: true,
        }}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            加载代码对比中…
          </div>
        }
      />
    </div>
  );
}
