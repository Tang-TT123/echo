import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'echo 回声',
    template: '%s | echo 回声',
  },
  description: '为 INFJ 打造的数字避难所——让深度不再孤独，让洞察成为力量。',
  keywords: [
    'echo',
    '回声',
    'INFJ',
    '精神避难所',
    '情绪安放',
    '自我理解',
    '关系导航',
    'MBTI',
  ],
  authors: [{ name: 'echo Team' }],
  generator: 'Coze Code',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`antialiased bg-background text-foreground`}>
        {isDev && <Inspector />}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
