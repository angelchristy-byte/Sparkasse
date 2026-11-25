import { useEffect, useState } from 'react';
import {
  CalendarClock,
  Check,
  Coins,
  CreditCard,
  LayoutGrid,
  Lock,
  MapPin,
  Plus,
  Repeat,
  Target,
  Unlock,
  X,
} from 'lucide-react';
import { StartWidgetId, StartWidgetMeta, TabId } from '../types';
import { formatEur } from '../utils/format';
import { GlassCard } from './GlassCard';

interface StartWidgetsSectionProps {
  monthlyBonusEur: number;
  onSelectTab: (tab: TabId) => void;
  onShowToast: (message: string) => void;
}

const WIDGET_CATALOG: (StartWidgetMeta & { icon: typeof CreditCard; color: string })[] = [
  {
    id: 'karten',
    title: 'Karten & Sicherheit',
    category: 'Karten',
    description: 'Sparkassen-Card & Debitkarte direkt sperren, entsperren oder Limits prüfen.',
    icon: CreditCard,
    color: '#0A84FF',
  },
  {
    id: 'sparziele',
    title: 'Sparziele',
    category: 'Sparen',
    description: 'Fortschritt für Notgroschen und Urlaub mit direkter Einzahlung verfolgen.',
    icon: Target,
    color: '#34C759',
  },
  {
    id: 'abos',
    title: 'Abo- & Vertrags-Check',
    category: 'Verträge',
    description: 'Monatliche Fixkosten wie Deutschlandticket und Streaming gebündelt sehen.',
    icon: Repeat,
    color: '#BF5AF2',
  },
  {
    id: 'wechselgeld',
    title: 'Wechselgeld-Sparen',
    category: 'Automatik',
    description: 'Kartenzahlungen automatisch auf den nächsten Euro aufrunden und ansparen.',
    icon: Coins,
    color: '#FF9F0A',
  },
  {
    id: 'fristen',
    title: 'Fristen & Termine',
    category: 'S-Pass',
    description: 'Offene Brief- und Steuerfristen aus dem S-Pass direkt auf Start im Blick.',
    icon: CalendarClock,
    color: '#FF6961',
  },
  {
    id: 'kiezbonus',
    title: 'Kiez-Bonus Ticker',
    category: 'Heimvorteil',
    description: 'Deinen aktuellen lokalen Cashback-Stand direkt auf der Startseite anzeigen.',
    icon: MapPin,
    color: '#5AC8FA',
  },
];

