import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TurtleCode - 乌龟码',
  description: '基于 DeepSeek V4 的 AI Agent 编程工具',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  );
}
