import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "NexTask — Futuristic Task Manager",
  description: "A powerful, beautiful note and todo management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1526",
              color: "#e2e8f0",
              border: "1px solid #1a2a4a",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#0d1526" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0d1526" } },
          }}
        />
      </body>
    </html>
  );
}