export function StartWidgetsSection({
  monthlyBonusEur,
  onSelectTab,
  onShowToast,
}: StartWidgetsSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<StartWidgetId[]>([]);

  // Interactive states for example widgets
  const [cardFrozen, setCardFrozen] = useState(false);
  const [emergencySaved, setEmergencySaved] = useState(950);
  const [holidaySaved, setHolidaySaved] = useState(420);
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);
  const [roundUpTotal, setRoundUpTotal] = useState(18.4);
  const [subAlertEnabled, setSubAlertEnabled] = useState(true);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pickerOpen]);

  const toggleWidget = (id: StartWidgetId) => {
    const meta = WIDGET_CATALOG.find((w) => w.id === id);
    setActiveWidgets((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        onShowToast(`${meta?.title ?? 'Widget'} von Startseite entfernt`);
        return prev.filter((item) => item !== id);
      }
      onShowToast(`${meta?.title ?? 'Widget'} zur Startseite hinzugefügt`);
      return [...prev, id];
    });
  };

  const removeWidget = (id: StartWidgetId) => {
    const meta = WIDGET_CATALOG.find((w) => w.id === id);
    setActiveWidgets((prev) => prev.filter((item) => item !== id));
    onShowToast(`${meta?.title ?? 'Widget'} entfernt`);
  };

  return (
    <div className="space-y-4">
      {/* User-added Startseite Widgets */}
      {activeWidgets.length > 0 && (
        <section
          aria-label="Hinzugefügte Widgets"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeWidgets.map((id) => {
            const meta = WIDGET_CATALOG.find((w) => w.id === id);
            if (!meta) return null;
            const Icon = meta.icon;

            return (
              <GlassCard key={id} className="p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.10]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full glass-inset flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-white truncate">
                          {meta.title}
                        </h3>
                        <span className="text-[11px] text-[var(--label-2)]">
                          {meta.category} · Widget
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWidget(id)}
                      aria-label={`${meta.title} entfernen`}
                      className="w-8 h-8 glass-btn flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Widget 1: Karten & Sicherheit */}
                  {id === 'karten' && (
                    <div className="space-y-3">
                      <div className="glass-inset p-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-semibold text-white">
                            Sparkassen-Card •••• 4821
                          </div>
                          <div className="text-[12px] text-[var(--label-2)]">
                            {cardFrozen
                              ? 'Vorübergehend gesperrt'
                              : 'Aktiv · Kontaktlos bis 50 € ohne PIN'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCardFrozen((prev) => !prev);
                            onShowToast(
                              !cardFrozen
                                ? 'Sparkassen-Card vorübergehend gesperrt (Demo)'
                                : 'Sparkassen-Card wieder freigegeben (Demo)'
                            );
                          }}
                          className={`min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
                            cardFrozen ? 'glass-btn-primary' : ''
                          }`}
                        >
                          {cardFrozen ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Entsperren</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Sperren</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[12px] text-[var(--label-2)] px-1">
                        <span>Debit Mastercard •••• 9034</span>
                        <span className="text-[#34C759] font-medium">Apple Pay aktiv</span>
                      </div>
                    </div>
                  )}

                  {/* Widget 2: Sparziele */}
                  {id === 'sparziele' && (
                    <div className="space-y-3">
                      <div className="glass-inset p-3 space-y-2">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-white">Notgroschen</span>
                          <span className="text-[var(--label-2)] tabular-nums">
                            {formatEur(emergencySaved)} / 1.500,00 €
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.10] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#34C759] transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (emergencySaved / 1500) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="glass-inset p-3 space-y-2">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-white">Sommerurlaub</span>
                          <span className="text-[var(--label-2)] tabular-nums">
                            {formatEur(holidaySaved)} / 800,00 €
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.10] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#0A84FF] transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (holidaySaved / 800) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmergencySaved((v) => Math.min(1500, v + 25));
                            onShowToast('+25,00 € auf Notgroschen gelegt (Demo)');
                          }}
                          className="flex-1 min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                        >
                          +25 € Notgroschen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHolidaySaved((v) => Math.min(800, v + 25));
                            onShowToast('+25,00 € auf Sommerurlaub gelegt (Demo)');
                          }}
                          className="flex-1 min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                        >
                          +25 € Urlaub
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Widget 3: Abo- & Vertrags-Check */}
                  {id === 'abos' && (
                    <div className="space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-[var(--label-2)]">
                          Erkannte monatliche Abos
                        </span>
                        <span className="text-[18px] font-bold text-white tabular-nums">
                          82,98 € / Monat
                        </span>
                      </div>
                      <div className="divide-y divide-white/[0.08] glass-inset px-3 py-1 text-[13px]">
                        <div className="py-2 flex justify-between">
                          <span className="text-white">Deutschlandticket</span>
                          <span className="text-[var(--label-2)] tabular-nums">58,00 €</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-white">Mobilfunk-Tarif</span>
                          <span className="text-[var(--label-2)] tabular-nums">14,99 €</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="text-white">Musik-Streaming</span>
                          <span className="text-[var(--label-2)] tabular-nums">9,99 €</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubAlertEnabled((p) => !p)}
                        className="w-full min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                      >
                        {subAlertEnabled
                          ? 'Erinnerung vor Abbuchung: Aktiv'
                          : 'Erinnerung vor Abbuchung: Aus'}
                      </button>
                    </div>
                  )}

                  {/* Widget 4: Wechselgeld-Sparen */}
                  {id === 'wechselgeld' && (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <div className="text-[12px] text-[var(--label-2)]">
                            Diesen Monat aufgerundet
                          </div>
                          <div className="text-[26px] font-bold text-[#FF9F0A] tabular-nums leading-tight">
                            {formatEur(roundUpTotal)}
                          </div>
                        </div>
                        <span className="text-[12px] font-medium text-[var(--label-2)]">
                          {roundUpEnabled ? 'Regel aktiv' : 'Pausiert'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRoundUpEnabled((p) => !p)}
                          className="flex-1 min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                        >
                          {roundUpEnabled ? 'Pausieren' : 'Aktivieren'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoundUpTotal((v) => +(v + 0.6).toFixed(2));
                            onShowToast('+0,60 € Wechselgeld aufgerundet (Demo)');
                          }}
                          className="flex-1 min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                        >
                          Kauf aufrunden (+0,60 €)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Widget 5: Fristen & Termine */}
                  {id === 'fristen' && (
                    <div className="space-y-3">
                      <div className="divide-y divide-white/[0.08] glass-inset px-3 py-1 text-[13px]">
                        <div className="py-2 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-white">Beitragsservice</div>
                            <div className="text-[11px] text-[var(--label-2)]">55,08 € · Befreiung offen</div>
                          </div>
                          <span className="text-[12px] font-semibold text-[#FF9F0A] tabular-nums">
                            28.11.2026
                          </span>
                        </div>
                        <div className="py-2 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-white">Steuerbescheid</div>
                            <div className="text-[11px] text-[var(--label-2)]">+312,00 € Erstattung</div>
                          </div>
                          <span className="text-[12px] font-semibold text-[var(--label-2)] tabular-nums">
                            18.12.2026
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectTab('spass')}
                        className="w-full min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                      >
                        Im S-Pass öffnen
                      </button>
                    </div>
                  )}

                  {/* Widget 6: Kiez-Bonus Ticker */}
                  {id === 'kiezbonus' && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[12px] text-[var(--label-2)]">
                          Gesammelter Heimvorteil-Bonus
                        </div>
                        <div className="text-[28px] font-bold text-[#34C759] tabular-nums leading-tight mt-0.5">
                          {formatEur(monthlyBonusEur)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectTab('heimvorteil')}
                        className="w-full min-h-[38px] glass-btn text-[12px] font-semibold cursor-pointer"
                      >
                        Lokale Shops im Heimvorteil ansehen
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </section>
      )}

      {/* Bottom "Widget" Bubble Trigger */}
      <div className="pt-2 pb-1 flex justify-center">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="min-h-[48px] px-6 glass-btn inline-flex items-center gap-2.5 text-[14px] font-semibold text-white cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-[#0A84FF] shrink-0" />
          <span>Widget</span>
          {activeWidgets.length > 0 && (
            <span className="text-[12px] font-medium text-[var(--label-2)] tabular-nums">
              · {activeWidgets.length} aktiv
            </span>
          )}
        </button>
      </div>

      {/* Widget Picker Modal / Bubble Drawer with Exit Button */}
      {pickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Widgets für Startseite auswählen"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPickerOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
        >
          <div className="w-full max-w-xl glass-thick rounded-[28px] p-5 sm:p-6 space-y-4 max-h-[86vh] flex flex-col">
            {/* Modal Header with Exit Button */}
            <div className="flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="text-[12px] font-medium text-[var(--label-2)]">
                  Startseite anpassen · Beispiel-Funktionen
                </div>
                <h2 className="text-[20px] font-bold text-white mt-0.5">
                  Widgets hinzufügen
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Widget-Auswahl beenden"
                className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Catalog of Example Functions */}
            <div className="overflow-y-auto pr-1 space-y-2.5 flex-1">
              {WIDGET_CATALOG.map((widget) => {
                const Icon = widget.icon;
                const isAdded = activeWidgets.includes(widget.id);

                return (
                  <div
                    key={widget.id}
                    className={`glass-inset p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isAdded ? 'bg-white/[0.11] border-white/[0.24]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" style={{ color: widget.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-semibold text-white">
                            {widget.title}
                          </span>
                          <span className="text-[11px] text-[var(--label-2)]">
                            · {widget.category}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--label-2)] mt-0.5 leading-relaxed">
                          {widget.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleWidget(widget.id)}
                      className={`min-h-[38px] px-3.5 glass-btn text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap ${
                        isAdded
                          ? 'glass-btn-green'
                          : 'text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Aktiv</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Hinzufügen</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Exit Button */}
            <div className="pt-2 border-t border-white/[0.10] flex items-center justify-between gap-3 shrink-0">
              <span className="text-[12px] text-[var(--label-2)] tabular-nums">
                {activeWidgets.length} von {WIDGET_CATALOG.length} auf Startseite
              </span>

              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="min-h-[44px] px-5 glass-btn glass-btn-primary text-[14px] font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Schließen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
