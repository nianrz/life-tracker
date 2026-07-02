import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ensureModulesRegistered } from "@/lib/modules/bootstrap";
import { headers } from "next/headers";

ensureModulesRegistered();

export const metadata: Metadata = {
  title: "Life tracker",
  description: "Personal life tracker: fitness, school, and finances in one place.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hide chrome (sidebar, bottom bar) on the login page and auth routes.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const hideChrome = pathname === "/login" || pathname.startsWith("/auth/");

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {hideChrome ? (
            children
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8 pb-24 lg:pb-8 max-w-[1100px] mx-auto w-full">
                {children}
              </main>
            </div>
          )}
          {!hideChrome && <BottomTabBar />}
        </ThemeProvider>
      </body>
    </html>
  );
}
