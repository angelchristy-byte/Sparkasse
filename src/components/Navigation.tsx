import {
  FileCheck2,
  Home,
  MapPin,
  MessageSquare,
  Newspaper,
  UserCheck,
} from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import { DISCLAIMER_TEXT } from '../data/mockData';
import { TabId } from '../types';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onJumpToAdviser: () => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'start', label: 'Start', icon: Home },
  { id: 'klartext', label: 'Klartext', icon: Newspaper },
  { id: 'spass', label: 'S-Pass', icon: FileCheck2 },
  { id: 'heimvorteil', label: 'Heimvorteil', icon: MapPin },
  { id: 'assistent', label: 'Assistent', icon: MessageSquare },
];

const LENS_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

export function Navigation({
  activeTab,
  onSelectTab,
  onJumpToAdviser,
}: NavigationProps) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Desktop Floating Glass Sidebar */}
      <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 w-[260px] glass flex-col justify-between p-5 z-30">
        <div>
          {/* Top Brand Lockup */}
          <div className="px-2 pt-1 pb-6">
            <img
              src="/assets/aistudio/s-one-logo.png"
              alt="s / One Logo"
              className="h-9 w-auto object-contain select-none pointer-events-none"
            />
            <div className="text-[12px] text-[var(--label-2)] mt-1.5 truncate">
              Sparkasse · Konzept 2030
            </div>
          </div>

          <nav aria-label="Hauptnavigation" className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (activeTab === 'ueberweisen' && item.id === 'start');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-4 min-h-[46px] rounded-full text-[15px] font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-[var(--label-2)] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-lens"
                      transition={LENS_SPRING}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white/[0.16] border border-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                    />
                  )}
                  <Icon className="relative z-10 w-[18px] h-[18px] shrink-0" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/[0.10]">
          <p className="text-[12px] font-medium text-[var(--label-2)] px-2">
            Verstehen. Erledigen. Profitieren.
          </p>

          <button
            type="button"
            onClick={onJumpToAdviser}
            className="w-full min-h-[44px] px-4 glass-btn glass-btn-green text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Mit Berater:in sprechen</span>
          </button>

          <p className="text-[11px] leading-[1.45] text-[var(--label-2)] px-2 pt-1">
            {DISCLAIMER_TEXT}
          </p>
        </div>
      </aside>

      {/* Mobile Floating Glass Capsule Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
        className="lg:hidden fixed left-3 right-3 z-30 glass-thick rounded-full p-1.5"
      >
        <div className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (activeTab === 'ueberweisen' && item.id === 'start');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-full px-1 transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-[var(--label-2)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-lens"
                    transition={LENS_SPRING}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-white/[0.16] border border-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                  />
                )}
                <Icon className="relative z-10 w-[18px] h-[18px] shrink-0" />
                <span className="relative z-10 text-[11px] font-medium whitespace-nowrap leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </MotionConfig>
  );
}
