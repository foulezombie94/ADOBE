export default function Footer() {
  return (
    <footer className="bg-[#0e0e10] h-6 flex justify-between items-center px-4 z-50 shrink-0 border-t border-outline-variant/10">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.625rem] text-[#6b6b72]">Performance: 60fps</span>
        <span className="text-[#6b6b72] text-[0.625rem]">|</span>
        <span className="font-mono text-[0.625rem] text-[#6b6b72]">Disk: 1.2TB Free</span>
        <span className="text-[#6b6b72] text-[0.625rem]">|</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="font-mono text-[0.625rem] text-primary">System Health: Optimal</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a className="font-mono text-[0.625rem] text-[#6b6b72] hover:text-[#e6e4ec] cursor-pointer">Media Encoder</a>
        <a className="font-mono text-[0.625rem] text-[#6b6b72] hover:text-[#e6e4ec] cursor-pointer">System Health</a>
        <a className="font-mono text-[0.625rem] text-[#6b6b72] hover:text-[#e6e4ec] cursor-pointer">Logs</a>
        <span className="font-mono text-[0.625rem] text-on-surface-variant">V 4.2.1-STABLE</span>
      </div>
    </footer>
  );
}
