import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, UserCheck } from 'lucide-react';
import { ChatMsg } from '../types';
import { GlassCard } from './GlassCard';

interface AssistentViewProps {
  messages: ChatMsg[];
  adviserMode: boolean;
  onSendMessage: (text: string) => void;
  onSwitchToAdviser: () => void;
  onBackToAi: () => void;
}

const SUGGESTIONS = [
  'Was heißt die EZB-Entscheidung für mich?',
  'Kann ich die Wohnung bezahlen?',
  'Was bedeutet dieser Brief?',
];

export function AssistentView({
  messages,
  adviserMode,
  onSendMessage,
  onSwitchToAdviser,
  onBackToAi,
}: AssistentViewProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, adviserMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="space-y-4">
      {/* Main Chat Container */}
      <GlassCard className="p-4 sm:p-6 flex flex-col">
        {/* Header / Mode Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.10]">
          <div className="flex items-center gap-3">
            {adviserMode ? (
              <div className="w-[44px] h-[44px] rounded-full bg-[#34C759]/20 border border-[#34C759]/40 text-[#34C759] flex items-center justify-center text-[14px] font-bold shrink-0">
                FY
              </div>
            ) : (
              <div className="w-[44px] h-[44px] rounded-full bg-[#0A84FF]/[0.18] border border-[#0A84FF]/35 text-[#0A84FF] flex items-center justify-center text-[13px] font-bold shrink-0">
                KI
              </div>
            )}
            <div>
              <h1 className="text-[17px] font-semibold text-white leading-tight">
                {adviserMode
                  ? 'Frau Yilmaz · Beraterin deiner Sparkasse vor Ort (Beispiel)'
                  : 's / One KI-Assistent'}
              </h1>
              <p className="text-[12px] text-[var(--label-2)] mt-0.5">
                {adviserMode
                  ? 'Verlauf vollständig übergeben · persönliche Beratung'
                  : 'Vorgefertigte Beispielantworten ohne echte API-Anbindung'}
              </p>
            </div>
          </div>

          {adviserMode && (
            <button
              type="button"
              onClick={onBackToAi}
              className="min-h-[40px] px-4 glass-btn text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück zur KI</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[72%] bg-[#E30613]/60 border border-[#FF8C8C]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] text-white rounded-[20px] rounded-br-md px-4 py-3 text-[14px] leading-relaxed">
                    <p>{msg.text}</p>
                    <div className="text-[11px] text-white/80 text-right mt-1 tabular-nums">
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.sender === 'adviser') {
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[88%] sm:max-w-[78%] bg-[#34C759]/18 border border-[#34C759]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] text-white rounded-[20px] rounded-bl-md px-4 py-3 text-[14px] leading-relaxed">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[#34C759]">
                        Beraterin · Frau Yilmaz
                      </span>
                      <span className="text-[11px] text-[var(--label-2)] tabular-nums">
                        {msg.time}
                      </span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[88%] sm:max-w-[78%] glass-inset text-white rounded-[20px] rounded-bl-md px-4 py-3 text-[14px] leading-relaxed">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0A84FF]/[0.18] text-[#0A84FF]">
                      KI
                    </span>
                    <span className="text-[11px] text-[var(--label-2)] tabular-nums">
                      {msg.time}
                    </span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Suggestion Chips */}
        {!adviserMode && (
          <div className="flex flex-wrap gap-2 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSendMessage(s)}
                className="min-h-[38px] px-3.5 glass-btn text-[13px] font-medium cursor-pointer text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
          <label htmlFor="assistent-input" className="sr-only">
            Nachricht eingeben
          </label>
          <input
            id="assistent-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              adviserMode
                ? 'Nachricht an Frau Yilmaz schreiben …'
                : 'Frage zu EZB, Miete, Brief oder Sparplan …'
            }
            className="flex-1 min-h-[48px] glass-input px-4 text-[14px] text-white placeholder:text-[var(--label-2)] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Nachricht senden"
            className="w-[48px] h-[48px] glass-btn glass-btn-primary flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Full-width Green Glass Human Handover Pill */}
        {!adviserMode && (
          <button
            type="button"
            onClick={onSwitchToAdviser}
            className="mt-4 w-full min-h-[48px] px-5 glass-btn glass-btn-green text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Mit einem Menschen sprechen, jederzeit</span>
          </button>
        )}
      </GlassCard>
    </div>
  );
}
