import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ProveedoresApp from "@/app/proveedores/proveedores_app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://star-client.vercel.app"),
  title: {
    default: "Star Wars - Archivo de personajes",
    template: "%s | Star Wars",
  },
  description:
    "Explora los personajes del universo Star Wars, sus peliculas, los directores y los planetas donde aparecen.",
  openGraph: {
    type: "website",
    siteName: "Star Wars",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProveedoresApp>{children}</ProveedoresApp>
      </body>
    </html>
  );
}
