import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, ShieldCheck, Smartphone, X } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [scanningEid, setScanningEid] = useState<boolean>(false);
  const [eidVerified, setEidVerified] = useState<boolean>(false);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setElapsedSec(0);
      setScanningEid(false);
      setEidVerified(false);
      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current);
      }
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current);
      }
    };
  }, [open]);

  if (!open) return null;

  const startEidScan = () => {
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    setScanningEid(true);
    scanTimerRef.current = window.setTimeout(() => {
      setScanningEid(false);
      setEidVerified(true);
    }, 1200);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Konto in Minuten Demo"
      className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-lg glass-thick rounded-[28px] p-5 sm:p-6 space-y-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[12px] font-medium text-[var(--label-2)] tabular-nums">
              Schritt {step} von 3 · Demo-Timer {formatTimer(elapsedSec)}
            </span>
            <h2 className="text-[20px] font-bold text-white mt-0.5">
              Konto in Minuten
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Onboarding schließen"
            className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full ${
                s <= step ? 'bg-[#34C759]' : 'bg-white/[0.14]'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Ausweisen */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="glass-inset p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-white">
                    1. Ausweisen per eID / NFC
                  </div>
                  <div className="text-[13px] text-[var(--label-2)]">
                    Personalausweis kurz an das Smartphone halten (Simulation).
                  </div>
                </div>
              </div>

              {eidVerified ? (
                <div className="p-3 rounded-xl bg-[#34C759]/20 border border-[#34C759]/35 text-[#34C759] text-[14px] font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>eID bestätigt · Mia Lindner (Beispiel)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEidScan}
                  disabled={scanningEid}
                  className="w-full min-h-[48px] glass-btn glass-btn-primary disabled:opacity-60 text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {scanningEid ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>NFC-Chip wird gelesen …</span>
                    </>
                  ) : (
                    <span>eID jetzt scannen (1,2 s)</span>
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!eidVerified}
              className="w-full min-h-[48px] glass-btn disabled:opacity-40 text-[14px] font-semibold cursor-pointer"
            >
              Weiter zu Schritt 2
            </button>
          </div>
        )}

        {/* Step 2: Konto wählen */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="glass-inset p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-bold text-white">
                  Ein Konto. Alles drin.
                </span>
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#34C759]/20 text-[#34C759]">
                  Einstiegsprodukt
                </span>
              </div>
              <p className="text-[14px] text-[var(--label-2)] leading-relaxed">
                Girokonto, digitale Karte, automatische Kassenbon-Auswertung und Sparplan ab 1 € in einem klaren Paket.
              </p>
              <div className="pt-2 border-t border-white/[0.10] text-[12px] text-[var(--label-2)]">
                Hinweis zur Preisgestaltung: Die konkreten Entgelte (z. B. für junge Kundinnen und Kunden oder Studierende) legt deine lokale Sparkasse fest.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full min-h-[48px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
            >
              Konto eröffnen (Demo)
            </button>
          </div>
        )}

        {/* Step 3: Fertig */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Digital Wallet Card Preview featuring the Sparkasse Ribbon Logo */}
            <div className="glass-rim bg-[rgba(34,38,52,0.70)] p-5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/assets/aistudio/s-one-logo.png"
                    alt="s / One Logo"
                    className="h-6 w-auto object-contain select-none pointer-events-none shrink-0"
                  />
                  <span className="text-[13px] font-medium text-[var(--label-2)] truncate">
                    Sparkasse
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#34C759]/20 text-[#34C759] inline-flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>aktiv</span>
                </span>
              </div>

              <div>
                <div className="text-[12px] text-[var(--label-2)]">
                  Neue Beispiel-IBAN
                </div>
                <div className="text-[18px] font-bold text-white tracking-wide tabular-nums mt-0.5">
                  DE00 0000 0000 0000 0000 00
                </div>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[var(--label-2)]">
                <span>Mia Lindner</span>
                <span>Digitale Karte sofort einsatzbereit</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
            >
              Fertig · Zur App
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
