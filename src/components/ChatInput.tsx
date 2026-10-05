"use client";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
}: ChatInputProps) {
  return (
    <div className="relative z-20 border-t border-white/30 bg-white/15 px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[28px] border border-white/60 bg-white/80 p-2 shadow-2xl">
        
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Share what is on your mind..."
          className="min-h-[46px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-500"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-full
            bg-emerald-600
            text-white
            shadow-lg
            transition
            duration-200
            hover:bg-emerald-700
            active:scale-90
            disabled:cursor-not-allowed
            disabled:bg-slate-300
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-9-4Z" />
          </svg>
        </button>

      </div>

      <p className="mt-2 text-center text-[11px] text-slate-800/60">
        Take your time. There are no right or wrong answers.
      </p>
    </div>
  );
}