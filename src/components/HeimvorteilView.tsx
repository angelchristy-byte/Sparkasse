import { MapPin, PiggyBank, Store, Wallet } from 'lucide-react';
import localCafeImg from '../assets/images/local_cafe_kiez_1794660545154.jpg';
import {
  LOCAL_CLUBS,
  PARTICIPATING_SHOPS,
  REGIONS,
} from '../data/mockData';
import { BonusAction, HeimvorteilTx, RegionId } from '../types';
import { formatEur } from '../utils/format';
import { GlassCard } from './GlassCard';

interface HeimvorteilViewProps {
  region: RegionId;
  onChangeRegion: (region: RegionId) => void;
  transactions: HeimvorteilTx[];
  totalBonusEur: number;
  bonusAction: BonusAction;
  onChangeBonusAction: (action: BonusAction) => void;
  selectedClub: string;
  onChangeClub: (club: string) => void;
  onSimulateLocalPayment: () => void;
}

export function HeimvorteilView({
  region,
  onChangeRegion,
  transactions,
  totalBonusEur,
  bonusAction,
  onChangeBonusAction,
  selectedClub,
  onChangeClub,
  onSimulateLocalPayment,
}: HeimvorteilViewProps) {
  const currentRegion = REGIONS[region];

  return (
    <div className="space-y-4">
      {/* Hero Regional Bonus Card */}
      <GlassCard className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch">
          <div className="md:col-span-3 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#FF9F0A]" />
                <span className="text-[12px] font-medium text-[var(--label-2)]">
                  Heimvorteil · {currentRegion.city}
                </span>
              </div>

              <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-white">
                {currentRegion.bonusName}: Lokal zahlen, direkt sparen
              </h1>
              <p className="text-[14px] text-[var(--label-2)] mt-1.5 leading-relaxed">
                Bei teilnehmenden Läden im Viertel sammelst du automatisch Cashback – zum Auszahlen, Sparen oder Spenden an deinen Verein.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(REGIONS) as RegionId[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeRegion(r)}
                  className={`min-h-[38px] px-4 glass-btn text-[13px] font-semibold cursor-pointer ${
                    region === r
                      ? 'glass-btn-active text-white'
                      : 'text-[var(--label-2)]'
                  }`}
                >
                  {REGIONS[r].city}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.10] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[12px] text-[var(--label-2)]">
                  Gesammelter {currentRegion.bonusName}
                </div>
                <div className="text-[32px] font-bold text-[#34C759] tabular-nums leading-tight">
                  {formatEur(totalBonusEur)}
                </div>
              </div>

              <button
                type="button"
                onClick={onSimulateLocalPayment}
                className="min-h-[44px] px-5 glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
              >
                Lokal zahlen simulieren
              </button>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[20px] overflow-hidden border border-white/[0.12] min-h-[190px]">
            <img
              src={localCafeImg}
              alt="Lokales Café im Kiez"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[270px]"
            />
          </div>
        </div>
      </GlassCard>

      {/* Bonus Action Selection */}
      <GlassCard className="p-4 sm:p-6">
        <h2 className="text-[18px] font-semibold text-white mb-3">
          Was soll mit deinem Bonus passieren?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(
            [
              ['sparen', 'In Sparplan legen', 'Automatisch auf Start anrechnen', PiggyBank],
              ['auszahlen', 'Auf Giro auszahlen', 'Jederzeit ab 1,00 € verfügbar', Wallet],
              ['spenden', 'Lokal spenden', '100 % an Verein vor Ort', Store],
            ] as [BonusAction, string, string, typeof PiggyBank][]
          ).map(([id, title, sub, Icon]) => {
            const active = bonusAction === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeBonusAction(id)}
                className={`text-left p-4 glass-inset transition-colors cursor-pointer ${
                  active
                    ? 'bg-white/[0.14] border-white/[0.32]'
                    : 'hover:bg-white/[0.10]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#34C759] mb-2" />
                <div className="text-[14px] font-semibold text-white">
                  {title}
                </div>
                <div className="text-[12px] text-[var(--label-2)] mt-0.5">
                  {sub}
                </div>
              </button>
            );
          })}
        </div>

        {bonusAction === 'spenden' && (
          <div className="mt-4 pt-4 border-t border-white/[0.10]">
            <label className="block text-[13px] font-medium text-[var(--label-2)] mb-2">
              Empfänger-Verein in {currentRegion.city}
            </label>
            <div className="flex flex-wrap gap-2">
              {LOCAL_CLUBS.map((club) => (
                <button
                  key={club}
                  type="button"
                  onClick={() => onChangeClub(club)}
                  className={`min-h-[38px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer ${
                    selectedClub === club
                      ? 'glass-btn-active text-white'
                      : 'text-[var(--label-2)]'
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Participating Shops & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4 sm:p-6">
          <h2 className="text-[18px] font-semibold text-white mb-3">
            Teilnehmende Geschäfte
          </h2>
          <div className="divide-y divide-white/[0.08]">
            {PARTICIPATING_SHOPS.map((shop) => (
              <div
                key={shop.id}
                className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full glass-inset flex items-center justify-center text-[14px] font-bold text-white shrink-0">
                    {shop.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-white truncate">
                      {shop.name}
                    </div>
                    <div className="text-[12px] text-[var(--label-2)] truncate">
                      {shop.category}
                    </div>
                  </div>
                </div>
                <span className="text-[14px] font-bold text-[#34C759] tabular-nums shrink-0">
                  +{shop.ratePct} %
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <h2 className="text-[18px] font-semibold text-white mb-3">
            Letzte Zahlungen &amp; Bonus
          </h2>
          <div className="divide-y divide-white/[0.08]">
            {transactions.map((tx) => {
              const bonus =
                tx.ratePct !== null ? tx.amountEur * (tx.ratePct / 100) : null;
              return (
                <div
                  key={tx.id}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-white truncate">
                      {tx.merchant}
                    </div>
                    <div className="text-[12px] text-[var(--label-2)] truncate">
                      {tx.dateLabel}
                      {tx.note ? ` · ${tx.note}` : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="text-[14px] font-semibold text-white">
                      {formatEur(tx.amountEur)}
                    </div>
                    <div
                      className={`text-[12px] font-medium ${
                        bonus !== null
                          ? 'text-[#34C759]'
                          : 'text-[var(--label-2)]'
                      }`}
                    >
                      {bonus !== null ? `+${formatEur(bonus)}` : '0,00 €'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
