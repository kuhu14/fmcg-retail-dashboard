import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FMCG Sales",
  description: "FMCG retail sales, customer & inventory dashboard for 2024",
  appleWebApp: {
    capable: true,
    title: "FMCG Sales",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a78d6",
};

const THEME_BOOTSTRAP = `
try {
  var m = localStorage.getItem("fmcg-theme-mode");
  if (m === "light" || m === "dark") {
    document.documentElement.setAttribute("data-theme", m);
  }
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
