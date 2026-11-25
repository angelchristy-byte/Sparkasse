import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import officialLetterImg from '../assets/images/official_letter_scan_1794660545246.jpg';
import {
  BRIEF_LETTERS,
  computeRadarBenefits,
  DEMO_NET_INCOME_EUR,
  WALLET_CARDS,
} from '../data/mockData';
import { ProofClaimType, RadarToggles } from '../types';
import { GlassCard } from './GlassCard';

interface SPassViewProps {
  onShowToast: (message: string) => void;
  onJumpToAdviserWithContext: (contextText?: string) => void;
}

export function SPassView({
  onShowToast,
  onJumpToAdviserWithContext,
}: SPassViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(WALLET_CARDS[0].id);
  const [claimType, setClaimType] = useState<ProofClaimType>('rent3x');
  const [kaltmieteInput, setKaltmieteInput] = useState<number>(480);

  const [selectedLetterId, setSelectedLetterId] = useState<string>(
    BRIEF_LETTERS[0].id
  );
  const [toggles, setToggles] = useState<RadarToggles>({
    studiere: true,
    miete: true,
    niedrigesEinkommen: true,
    kind: false,
  });

  const maxRent = Math.floor(DEMO_NET_INCOME_EUR / 3);
  const rentPassed = kaltmieteInput <= maxRent;

  const activeLetter = useMemo(
    () =>
      BRIEF_LETTERS.find((l) => l.id === selectedLetterId) ?? BRIEF_LETTERS[0],
    [selectedLetterId]
  );

  const benefits = useMemo(() => computeRadarBenefits(toggles), [toggles]);

  const proofResult = useMemo(() => {
    if (claimType === 'rent3x') {
      return {
        passed: rentPassed,
        statement: rentPassed
          ? `Ja · Einkommen erfüllt 3× Kaltmiete (bis ${maxRent} €)`
          : `Nein · Bei ${kaltmieteInput} € liegt die Grenze über ${maxRent} €`,
        detail:
          'Übermittelt wird nur Ja/Nein ohne Kontostand und ohne Gehaltszettel.',
      };
    }
    if (claimType === 'over18') {
      return {
        passed: true,
        statement: 'Ja · Volljährigkeit bestätigt (18+)',
        detail: 'Geburtsdatum und Ausweisnummer bleiben vollständig verborgen.',
      };
    }
    return {
      passed: true,
      statement: 'Ja · Aktuelle Immatrikulation bestätigt',
      detail: 'Matrikelnummer und Studiengang werden nicht geteilt.',
    };
  }, [claimType, rentPassed, maxRent, kaltmieteInput]);

  return (
    <div className="space-y-4">
      {/* Digital Wallet & Ja/Nein-Nachweis */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[12px] font-medium text-[var(--label-2)]">
            S-Pass Wallet · Datensparsame Nachweise
          </span>
          <span className="text-[12px] font-medium text-[#34C759]">
            eID &amp; Einkommen aktiv
          </span>
        </div>

        <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-white">
          Nachweise ohne Datenflut
        </h1>
        <p className="text-[14px] text-[var(--label-2)] mt-1.5 leading-relaxed">
          Bestätige gegenüber Vermietung oder Behörden nur das nötige Ja/Nein – ohne Kontoauszüge zu verschicken.
        </p>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {WALLET_CARDS.map((card) => {
            const active = selectedCardId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`text-left p-4 glass-rim transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/[0.14] border-white/[0.34]'
                    : 'bg-white/[0.06] hover:bg-white/[0.10]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-white">
                    {card.title}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#34C759] shrink-0" />
                </div>
                <div className="text-[12px] text-[var(--label-2)] mt-1">
                  {card.subtitle}
                </div>
                <div className="text-[12px] text-white/90 mt-2.5 pt-2.5 border-t border-white/[0.10]">
                  {card.detail}
                </div>
              </button>
            );
          })}
        </div>

        {/* Ja / Nein Proof Simulator */}
        <div className="mt-5 pt-5 border-t border-white/[0.10]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-[14px] font-semibold text-white">
              Ja / Nein-Nachweis testen
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['rent3x', '3× Kaltmiete'],
                  ['over18', 'Über 18'],
                  ['enrolled', 'Immatrikuliert'],
                ] as [ProofClaimType, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setClaimType(id)}
                  className={`min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer ${
                    claimType === id
                      ? 'glass-btn-active text-white'
                      : 'text-[var(--label-2)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {claimType === 'rent3x' && (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="glass-input px-3.5 py-2.5 flex items-center gap-3">
                <span className="text-[12px] text-[var(--label-2)]">
                  Wunsch-Kaltmiete (€)
                </span>
                <input
                  type="number"
                  min={100}
                  max={2500}
                  step={10}
                  value={kaltmieteInput}
                  onChange={(e) =>
                    setKaltmieteInput(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-24 bg-transparent text-[15px] font-semibold text-white tabular-nums focus:outline-none"
                />
              </label>
              <span className="text-[12px] text-[var(--label-2)] tabular-nums">
                Beispiel-Netto: {DEMO_NET_INCOME_EUR.toLocaleString('de-DE')} € (Grenze {maxRent} €)
              </span>
            </div>
          )}

          <div className="glass-inset p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {proofResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-[#FF6961] shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-[15px] font-semibold text-white">
                  {proofResult.statement}
                </div>
                <div className="text-[12px] text-[var(--label-2)] mt-0.5">
                  {proofResult.detail}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onShowToast(
                  `Nachweis-Link erstellt (Demo): ${proofResult.statement}`
                )
              }
              className="min-h-[40px] px-4 glass-btn glass-btn-primary text-[13px] font-semibold cursor-pointer"
            >
              Nachweis teilen
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Brief-Decoder */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0A84FF]" />
            <h2 className="text-[18px] font-semibold text-white">
              Brief-Decoder (Beispielschreiben)
            </h2>
          </div>
          <span className="text-[12px] text-[var(--label-2)]">
            Fristen &amp; nächste Schritte
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {BRIEF_LETTERS.map((letter) => (
            <button
              key={letter.id}
              type="button"
              onClick={() => setSelectedLetterId(letter.id)}
              className={`min-h-[38px] px-3.5 glass-btn text-[13px] font-semibold cursor-pointer ${
                selectedLetterId === letter.id
                  ? 'glass-btn-active text-white'
                  : 'text-[var(--label-2)]'
              }`}
            >
              {letter.chipLabel}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          <div className="md:col-span-2 rounded-[18px] overflow-hidden border border-white/[0.12] bg-white/[0.04] min-h-[180px]">
            <img
              src={officialLetterImg}
              alt="Beispiel-Behördenbrief Scan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[240px]"
            />
          </div>

          <div className="md:col-span-3 glass-inset p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-white">
                  {activeLetter.sender}
                </span>
                <span className="text-[13px] font-bold text-[#FF9F0A] tabular-nums">
                  {activeLetter.deadline}
                </span>
              </div>

              <div className="text-[20px] font-bold text-white tabular-nums">
                {activeLetter.amount}
              </div>

              <p className="text-[13px] text-[var(--label-2)] leading-relaxed">
                {activeLetter.summaryKi}
              </p>

              <div className="pt-2 border-t border-white/[0.10] text-[13px] text-white">
                <span className="font-semibold">Nächster Schritt: </span>
                {activeLetter.todo}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {activeLetter.actions.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => onShowToast(`${act} · Im Prototyp vorgemerkt`)}
                  className="min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer"
                >
                  {act}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  onJumpToAdviserWithContext(activeLetter.chipLabel)
                }
                className="min-h-[36px] px-3.5 glass-btn glass-btn-green text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mit Beraterin klären</span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Anspruchs-Radar */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#34C759]" />
          <h2 className="text-[18px] font-semibold text-white">
            Anspruchs-Radar
          </h2>
        </div>
        <p className="text-[13px] text-[var(--label-2)] mb-4">
          Unverbindliche Orientierung zu möglichen staatlichen Leistungen anhand deiner Lebenssituation.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {(
            [
              ['studiere', 'Studium / Ausbildung'],
              ['miete', 'Eigene Miete'],
              ['niedrigesEinkommen', 'Geringes Einkommen'],
              ['kind', 'Kind im Haushalt'],
            ] as [keyof RadarToggles, string][]
          ).map(([key, label]) => {
            const active = toggles[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className={`min-h-[44px] px-3.5 py-2 glass-inset text-[13px] font-medium text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#34C759]/18 border-[#34C759]/45 text-white'
                    : 'text-[var(--label-2)] hover:bg-white/[0.10]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-white/[0.08] glass-inset px-4 py-1">
          {benefits.length === 0 ? (
            <div className="py-4 text-[13px] text-[var(--label-2)]">
              Wähle oben mindestens einen Lebensbereich aus, um passende Hinweise zu sehen.
            </div>
          ) : (
            benefits.map((b) => (
              <div key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[14px] font-semibold text-white">
                    {b.name}
                  </div>
                  <div className="text-[12px] text-[var(--label-2)]">
                    {b.office}
                  </div>
                  {b.note && (
                    <div className="text-[12px] text-[#FF9F0A] mt-0.5">
                      {b.note}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(`Checkliste „${b.name}“ geöffnet (Demo)`)
                  }
                  className="min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer"
                >
                  Checkliste
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
