"use client";
import { useState } from "react";
import { Smile } from "lucide-react";

interface Props {
  messageId: string;
  type: "classroom" | "live";
  cohortId: string;
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "💯", "🙌"];

export function ReactionList({ messageId, type, cohortId, reactions, onReact }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const entries = Object.entries(reactions).filter(([_, count]) => count > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {entries.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex items-center gap-1 bg-white/5 border border-white/10 hover:border-indigo-500/50 px-2 py-0.5 rounded-full transition-all group"
        >
          <span className="text-xs">{emoji}</span>
          <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-400">{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 text-slate-600 hover:text-indigo-400 transition-colors"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#12121c] border border-white/10 rounded-2xl shadow-2xl z-50 flex gap-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => {
                  onReact(e);
                  setShowPicker(false);
                }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
