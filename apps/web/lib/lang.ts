export function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "scss":
    case "sass":
      return "scss";
    case "py":
      return "python";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "java":
      return "java";
    case "kt":
      return "kotlin";
    case "swift":
      return "swift";
    case "c":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "md":
    case "mdx":
      return "markdown";
    case "yaml":
    case "yml":
      return "yaml";
    case "sh":
    case "bash":
      return "shell";
    case "sql":
      return "sql";
    default:
      return "typescript";
  }
}
