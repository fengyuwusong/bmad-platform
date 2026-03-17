import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMAD Platform",
  description: "将 BMAD-METHOD 的专业开发流程带到网页端",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t = localStorage.getItem('bmad-theme') || 'dark';
                var resolved = t === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : t;
                document.documentElement.setAttribute('data-theme', resolved);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
