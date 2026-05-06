"use client";
import { useState, useRef, useEffect } from "react";
import { AtSign, Image as ImageIcon, Send, Loader2 } from "lucide-react";

interface User { id: string; name: string; image?: string|null; role: string; }
interface Props {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  users: User[];
}

export function MentionInput({ value, onChange, onSend, loading, users }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1 && (lastAt === 0 || value[lastAt - 1] === " ")) {
      const textAfterAt = value.slice(lastAt + 1);
      if (!textAfterAt.includes(" ")) {
        setFilter(textAfterAt);
        setShowPicker(true);
        return;
      }
    }
    setShowPicker(false);
  }, [value]);

  const insertMention = (user: User) => {
    const lastAt = value.lastIndexOf("@");
    const before = value.slice(0, lastAt);
    const after = value.slice(lastAt + 1 + filter.length);
    onChange(`${before}@${user.name.replace(/\s/g, '')} `);
    setShowPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showPicker) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredUsers[selectedIndex]) insertMention(filteredUsers[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowPicker(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-xl">
      {showPicker && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-50">
          <div className="p-2 border-b border-white/5 bg-white/5"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Mention Someone</p></div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredUsers.map((u, i) => (
              <button 
                key={u.id} 
                onClick={() => insertMention(u)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${i === selectedIndex ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{u.name}</p>
                  <p className={`text-[9px] uppercase font-black tracking-widest ${i === selectedIndex ? 'text-white/60' : 'text-slate-600'}`}>{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative group">
          <input 
            ref={inputRef}
            className="w-full bg-white/5 border border-white/10 group-focus-within:border-indigo-500/50 rounded-2xl pl-4 pr-12 py-4 text-white text-sm focus:outline-none transition-all placeholder:text-slate-600" 
            placeholder="Type a message or mention someone with @..." 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <button onClick={() => onChange(value + "@")} className="text-slate-500 hover:text-indigo-400 transition-colors"><AtSign className="w-4 h-4"/></button>
            <button className="text-slate-500 hover:text-indigo-400 transition-colors"><ImageIcon className="w-4 h-4"/></button>
          </div>
        </div>
        <button onClick={onSend} disabled={loading || !value.trim()} className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
        </button>
      </div>
    </div>
  );
}
