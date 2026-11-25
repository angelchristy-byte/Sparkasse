import { useMemo, useState } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { WEALTH_CATEGORIES } from '../data/mockData';
import { WealthCategoryId } from '../types';
import { formatEur } from '../utils/format';
import { GlassCard } from './GlassCard';

type ChartMode = 'donut' | 'bar';

export function WealthOverviewCard() {
  const [chartMode, setChartMode] = useState<ChartMode>('donut');
  const [activeId, setActiveId] = useState<WealthCategoryId | null>(null);

  const summary = useMemo(() => {
    const grossAssets = WEALTH_CATEGORIES.filter((c) => !c.isLiability).reduce(
      (sum, c) => sum + c.amountEur,
      0
    );
    const totalCredit = WEALTH_CATEGORIES.filter((c) => c.isLiability).reduce(
      (sum, c) => sum + c.amountEur,
      0
    );
    const netTotal = grossAssets + totalCredit;
    const totalVolume = WEALTH_CATEGORIES.reduce(
      (sum, c) => sum + Math.abs(c.amountEur),
      0
    );
    const maxAbs = Math.max(
      1,
      ...WEALTH_CATEGORIES.map((c) => Math.abs(c.amountEur))
    );

    return { grossAssets, totalCredit, netTotal, totalVolume, maxAbs };
  }, []);

  const activeCategory = useMemo(
    () => WEALTH_CATEGORIES.find((c) => c.id === activeId) ?? null,
    [activeId]
  );

  // Donut SVG math
  const donutSlices = useMemo(() => {
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const gapPx = 4;
    let cumulativeOffset = 0;

    return WEALTH_CATEGORIES.map((item) => {
      const share = Math.abs(item.amountEur) / summary.totalVolume;
      const rawLength = share * circumference;
      const dashLength = Math.max(4, rawLength - gapPx);
      const dashOffset = -cumulativeOffset;
      cumulativeOffset += rawLength;

      return {
        item,
        sharePct: share * 100,
        radius,
        circumference,
        dashLength,
        dashOffset,
      };
    });
  }, [summary.totalVolume]);

  return (
    <GlassCard className="p-4 sm:p-6">
      {/* Header Row: Title + Chart Mode Switch */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[var(--label-2)]">
            <span>Vermögensübersicht</span>
            <span aria-hidden="true">·</span>
            <span>6 Bereiche · Beispieldaten</span>
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-white mt-0.5">
            Gesamtes Vermögen
          </h2>
        </div>

        {/* Interactive Chart Type Toggle */}
        <div
          role="group"
          aria-label="Diagramm-Ansicht wählen"
          className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.12]"
        >
          <button
            type="button"
            onClick={() => setChartMode('donut')}
            className={`min-h-[34px] px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              chartMode === 'donut'
                ? 'bg-white/[0.18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                : 'text-[var(--label-2)] hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Kreisdiagramm</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('bar')}
            className={`min-h-[34px] px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              chartMode === 'bar'
                ? 'bg-white/[0.18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                : 'text-[var(--label-2)] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Balkendiagramm</span>
          </button>
        </div>
      </div>

      {/* Big Number */}
      <div className="mt-3">
        <div className="text-[40px] sm:text-[54px] font-bold tracking-[-0.04em] leading-none text-white tabular-nums">
          {formatEur(summary.netTotal)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[var(--label-2)] tabular-nums">
          <span>Guthaben &amp; Anlagen: {formatEur(summary.grossAssets)}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#FF6961]">
            Credit: {formatEur(summary.totalCredit)}
          </span>
        </div>
      </div>

      {/* Proportional Stacked Composition Strip */}
      <div
        className="mt-5 h-2.5 w-full rounded-full overflow-hidden flex gap-[2px] bg-white/[0.06]"
        aria-hidden="true"
      >
        {donutSlices.map(({ item, sharePct }) => {
          const isDimmed = activeId !== null && activeId !== item.id;
          return (
            <div
              key={item.id}
              style={{
                width: `${sharePct}%`,
                backgroundColor: item.color,
                opacity: isDimmed ? 0.28 : 1,
              }}
              className="h-full transition-opacity duration-200 first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>

      {/* Chart Diagram Area */}
      {chartMode === 'donut' ? (
        <div className="mt-5 pt-5 border-t border-white/[0.10] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Interactive SVG Donut Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-[216px] h-[216px] flex items-center justify-center">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full -rotate-90 overflow-visible"
                role="img"
                aria-label="Kreisdiagramm Gesamtes Vermögen"
              >
                {/* Subtle track ring */}
                <circle
                  cx="110"
                  cy="110"
                  r="78"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="22"
                />
                {donutSlices.map((slice) => {
                  const isActive = activeId === slice.item.id;
                  const isDimmed = activeId !== null && !isActive;

                  return (
                    <circle
                      key={slice.item.id}
                      cx="110"
                      cy="110"
                      r={slice.radius}
                      fill="none"
                      stroke={slice.item.color}
                      strokeWidth={isActive ? 27 : 22}
                      strokeDasharray={`${slice.dashLength} ${slice.circumference}`}
                      strokeDashoffset={slice.dashOffset}
                      strokeLinecap="butt"
                      opacity={isDimmed ? 0.3 : 1}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setActiveId(slice.item.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onClick={() =>
                        setActiveId((prev) =>
                          prev === slice.item.id ? null : slice.item.id
                        )
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                <span className="text-[11px] font-medium text-[var(--label-2)] leading-tight max-w-[120px] truncate">
                  {activeCategory ? activeCategory.label : 'Nettovermögen'}
                </span>
                <span
                  className={`text-[18px] font-bold tabular-nums mt-0.5 ${
                    activeCategory?.isLiability ? 'text-[#FF6961]' : 'text-white'
                  }`}
                >
                  {formatEur(
                    activeCategory ? activeCategory.amountEur : summary.netTotal
                  )}
                </span>
                <span className="text-[11px] text-[var(--label-2)] tabular-nums mt-0.5">
                  {activeCategory
                    ? `${(
                        (Math.abs(activeCategory.amountEur) /
                          summary.totalVolume) *
                        100
                      ).toLocaleString('de-DE', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} % Anteil`
                    : '6 Bereiche'}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Categories Breakdown List */}
          <div className="md:col-span-7 divide-y divide-white/[0.08]">
            {donutSlices.map(({ item, sharePct }) => {
              const isSelected = activeId === item.id;
              const isDimmed = activeId !== null && !isSelected;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveId(item.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() =>
                    setActiveId((prev) => (prev === item.id ? null : item.id))
                  }
                  className={`w-full text-left py-2.5 px-2.5 rounded-[14px] transition-colors cursor-pointer ${
                    isSelected ? 'bg-white/[0.10]' : 'hover:bg-white/[0.05]'
                  } ${isDimmed ? 'opacity-65' : 'opacity-100'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-white truncate">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-[var(--label-2)] truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <div
                        className={`text-[14px] font-bold ${
                          item.isLiability ? 'text-[#FF6961]' : 'text-white'
                        }`}
                      >
                        {formatEur(item.amountEur)}
                      </div>
                      <div className="text-[11px] text-[var(--label-2)]">
                        {sharePct.toLocaleString('de-DE', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{' '}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Mini Category Proportion Bar */}
                  <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(4, (Math.abs(item.amountEur) / summary.maxAbs) * 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Interactive Bar Chart Diagram (Balkendiagramm) */
        <div className="mt-5 pt-5 border-t border-white/[0.10]">
          <div className="space-y-3">
            {donutSlices.map(({ item, sharePct }) => {
              const barWidthPct = Math.max(
                6,
                (Math.abs(item.amountEur) / summary.maxAbs) * 100
              );
              const isSelected = activeId === item.id;
              const isDimmed = activeId !== null && !isSelected;

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveId(item.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() =>
                    setActiveId((prev) => (prev === item.id ? null : item.id))
                  }
                  className={`w-full text-left p-2.5 rounded-[14px] transition-colors cursor-pointer ${
                    isSelected ? 'bg-white/[0.10]' : 'hover:bg-white/[0.05]'
                  } ${isDimmed ? 'opacity-65' : 'opacity-100'}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[14px] font-semibold text-white">
                        {item.label}
                      </span>
                      <span className="text-[12px] text-[var(--label-2)] hidden sm:inline">
                        · {item.subtitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span
                        className={`text-[14px] font-bold ${
                          item.isLiability ? 'text-[#FF6961]' : 'text-white'
                        }`}
                      >
                        {formatEur(item.amountEur)}
                      </span>
                      <span className="text-[12px] text-[var(--label-2)] w-12 text-right">
                        {sharePct.toLocaleString('de-DE', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{' '}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Bar Chart Track */}
                  <div className="h-3.5 w-full rounded-full bg-white/[0.07] overflow-hidden flex items-center">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barWidthPct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
