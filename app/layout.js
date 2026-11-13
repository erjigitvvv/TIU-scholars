import "./globals.css";

export const metadata = {
  title: "TIU Scholars — Scientific Potential & Scholars Portal",
  description: "Tashkent International University Scientific Potential & Scholars Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
