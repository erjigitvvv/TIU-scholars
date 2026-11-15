'use client';

export default function PageBackgroundShell({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col bg-repeat bg-fixed"
      style={{
        backgroundImage: "url('/scholar-bg-pattern.jpg')",
        backgroundSize: '420px auto',
      }}
    >
      <div className="min-h-screen flex flex-col bg-[#E8EDF5]/75 dark:bg-slate-950/88">
        {children}
      </div>
    </div>
  );
}
