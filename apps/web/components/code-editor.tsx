"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  language = "typescript",
  readOnly = true,
  className = "",
}: CodeEditorProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700/50 ${className}`}>
      <Editor
        value={value}
        language={language}
        theme="vs-dark"
        height="100%"
        width="100%"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          folding: true,
          automaticLayout: true,
          lineNumbers: "on",
        }}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            加载编辑器…
          </div>
        }
      />
    </div>
  );
}
