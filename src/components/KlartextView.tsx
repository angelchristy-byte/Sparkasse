import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react';
import { KLARTEXT_NEWS } from '../data/mockData';
import { UserNumbers } from '../types';
import { GlassCard } from './GlassCard';

interface KlartextViewProps {
  userNumbers: UserNumbers;
  onChangeNumbers: (next: UserNumbers) => void;
  onShowToast: (message: string) => void;
}

export function KlartextView({
  userNumbers,
  onChangeNumbers,
  onShowToast,
}: KlartextViewProps) {
  const [openFormulaIds, setOpenFormulaIds] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});

  const toggleFormula = (id: string) => {
    setOpenFormulaIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({ ...prev, [id]: prev[id] === type ? null : type }));
    onShowToast(
      type === 'up'
        ? 'Danke für dein Feedback zur Euro-Zeile.'
        : 'Hinweis gemeldet · wird im Konzept geprüft.'
    );
  };

  return (
    <div className="space-y-4">
      {/* Header + Notice Badges */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[12px] font-medium px-3 py-1 rounded-full glass-inset text-white">
            Handelsblatt · Aktuelle Artikel
          </span>
          <span className="text-[12px] font-medium px-3 py-1 rounded-full glass-inset text-[var(--label-2)]">
            Euro-Einordnung · Beispieldaten
          </span>
        </div>

        <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-white">
          Klartext · Was bedeutet das für dein Geld?
        </h1>
        <p className="text-[14px] text-[var(--label-2)] mt-1.5 leading-relaxed">
          Aktuelle Wirtschafts- und Finanzartikel vom Handelsblatt – sachlich zusammengefasst und direkt für deine Zahlen in Euro eingeordnet.
        </p>

        {/* Deine Zahlen */}
        <div className="mt-5 pt-5 border-t border-white/[0.10]">
          <div className="text-[13px] font-semibold text-white mb-3">
            Deine Zahlen (live für die Berechnung)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block glass-input p-3.5">
              <span className="block text-[12px] text-[var(--label-2)]">
                Tagesgeld (€)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={userNumbers.tagesgeld}
                onChange={(e) =>
                  onChangeNumbers({
                    ...userNumbers,
                    tagesgeld: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full bg-transparent text-[17px] font-semibold text-white placeholder:text-[var(--label-2)] tabular-nums focus:outline-none"
              />
            </label>

            <label className="block glass-input p-3.5">
              <span className="block text-[12px] text-[var(--label-2)]">
                Kaltmiete (€ / Monat)
              </span>
              <input
                type="number"
                min={0}
                step={10}
                value={userNumbers.kaltmiete}
                onChange={(e) =>
                  onChangeNumbers({
                    ...userNumbers,
                    kaltmiete: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full bg-transparent text-[17px] font-semibold text-white placeholder:text-[var(--label-2)] tabular-nums focus:outline-none"
              />
            </label>

            <label className="block glass-input p-3.5">
              <span className="block text-[12px] text-[var(--label-2)]">
                Strom (kWh / Jahr)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={userNumbers.stromKwh}
                onChange={(e) =>
                  onChangeNumbers({
                    ...userNumbers,
                    stromKwh: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1 w-full bg-transparent text-[17px] font-semibold text-white placeholder:text-[var(--label-2)] tabular-nums focus:outline-none"
              />
            </label>
          </div>
        </div>
      </GlassCard>

      {/* 4 News Cards */}
      <div className="space-y-4">
        {KLARTEXT_NEWS.map((item) => {
          const isOpen = !!openFormulaIds[item.id];
          const fb = feedback[item.id];

          return (
            <GlassCard as="article" key={item.id} className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 text-[var(--label-2)]">
                  <span className="text-[12px] font-medium">{item.source}</span>
                  <span>·</span>
                  <span className="text-[12px] font-medium">{item.topic}</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0A84FF]/[0.18] text-[#0A84FF]">
                  KI
                </span>
              </div>

              <h2 className="text-[18px] font-semibold text-white tracking-[-0.01em]">
                {item.headline}
              </h2>
              <p className="text-[14px] text-[var(--label-2)] mt-1.5 leading-relaxed">
                {item.summary}
              </p>

              {/* Sparkasse Euro Line */}
              <div className="mt-4 p-4 glass-inset">
                <div className="text-[12px] font-medium text-[var(--label-2)] mb-1">
                  Was das für dein Geld bedeutet
                </div>
                <p className="text-[15px] font-medium text-white tabular-nums leading-snug">
                  {item.computeEuroLine(userNumbers)}
                </p>

                {item.hasFormula && isOpen && (
                  <div className="mt-3 pt-3 border-t border-white/[0.10] text-[13px] text-[var(--label-2)] tabular-nums">
                    Rechenweg: {item.computeFormula(userNumbers)}
                  </div>
                )}
              </div>

              {/* Card Controls */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {item.hasFormula && (
                    <button
                      type="button"
                      onClick={() => toggleFormula(item.id)}
                      className="min-h-[40px] px-4 glass-btn text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isOpen ? 'Rechnung ausblenden' : 'Rechnung zeigen'}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--label-2)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--label-2)]" />
                      )}
                    </button>
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-4 glass-btn text-[var(--label-2)] hover:text-white text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Zum Handelsblatt-Artikel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(item.id, 'up')}
                    aria-label="Hilfreich"
                    className={`min-h-[40px] px-3.5 glass-btn text-[13px] font-medium flex items-center gap-1.5 cursor-pointer ${
                      fb === 'up'
                        ? '!bg-[#34C759]/25 !border-[#34C759]/50 text-[#34C759]'
                        : 'text-[var(--label-2)] hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Hilfreich</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(item.id, 'down')}
                    aria-label="Fehler melden"
                    className={`min-h-[40px] px-3.5 glass-btn text-[13px] font-medium flex items-center gap-1.5 cursor-pointer ${
                      fb === 'down'
                        ? '!bg-[#FF6961]/25 !border-[#FF6961]/50 text-[#FF6961]'
                        : 'text-[var(--label-2)] hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Fehler melden</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
