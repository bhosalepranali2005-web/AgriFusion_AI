import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TomatoGuard AI - Multimodal Crop Health",
  description: "Multimodal Crop Health & Microclimate Decision Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
