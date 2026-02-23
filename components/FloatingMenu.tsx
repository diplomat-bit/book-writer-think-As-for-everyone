
import React from 'react';
import { RefreshCcw, Sparkles, AlignLeft, ShieldCheck, PenTool } from 'lucide-react';

interface FloatingMenuProps {
  selection: string;
  onAction: (action: string) => void;
  position: { x: number; y: number } | null;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ selection, onAction, position }) => {
  if (!position || !selection) return null;

  const actions = [
    { id: 'STYLIZED', label: 'Calligraphy', icon: PenTool },
    { id: 'REWRITE', label: 'Optimize', icon: RefreshCcw },
    { id: 'ELABORATE', label: 'Expand', icon: Sparkles },
    { id: 'FORMAL', label: 'Executive Tone', icon: ShieldCheck },
    { id: 'SUMMARY', label: 'Summarize', icon: AlignLeft }
  ];

  const menuWidth = 180;
  const left = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, position.x - (menuWidth / 2)));
  const top = position.y - 210 > 0 ? position.y - 210 : position.y + 40;

  return (
    <div 
      className="fixed z-[400] flex flex-col bg-white border border-slate-300 rounded shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ top, left, width: `${menuWidth}px` }}
    >
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Directive Menu</span>
      </div>
      {actions.map((action) => (
        <button
          key={action.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onAction(action.id);
          }}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all border-b border-slate-100 last:border-0 group"
        >
          <action.icon size={14} className="text-slate-400 group-hover:text-blue-500" />
          <span className="text-xs font-semibold">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
