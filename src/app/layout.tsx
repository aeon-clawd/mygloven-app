import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "my'G — Dashboard",
  description: "Sistema operativo para producción de eventos",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
