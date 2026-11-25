import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PiggyBank,
  Receipt,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  EXTRA_RECEIPTS,
  INITIAL_RECEIPTS,
} from '../data/mockData';
import {
  DigitalReceipt,
  ExpenseCategoryId,
  TabId,
} from '../types';
import { formatEur } from '../utils/format';
import { GlassCard } from './GlassCard';
import { StartWidgetsSection } from './StartWidgetsSection';
import { WealthOverviewCard } from './WealthOverviewCard';

interface HomeViewProps {
  balanceEur: number;
  onSelectTab: (tab: TabId) => void;
  onShowToast: (message: string) => void;
  onOpenOnboarding: () => void;
  monthlyBonusEur: number;
}

export function HomeView({
  balanceEur,
  onSelectTab,
  onShowToast,
  onOpenOnboarding,
  monthlyBonusEur,
}: HomeViewProps) {
  const [displayBalance, setDisplayBalance] = useState<number>(balanceEur);
  const [sparplanRate, setSparplanRate] = useState<number>(25);
  const [autoAddBonus, setAutoAddBonus] = useState<boolean>(true);
  const [receipts, setReceipts] = useState<DigitalReceipt[]>(INITIAL_RECEIPTS);
  const [extraIndex, setExtraIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategoryId | 'all'
  >('lebensmittel');
  const [receiptTab, setReceiptTab] = useState<'kategorien' | 'bons'>(
    'kategorien'
  );
  const [expandedBonId, setExpandedBonId] = useState<string>(
    INITIAL_RECEIPTS[0].id
  );
  const sparplanRef = useRef<HTMLDivElement>(null);

  const expenseBreakdown = useMemo(() => {
    const totals: Record<ExpenseCategoryId, number> = {
      lebensmittel: 0,
      bargeld: 0,
      restaurant: 0,
      vertraege: 0,
      miete: 0,
      freizeit: 0,
    };
    const flatItems: {
      id: string;
      name: string;
      subcategory?: string;
      merchant: string;
      dateLabel: string;
      category: ExpenseCategoryId;
      amountEur: number;
    }[] = [];

    for (const bon of receipts) {
      for (const item of bon.items) {
        totals[item.category] += item.amountEur;
        flatItems.push({
          ...item,
          merchant: bon.merchant,
          dateLabel: bon.dateLabel,
        });
      }
    }

    const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);
    return { totals, totalSpent, flatItems };
  }, [receipts]);

  const handleAddSampleReceipt = () => {
    const nextBon = EXTRA_RECEIPTS[extraIndex % EXTRA_RECEIPTS.length];
    const cloned: DigitalReceipt = {
      ...nextBon,
      id: `${nextBon.id}-${Date.now()}`,
      items: nextBon.items.map((it) => ({
        ...it,
        id: `${it.id}-${Date.now()}`,
      })),
    };
    setReceipts((prev) => [cloned, ...prev]);
    setExpandedBonId(cloned.id);
    setExtraIndex((i) => i + 1);
    const bonSum = cloned.items.reduce((s, it) => s + it.amountEur, 0);
    onShowToast(
      `Kassenbon verknüpft: ${cloned.merchant} (${formatEur(bonSum)})`
    );
  };

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayBalance(balanceEur);
      return;
    }

    let rafId = 0;
    const duration = 520;
    const start = performance.now();
    const from = balanceEur * 0.88;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBalance(from + (balanceEur - from) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [balanceEur]);

  const effectiveMonthlyContribution =
    sparplanRate + (autoAddBonus ? monthlyBonusEur : 0);
  const annualPaidIn = effectiveMonthlyContribution * 12;

  const scrollToSparplan = () => {
    sparplanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-4">
      {/* Hero Portfolio / Account Balance Card */}
      <GlassCard className="p-4 sm:p-6">
        <div className="mb-2">
          <span className="text-[13px] font-medium text-[var(--label-2)]">
            Giro &amp; Rücklagen · Beispielkonto
          </span>
        </div>

        <div className="text-[44px] sm:text-[64px] font-bold tracking-[-0.04em] leading-none text-white tabular-nums">
          {formatEur(displayBalance)}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-white/[0.10]">
          <button
            type="button"
            onClick={() => onSelectTab('ueberweisen')}
            className="min-h-[48px] glass-btn glass-btn-primary text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer px-3"
          >
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>Überweisen</span>
          </button>

          <button
            type="button"
            onClick={scrollToSparplan}
            className="min-h-[48px] glass-btn text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer px-3"
          >
            <PiggyBank className="w-4 h-4 shrink-0 text-[#34C759]" />
            <span>Sparplan</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('assistent')}
            className="min-h-[48px] glass-btn text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer px-3"
          >
            <MessageSquare className="w-4 h-4 shrink-0 text-[#0A84FF]" />
            <span>Assistent</span>
          </button>
        </div>
      </GlassCard>

      {/* Gesamtes Vermögen — Interactive Chart Diagram */}
      <WealthOverviewCard />

      {/* Detailed Receipt-Based Expense Breakdown (replaces the 3 module cards on Start) */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full glass-inset text-[var(--label-2)]">
                Kassenbon-Auswertung · Beispieldaten
              </span>
              <span className="text-[12px] font-medium text-[var(--label-2)] tabular-nums">
                {receipts.length} Belege · {formatEur(expenseBreakdown.totalSpent)}
              </span>
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-white tracking-[-0.01em]">
              Ausgaben bis auf Artikel-Ebene
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddSampleReceipt}
            className="min-h-[40px] px-4 glass-btn text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-[#0A84FF]" />
            <span>Bon verknüpfen</span>
          </button>
        </div>

        {/* View Toggle: Kategorien vs Einzelbons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReceiptTab('kategorien')}
              className={`min-h-[38px] px-4 glass-btn text-[13px] font-semibold cursor-pointer ${
                receiptTab === 'kategorien'
                  ? 'glass-btn-active text-white'
                  : 'text-[var(--label-2)]'
              }`}
            >
              Aufteilung nach Artikeln
            </button>
            <button
              type="button"
              onClick={() => setReceiptTab('bons')}
              className={`min-h-[38px] px-4 glass-btn text-[13px] font-semibold cursor-pointer ${
                receiptTab === 'bons'
                  ? 'glass-btn-active text-white'
                  : 'text-[var(--label-2)]'
              }`}
            >
              Kassenbons ({receipts.length})
            </button>
          </div>
        </div>

        {receiptTab === 'kategorien' ? (
          <div className="space-y-4">
            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {EXPENSE_CATEGORIES.map((cat) => {
                const amount = expenseBreakdown.totals[cat.id];
                const pct =
                  expenseBreakdown.totalSpent > 0
                    ? Math.round((amount / expenseBreakdown.totalSpent) * 100)
                    : 0;
                const active = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(active ? 'all' : cat.id)
                    }
                    className={`text-left glass-inset p-3.5 transition-colors cursor-pointer ${
                      active
                        ? 'bg-white/[0.14] border-white/[0.28]'
                        : 'hover:bg-white/[0.10]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-white">
                        {cat.label}
                      </span>
                      <span className="text-[15px] font-bold text-white tabular-nums">
                        {formatEur(amount)}
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/[0.10] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(4, pct)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[12px] text-[var(--label-2)] tabular-nums">
                      <span>{pct} % der Ausgaben</span>
                      <span>{active ? 'Filter aktiv' : 'Details'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Filtered Itemized Receipt Lines */}
            <div className="glass-inset p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/[0.10]">
                <span className="text-[13px] font-semibold text-white">
                  {selectedCategory === 'all'
                    ? 'Alle Kassenbon-Artikel'
                    : `Einzelposten: ${
                        EXPENSE_CATEGORIES.find(
                          (c) => c.id === selectedCategory
                        )?.label ?? ''
                      }`}
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-[12px] font-medium text-[var(--label-2)] hover:text-white cursor-pointer"
                  >
                    Alle anzeigen
                  </button>
                )}
              </div>

              <div className="divide-y divide-white/[0.08]">
                {expenseBreakdown.flatItems
                  .filter(
                    (it) =>
                      selectedCategory === 'all' ||
                      it.category === selectedCategory
                  )
                  .map((it) => (
                    <div
                      key={it.id}
                      className="py-2.5 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-medium text-white truncate">
                            {it.name}
                          </span>
                          {it.subcategory && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[var(--label-2)] shrink-0">
                              {it.subcategory}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[var(--label-2)] truncate">
                          {it.merchant} · {it.dateLabel}
                        </div>
                      </div>
                      <span className="text-[14px] font-semibold text-white tabular-nums shrink-0">
                        {formatEur(it.amountEur)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* Stored Digital Receipts List */
          <div className="space-y-2.5">
            {receipts.map((bon) => {
              const bonSum = bon.items.reduce((s, it) => s + it.amountEur, 0);
              const isOpen = expandedBonId === bon.id;

              return (
                <div key={bon.id} className="glass-inset p-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBonId(isOpen ? '' : bon.id)
                    }
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-white truncate">
                          {bon.merchant}
                        </div>
                        <div className="text-[12px] text-[var(--label-2)]">
                          {bon.dateLabel} · {bon.items.length} Artikel hinterlegt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[15px] font-bold text-white tabular-nums">
                        {formatEur(bonSum)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--label-2)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--label-2)]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-white/[0.10] space-y-2">
                      {bon.items.map((item) => {
                        const cat = EXPENSE_CATEGORIES.find(
                          (c) => c.id === item.category
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-[13px]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white truncate">
                                {item.name}
                              </span>
                              {cat && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[var(--label-2)] shrink-0">
                                  {cat.label}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-white tabular-nums shrink-0">
                              {formatEur(item.amountEur)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Investieren ab 1 € + Konto in Minuten */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <GlassCard className="lg:col-span-3 p-4 sm:p-6">
          <div ref={sparplanRef} className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[12px] font-medium text-[var(--label-2)]">
                Sparplan · S-Neo Konzept
              </span>
              <h2 className="text-[18px] font-semibold text-white mt-0.5">
                Investieren ab 1 €
              </h2>
            </div>
            <span className="text-[22px] font-bold text-white tabular-nums">
              {formatEur(sparplanRate)}
              <span className="text-[13px] font-normal text-[var(--label-2)]"> / Monat</span>
            </span>
          </div>

          <div className="mt-4">
            <label htmlFor="sparplan-slider" className="sr-only">
              Monatlicher Sparbetrag
            </label>
            <input
              id="sparplan-slider"
              type="range"
              min={1}
              max={200}
              step={1}
              value={sparplanRate}
              onChange={(e) => setSparplanRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[12px] text-[var(--label-2)] mt-1.5 tabular-nums">
              <span>1 €</span>
              <span>100 €</span>
              <span>200 €</span>
            </div>
          </div>

          <label className="mt-4 flex items-center justify-between gap-3 p-3.5 glass-inset cursor-pointer min-h-[52px]">
            <div>
              <div className="text-[14px] font-medium text-white">
                Bonus automatisch dazulegen
              </div>
              <div className="text-[12px] text-[var(--label-2)] tabular-nums">
                Aktuell +{formatEur(monthlyBonusEur)} aus Heimvorteil (Beispiel)
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoAddBonus}
              onChange={(e) => setAutoAddBonus(e.target.checked)}
              className="w-5 h-5 accent-[#34C759] rounded cursor-pointer shrink-0"
            />
          </label>

          <div className="mt-4 pt-4 border-t border-white/[0.10] flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[14px] text-[var(--label-2)]">
              Einzahlung pro Jahr (ohne Renditeprognose)
            </span>
            <span className="text-[20px] font-bold text-[#34C759] tabular-nums">
              {formatEur(annualPaidIn)}
            </span>
          </div>
          <p className="text-[12px] text-[var(--label-2)] mt-1">
            Reine Summe deiner eigenen Einzahlungen. Keine Anlageberatung und keine Renditezusage.
          </p>
        </GlassCard>

        {/* Konto in Minuten CTA */}
        <GlassCard className="lg:col-span-2 p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-full glass-inset flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-white">
              Konto in Minuten
            </h2>
            <p className="text-[14px] text-[var(--label-2)] mt-1.5 leading-relaxed">
              Teste den digitalen Konto-Abschluss per eID-Scan und einem klaren Einstiegsprodukt.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenOnboarding}
            className="mt-5 w-full min-h-[48px] px-5 glass-btn text-[15px] font-semibold cursor-pointer"
          >
            Konto in Minuten testen
          </button>
        </GlassCard>
      </section>

      {/* Bottom Widget Bubble & Custom Startseite Widgets */}
      <StartWidgetsSection
        monthlyBonusEur={monthlyBonusEur}
        onSelectTab={onSelectTab}
        onShowToast={onShowToast}
      />
    </div>
  );
}
