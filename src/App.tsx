import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { AssistentView } from './components/AssistentView';
import { HeimvorteilView } from './components/HeimvorteilView';
import { HomeView } from './components/HomeView';
import { KlartextView } from './components/KlartextView';
import { Navigation } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import {
  AVATAR_GRADIENTS,
  ProfileAvatarState,
  ProfileModal,
} from './components/ProfileModal';
import { SPassView } from './components/SPassView';
import { UeberweisenView } from './components/UeberweisenView';
import {
  DEMO_BALANCE_EUR,
  DISCLAIMER_TEXT,
  INITIAL_HEIMVORTEIL_TX,
  LOCAL_CLUBS,
  PARTICIPATING_SHOPS,
} from './data/mockData';
import {
  BonusAction,
  ChatMsg,
  HeimvorteilTx,
  RegionId,
  TabId,
  TransferRecord,
  UserNumbers,
} from './types';
import { formatEur } from './utils/format';

function nowTimeLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

function buildScriptedReply(text: string, nums: UserNumbers): string {
  const lower = text.toLowerCase();
  if (lower.includes('ezb') || lower.includes('zins')) {
    const diff = (nums.tagesgeld * 0.0025).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Die EZB senkt den Leitzins um 0,25 Prozentpunkte. Bei deinem Beispiel-Tagesgeld (${nums.tagesgeld.toLocaleString(
      'de-DE'
    )} €) sind das rund ${diff} € weniger Zinsen im Jahr.`;
  }
  if (lower.includes('wohnung') || lower.includes('miete')) {
    return `Dein Einkommensnachweis liegt bei 1.450 € netto (Beispiel). Bei der 3×-Kaltmiete-Regel passt eine Kaltmiete bis 483 € — im Tab S-Pass kannst du das direkt als Ja/Nein-Nachweis testen.`;
  }
  if (lower.includes('brief') || lower.includes('beitragsservice')) {
    return `Im Brief-Decoder liegt ein Beispielschreiben des Beitragsservice über 55,08 € (Frist 28.11.2026). Falls du BAföG bekommst, lässt sich im Anspruchs-Radar direkt eine Befreiung vorbereiten.`;
  }
  if (lower.includes('sparplan') || lower.includes('invest')) {
    return `Auf dem Startbildschirm kannst du einen Sparplan ab 1 € pro Monat einstellen und deinen Heimvorteil-Bonus automatisch dazulegen. Angezeigt wird nur deine eingezahlte Summe, ohne Renditeprognose.`;
  }
  return `Gute Frage! Zu deinen Beispiel-Zahlen (Tagesgeld ${nums.tagesgeld.toLocaleString(
    'de-DE'
  )} €, Kaltmiete ${nums.kaltmiete} €) findest du die Details direkt in Klartext, S-Pass oder Heimvorteil. Wenn du möchtest, verbinde ich dich jederzeit mit Frau Yilmaz.`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('start');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<ProfileAvatarState>({
    imageUrl: null,
    gradientId: 'sparkasse',
  });
  const demoUserId = 'S1-ML-8492031';
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [balanceEur, setBalanceEur] = useState<number>(DEMO_BALANCE_EUR);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Klartext shared numbers
  const [userNumbers, setUserNumbers] = useState<UserNumbers>({
    tagesgeld: 2000,
    kaltmiete: 520,
    stromKwh: 1500,
  });

  // Heimvorteil shared state
  const [region, setRegion] = useState<RegionId>('berlin');
  const [transactions, setTransactions] = useState<HeimvorteilTx[]>(
    INITIAL_HEIMVORTEIL_TX
  );
  const [shopCounter, setShopCounter] = useState(0);
  const [bonusAction, setBonusAction] = useState<BonusAction>('sparen');
  const [selectedClub, setSelectedClub] = useState<string>(LOCAL_CLUBS[0]);

  // Assistent state
  const [adviserMode, setAdviserMode] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: 'Hallo Mia! Ich bin dein s / One Assistent. Frag mich zu Nachrichten in Klartext, zu Briefen im S-Pass oder zu deinem Budget.',
      time: '09:41',
    },
  ]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const totalBonusEur = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      if (tx.ratePct === null) return sum;
      return sum + tx.amountEur * (tx.ratePct / 100);
    }, 0);
  }, [transactions]);

  const handleSimulateLocalPayment = () => {
    const shop = PARTICIPATING_SHOPS[shopCounter % PARTICIPATING_SHOPS.length];
    setShopCounter((c) => c + 1);
    const newTx: HeimvorteilTx = {
      id: `sim-${Date.now()}`,
      merchant: shop.name,
      initial: shop.initial,
      amountEur: shop.sampleAmountEur,
      ratePct: shop.ratePct,
      dateLabel: 'Gerade eben · Simulation',
    };
    setTransactions((prev) => [newTx, ...prev]);
    const earned = shop.sampleAmountEur * (shop.ratePct / 100);
    showToast(
      `Mit Sparkassen-Card bezahlt: +${formatEur(earned)} Bonus bei ${shop.name}`
    );
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: nowTimeLabel(),
    };
    const replyText = adviserMode
      ? 'Vielen Dank für deine Nachricht! Frau Yilmaz hat dein Anliegen im Blick und meldet sich im Prototyp direkt mit konkreten nächsten Schritten.'
      : buildScriptedReply(text, userNumbers);

    const botMsg: ChatMsg = {
      id: `b-${Date.now() + 1}`,
      sender: adviserMode ? 'adviser' : 'ai',
      text: replyText,
      time: nowTimeLabel(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSwitchToAdviser = (contextText?: string) => {
    setAdviserMode(true);
    setActiveTab('assistent');
    const handoverMsg: ChatMsg = {
      id: `adv-${Date.now()}`,
      sender: 'adviser',
      text: contextText
        ? `Hallo Mia, hier ist Frau Yilmaz von deiner Sparkasse vor Ort. Ich habe deinen Verlauf übernommen und sehe dein Thema: „${contextText}“ Wie kann ich dir konkret helfen?`
        : 'Hallo Mia, hier ist Frau Yilmaz von deiner Sparkasse vor Ort. Ich habe deinen bisherigen Chat-Verlauf vollständig vorliegen. Wobei kann ich dir persönlich weiterhelfen?',
      time: nowTimeLabel(),
    };
    setMessages((prev) => [...prev, handoverMsg]);
  };

  const handleExecuteTransfer = (
    transfer: Omit<TransferRecord, 'id' | 'dateLabel'>
  ) => {
    const newTx: TransferRecord = {
      ...transfer,
      id: `tx-${Date.now()}`,
      dateLabel: `Heute · ${nowTimeLabel()}`,
    };
    setBalanceEur((prev) => Math.max(0, +(prev - transfer.amountEur).toFixed(2)));
    setTransfers((prev) => [newTx, ...prev]);
    showToast(
      `${formatEur(transfer.amountEur)} über ${transfer.channelLabel} gesendet (Demo)`
    );
  };

  const tabTitles: Record<TabId, string> = {
    start: 'Guten Tag, Mia',
    klartext: 'Klartext',
    spass: 'S-Pass',
    heimvorteil: 'Heimvorteil',
    assistent: 'Assistent',
    ueberweisen: 'Überweisen',
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Ambient Drifting Color Layer Behind Glass (s / One Palette) */}
      <div className="ambient" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10">
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onJumpToAdviser={() => handleSwitchToAdviser()}
        />

        {/* Main Content Area */}
        <div className="lg:pl-[292px] pb-28 lg:pb-10">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
            {/* Top Header */}
            <header className="mb-5 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
              <div className="flex items-center justify-between gap-3 sm:block min-w-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <img
                      src="/assets/aistudio/s-one-logo.png"
                      alt="s / One Logo"
                      className="lg:hidden h-7 w-auto object-contain select-none pointer-events-none shrink-0"
                    />
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full glass-inset text-[var(--label-2)]">
                      Konzept · Beispieldaten
                    </span>
                  </div>
                  <div className="text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] text-white truncate mt-1">
                    {tabTitles[activeTab]}
                  </div>
                </div>

                {/* Mobile-only right controls so Suche stays centered below */}
                <div className="flex sm:hidden items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotifOpen(true)}
                    aria-label="Mitteilungen"
                    className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    aria-label="Profil Mia Lindner öffnen"
                    className="flex w-[44px] h-[44px] rounded-full glass-btn overflow-hidden items-center justify-center text-[13px] font-bold text-white cursor-pointer shrink-0"
                    style={
                      profileAvatar.imageUrl
                        ? undefined
                        : {
                            background:
                              AVATAR_GRADIENTS.find(
                                (g) => g.id === profileAvatar.gradientId
                              )?.style ?? AVATAR_GRADIENTS[0].style,
                          }
                    }
                  >
                    {profileAvatar.imageUrl ? (
                      <img
                        src={profileAvatar.imageUrl}
                        alt="Profilbild Mia Lindner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      'ML'
                    )}
                  </button>
                </div>
              </div>

              {/* Center Top "Suche" Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Suche öffnen"
                  className="min-h-[42px] px-5 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] glass-btn flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--label-2)] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span>Suche</span>
                </button>
              </div>

              {/* Desktop / Tablet Right Controls */}
              <div className="hidden sm:flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setNotifOpen(true)}
                  aria-label="Mitteilungen"
                  className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  aria-label="Profil Mia Lindner öffnen"
                  className="flex w-[44px] h-[44px] rounded-full glass-btn overflow-hidden items-center justify-center text-[13px] font-bold text-white cursor-pointer shrink-0"
                  style={
                    profileAvatar.imageUrl
                      ? undefined
                      : {
                          background:
                            AVATAR_GRADIENTS.find(
                              (g) => g.id === profileAvatar.gradientId
                            )?.style ?? AVATAR_GRADIENTS[0].style,
                        }
                  }
                >
                  {profileAvatar.imageUrl ? (
                    <img
                      src={profileAvatar.imageUrl}
                      alt="Profilbild Mia Lindner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'ML'
                  )}
                </button>
              </div>
            </header>

            {/* Active View */}
            <main key={activeTab} className="animate-tab-enter">
              {activeTab === 'start' && (
                <HomeView
                  balanceEur={balanceEur}
                  onSelectTab={setActiveTab}
                  onShowToast={showToast}
                  onOpenOnboarding={() => setOnboardingOpen(true)}
                  monthlyBonusEur={totalBonusEur}
                />
              )}

              {activeTab === 'ueberweisen' && (
                <UeberweisenView
                  balanceEur={balanceEur}
                  transfers={transfers}
                  onBackToStart={() => setActiveTab('start')}
                  onExecuteTransfer={handleExecuteTransfer}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'klartext' && (
                <KlartextView
                  userNumbers={userNumbers}
                  onChangeNumbers={setUserNumbers}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'spass' && (
                <SPassView
                  onShowToast={showToast}
                  onJumpToAdviserWithContext={(ctx) => handleSwitchToAdviser(ctx)}
                />
              )}

              {activeTab === 'heimvorteil' && (
                <HeimvorteilView
                  region={region}
                  onChangeRegion={setRegion}
                  transactions={transactions}
                  totalBonusEur={totalBonusEur}
                  bonusAction={bonusAction}
                  onChangeBonusAction={setBonusAction}
                  selectedClub={selectedClub}
                  onChangeClub={setSelectedClub}
                  onSimulateLocalPayment={handleSimulateLocalPayment}
                />
              )}

              {activeTab === 'assistent' && (
                <AssistentView
                  messages={messages}
                  adviserMode={adviserMode}
                  onSendMessage={handleSendMessage}
                  onSwitchToAdviser={() => handleSwitchToAdviser()}
                  onBackToAi={() => setAdviserMode(false)}
                />
              )}
            </main>

            {/* Persistent Mobile Disclaimer */}
            <footer className="mt-8 pt-4 border-t border-white/[0.10] text-[12px] text-[var(--label-2)] lg:hidden">
              {DISCLAIMER_TEXT}
            </footer>
          </div>
        </div>
      </div>

      {/* Search Sheet */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Suche"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSearchOpen(false);
              setSearchQuery('');
            }
          }}
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-end sm:items-start justify-center p-3 sm:p-4 sm:pt-16"
        >
          <div className="w-full max-w-md glass-thick rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-white">
                Suche &amp; Schnellzugriff
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Suche schließen"
                className="w-[40px] h-[40px] glass-btn flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="flex items-center gap-2.5 glass-input px-3.5 min-h-[44px]">
              <Search className="w-4 h-4 text-[var(--label-2)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Funktion oder Bereich suchen …"
                className="w-full bg-transparent text-[14px] text-white placeholder:text-[var(--label-2)] focus:outline-none"
              />
            </label>

            <div className="space-y-2">
              {(
                [
                  ['start', 'Start · Giro, Gesamtes Vermögen & Kassenbons'],
                  ['ueberweisen', 'Überweisen · S/One, Wero, Banken, Gruppen, Krypton & Spenden'],
                  ['klartext', 'Klartext · EZB & Strompreis in Euro'],
                  ['spass', 'S-Pass · Ja/Nein-Nachweis & Brief-Decoder'],
                  ['heimvorteil', 'Heimvorteil · Kiez-Bonus vor Ort'],
                  ['assistent', 'Assistent · KI & Frau Yilmaz'],
                ] as [TabId, string][]
              )
                .filter(([, label]) =>
                  label.toLowerCase().includes(searchQuery.trim().toLowerCase())
                )
                .map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 min-h-[44px] glass-btn !rounded-2xl text-[14px] font-medium text-white cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Sheet */}
      {notifOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mitteilungen"
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-end sm:items-start justify-center p-3 sm:p-4 sm:pt-16"
        >
          <div className="w-full max-w-md glass-thick rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-white">
                Mitteilungen (Beispiel)
              </h2>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                aria-label="Mitteilungen schließen"
                className="w-[40px] h-[40px] glass-btn flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('spass');
                  setNotifOpen(false);
                }}
                className="w-full text-left p-3.5 glass-btn !rounded-2xl cursor-pointer"
              >
                <div className="text-[14px] font-semibold text-white">
                  Frist im Brief-Decoder: 28.11.2026
                </div>
                <div className="text-[12px] text-[var(--label-2)] mt-0.5">
                  Beitragsservice 55,08 € · Befreiung prüfen
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('klartext');
                  setNotifOpen(false);
                }}
                className="w-full text-left p-3.5 glass-btn !rounded-2xl cursor-pointer"
              >
                <div className="text-[14px] font-semibold text-white">
                  Neue Artikel in Klartext
                </div>
                <div className="text-[12px] text-[var(--label-2)] mt-0.5">
                  Handelsblatt · Vorsorgedepot, EZB &amp; Immobilien
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        userId={demoUserId}
        avatar={profileAvatar}
        onChangeAvatar={setProfileAvatar}
        onOpenAssistent={() => {
          setProfileOpen(false);
          setActiveTab('assistent');
        }}
        onShowToast={showToast}
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full glass-thick text-white text-[13px] font-medium max-w-[90vw] text-center"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
