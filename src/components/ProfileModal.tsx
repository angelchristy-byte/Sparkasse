import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  HelpCircle,
  Inbox,
  LogOut,
  RotateCcw,
  ScanBarcode,
  Settings,
  Shield,
  UserPlus,
  X,
} from 'lucide-react';

export interface ProfileAvatarState {
  imageUrl: string | null;
  gradientId: string;
}

export const AVATAR_GRADIENTS: { id: string; label: string; style: string }[] = [
  {
    id: 'sparkasse',
    label: 's / One Rot-Violett',
    style: 'linear-gradient(135deg, #FF551A 0%, #F50087 55%, #6E00FF 100%)',
  },
  {
    id: 'ocean',
    label: 'Ozean Blau',
    style: 'linear-gradient(135deg, #0A84FF 0%, #5AC8FA 100%)',
  },
  {
    id: 'emerald',
    label: 'Smaragd Grün',
    style: 'linear-gradient(135deg, #34C759 0%, #0A84FF 100%)',
  },
  {
    id: 'amber',
    label: 'Sonnenuntergang',
    style: 'linear-gradient(135deg, #FF9F0A 0%, #FF1744 100%)',
  },
];

type ProfileSubView =
  | 'main'
  | 'barcode'
  | 'invite'
  | 'inbox'
  | 'security'
  | 'faq'
  | 'settings'
  | 'logout';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  avatar: ProfileAvatarState;
  onChangeAvatar: (next: ProfileAvatarState) => void;
  onOpenAssistent: () => void;
  onShowToast: (message: string) => void;
}

const FAQ_ITEMS = [
  {
    q: 'Wie funktioniert der Ja/Nein-Nachweis im S-Pass?',
    a: 'Es wird nur bestätigt, ob eine Bedingung erfüllt ist (z. B. 3× Kaltmiete). Kontostand und Gehaltszettel bleiben verborgen.',
  },
  {
    q: 'Wie sammle ich den Heimvorteil Kiez-Bonus?',
    a: 'Bei teilnehmenden lokalen Geschäften wird automatisch ein Cashback-Anteil gutgeschrieben, den du sparen, auszahlen oder spenden kannst.',
  },
  {
    q: 'Sind die angezeigten Beträge echte Kontodaten?',
    a: 'Nein, s / One ist ein interaktiver Konzept-Prototyp mit Beispieldaten ohne reale Bankbuchungen.',
  },
];

/** Deterministic Code-128 style bar widths from userId string */
function generateBarcodeBars(code: string): { x: number; w: number }[] {
  const bars: { x: number; w: number }[] = [];
  let cursor = 8;

  const startPattern = [2, 1, 1, 2, 1, 4];
  startPattern.forEach((width, idx) => {
    if (idx % 2 === 0) bars.push({ x: cursor, w: width });
    cursor += width;
  });

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const widths = [
      ((charCode >> 0) & 1) + 1,
      ((charCode >> 1) & 1) + 1,
      ((charCode >> 2) & 1) + 1,
      ((charCode >> 3) & 1) + 2,
      ((charCode >> 4) & 1) + 1,
      ((charCode >> 5) & 1) + 1,
    ];
    widths.forEach((w, idx) => {
      if (idx % 2 === 0) {
        bars.push({ x: cursor, w });
      }
      cursor += w;
    });
  }

  const stopPattern = [2, 3, 1, 1, 1, 2];
  stopPattern.forEach((width, idx) => {
    if (idx % 2 === 0) bars.push({ x: cursor, w: width });
    cursor += width;
  });

  return bars;
}

export function ProfileModal({
  open,
  onClose,
  userId,
  avatar,
  onChangeAvatar,
  onOpenAssistent,
  onShowToast,
}: ProfileModalProps) {
  const [subView, setSubView] = useState<ProfileSubView>('main');
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Security toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushTanEnabled, setPushTanEnabled] = useState(true);
  const [foreignPaymentsEnabled, setForeignPaymentsEnabled] = useState(false);

  // Settings toggles
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [autoReceipts, setAutoReceipts] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSubView('main');
      setCopied(false);
      setInviteCopied(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (subView !== 'main') {
          setSubView('main');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, subView, onClose]);

  const barcodeBars = useMemo(() => generateBarcodeBars(userId), [userId]);
  const barcodeTotalWidth = useMemo(() => {
    if (barcodeBars.length === 0) return 200;
    const last = barcodeBars[barcodeBars.length - 1];
    return last.x + last.w + 8;
  }, [barcodeBars]);

  if (!open) return null;

  const activeGradient =
    AVATAR_GRADIENTS.find((g) => g.id === avatar.gradientId)?.style ??
    AVATAR_GRADIENTS[0].style;

  const inviteLink = `https://s-one.demo/einladen/${userId}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeAvatar({ ...avatar, imageUrl: reader.result });
        onShowToast('Profilbild aktualisiert');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard?.writeText(userId);
    } catch {
      // Ignore clipboard permission errors cleanly
    }
    setCopied(true);
    onShowToast(`user_id kopiert: ${userId}`);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard?.writeText(inviteLink);
    } catch {
      // Ignore clipboard permission errors cleanly
    }
    setInviteCopied(true);
    onShowToast('Einladungslink kopiert');
    window.setTimeout(() => setInviteCopied(false), 1800);
  };

  const subViewTitles: Record<ProfileSubView, { kicker: string; title: string }> = {
    main: { kicker: 's / One Konto', title: 'Profil' },
    barcode: { kicker: 'Digitale ID-Karte', title: 'Dein ID-Barcode' },
    invite: { kicker: 'Freunde & Familie', title: 'Kontakte einladen' },
    inbox: { kicker: 'Nachrichten', title: 'Chat-Posteingang' },
    security: { kicker: 'Konto & Freigabe', title: 'Sicherheit' },
    faq: { kicker: 'Hilfe & Antworten', title: 'FAQ' },
    settings: { kicker: 'App-Präferenzen', title: 'Einstellungen' },
    logout: { kicker: 'Sitzung', title: 'Abmelden' },
  };

  const headerMeta = subViewTitles[subView];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={headerMeta.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <div className="w-full max-w-md glass-thick rounded-[28px] p-5 sm:p-6 max-h-[88vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {subView !== 'main' && (
              <button
                type="button"
                onClick={() => setSubView('main')}
                aria-label="Zurück zum Profil"
                className="w-[40px] h-[40px] glass-btn flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="text-[12px] font-medium text-[var(--label-2)]">
                {headerMeta.kicker}
              </div>
              <h2 className="text-[19px] font-bold text-white leading-tight">
                {headerMeta.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Profil schließen"
            className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-0.5 flex-1">
          {subView === 'main' && (
            <div className="space-y-4">
              {/* Profile Picture + Change Controls */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full border-2 border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.45)] overflow-hidden flex items-center justify-center text-[28px] font-bold text-white select-none"
                    style={
                      avatar.imageUrl ? undefined : { background: activeGradient }
                    }
                  >
                    {avatar.imageUrl ? (
                      <img
                        src={avatar.imageUrl}
                        alt="Profilbild Mia Lindner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      'ML'
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Profilbild ändern"
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full glass-btn glass-btn-primary flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-3 text-[18px] font-bold text-white">
                  Mia Lindner
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Profilbild ändern</span>
                  </button>

                  {avatar.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        onChangeAvatar({ ...avatar, imageUrl: null });
                        onShowToast('Standard-Initialen ML wiederhergestellt');
                      }}
                      className="min-h-[36px] px-3 glass-btn text-[12px] font-medium text-[var(--label-2)] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Zurücksetzen</span>
                    </button>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-center gap-2">
                  {AVATAR_GRADIENTS.map((preset) => {
                    const selected =
                      !avatar.imageUrl && avatar.gradientId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          onChangeAvatar({ imageUrl: null, gradientId: preset.id })
                        }
                        aria-label={`Avatar-Farbe ${preset.label}`}
                        title={preset.label}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          selected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1E] scale-110'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ background: preset.style }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Clickable user_id -> Barcode */}
              <button
                type="button"
                onClick={() => setSubView('barcode')}
                className="w-full glass-inset hover:bg-white/[0.12] p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[var(--label-2)]">
                    user_id
                  </div>
                  <div className="text-[15px] font-mono font-bold text-white tabular-nums truncate mt-0.5">
                    {userId}
                  </div>
                  <div className="text-[11px] text-[var(--label-2)] mt-0.5">
                    Antippen für ID &amp; Barcode
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#0A84FF]/[0.18] border border-[#0A84FF]/35 flex items-center justify-center text-[#0A84FF] shrink-0">
                  <ScanBarcode className="w-5 h-5" />
                </div>
              </button>

              {/* Profile Menu List */}
              <div className="glass-inset divide-y divide-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSubView('invite')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserPlus className="w-4 h-4 text-[#34C759] shrink-0" />
                    <span className="text-[14px] font-medium text-white">
                      Kontakte einladen
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('inbox')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Inbox className="w-4 h-4 text-[#0A84FF] shrink-0" />
                    <span className="text-[14px] font-medium text-white">
                      Chat-Posteingang
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-semibold text-[#0A84FF] tabular-nums">
                      2 neu
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--label-2)]" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('security')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Shield className="w-4 h-4 text-[#BF5AF2] shrink-0" />
                    <span className="text-[14px] font-medium text-white">
                      Sicherheit
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('faq')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <HelpCircle className="w-4 h-4 text-[#FF9F0A] shrink-0" />
                    <span className="text-[14px] font-medium text-white">
                      FAQ
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('settings')}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Settings className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                    <span className="text-[14px] font-medium text-white">
                      Einstellungen
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                </button>
              </div>

              {/* Last Part: Abmelden */}
              <button
                type="button"
                onClick={() => setSubView('logout')}
                className="w-full min-h-[46px] px-4 glass-btn text-[#FF6961] border-[#FF6961]/30 hover:bg-[#FF6961]/15 text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          )}

          {/* Barcode View */}
          {subView === 'barcode' && (
            <div className="space-y-4">
              <div className="bg-white text-[#05060A] rounded-[20px] p-5 shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 mb-3">
                  <span>s / One · Mia Lindner</span>
                  <span>Sparkasse ID</span>
                </div>

                <div className="w-full py-2 flex justify-center">
                  <svg
                    viewBox={`0 0 ${barcodeTotalWidth} 72`}
                    className="w-full max-w-[280px] h-[84px]"
                    role="img"
                    aria-label={`Barcode für user_id ${userId}`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width={barcodeTotalWidth}
                      height="72"
                      fill="#FFFFFF"
                    />
                    {barcodeBars.map((bar, index) => (
                      <rect
                        key={`${bar.x}-${index}`}
                        x={bar.x}
                        y="4"
                        width={bar.w}
                        height="64"
                        fill="#05060A"
                      />
                    ))}
                  </svg>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200 text-center">
                  <div className="text-[11px] font-medium text-neutral-500">
                    user_id
                  </div>
                  <div className="text-[19px] font-mono font-bold tracking-[0.12em] text-[#05060A] tabular-nums mt-0.5">
                    {userId}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex-1 min-h-[46px] glass-btn text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#34C759]" />
                      <span>Kopiert</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>ID kopieren</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('main')}
                  className="flex-1 min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
                >
                  Zurück
                </button>
              </div>
            </div>
          )}

          {/* Kontakte einladen */}
          {subView === 'invite' && (
            <div className="space-y-4">
              <div className="glass-inset p-4 space-y-3">
                <div className="text-[14px] font-semibold text-white">
                  Freunde zu s / One einladen
                </div>
                <p className="text-[13px] text-[var(--label-2)] leading-relaxed">
                  Teile deinen persönlichen Einladungslink. Kontakte können darüber direkt den Konto-Prototyp testen.
                </p>
                <div className="p-3 rounded-[14px] bg-white/[0.06] border border-white/[0.10] text-[12px] font-mono text-white truncate">
                  {inviteLink}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="w-full min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {inviteCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Einladungslink kopieren</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Chat-Posteingang */}
          {subView === 'inbox' && (
            <div className="space-y-3">
              <div className="glass-inset divide-y divide-white/[0.08]">
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#34C759]">
                      Frau Yilmaz · Sparkasse vor Ort
                    </span>
                    <span className="text-[var(--label-2)] tabular-nums">Heute</span>
                  </div>
                  <div className="text-[14px] font-semibold text-white">
                    Rückmeldung zu deinem Budget-Check
                  </div>
                  <p className="text-[12px] text-[var(--label-2)]">
                    Ich habe mir deine Fragen zum Sparplan angeschaut – melde dich gerne jederzeit im Chat.
                  </p>
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#0A84FF]">
                      s / One Assistent
                    </span>
                    <span className="text-[var(--label-2)] tabular-nums">Gestern</span>
                  </div>
                  <div className="text-[14px] font-semibold text-white">
                    Neue Frist erkannt: Beitragsservice 28.11.2026
                  </div>
                  <p className="text-[12px] text-[var(--label-2)]">
                    Du kannst im S-Pass prüfen, ob eine Befreiung für dich infrage kommt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAssistent}
                className="w-full min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
              >
                Im Assistenten öffnen
              </button>
            </div>
          )}

          {/* Sicherheit */}
          {subView === 'security' && (
            <div className="space-y-3">
              <div className="glass-inset divide-y divide-white/[0.08]">
                <label className="p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      Face ID / Biometrie
                    </div>
                    <div className="text-[12px] text-[var(--label-2)]">
                      App und Überweisungen per Biometrie schützen
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricsEnabled}
                    onChange={(e) => setBiometricsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#34C759] cursor-pointer shrink-0"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      Push-Freigabe (pushTAN)
                    </div>
                    <div className="text-[12px] text-[var(--label-2)]">
                      Aufträge direkt auf diesem Gerät bestätigen
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushTanEnabled}
                    onChange={(e) => setPushTanEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#34C759] cursor-pointer shrink-0"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      Zahlungen außerhalb Europas
                    </div>
                    <div className="text-[12px] text-[var(--label-2)]">
                      Karteneinsatz weltweit freigeben
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={foreignPaymentsEnabled}
                    onChange={(e) => setForeignPaymentsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#34C759] cursor-pointer shrink-0"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  onShowToast('Sicherheitseinstellungen gespeichert (Demo)');
                  setSubView('main');
                }}
                className="w-full min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
              >
                Übernehmen
              </button>
            </div>
          )}

          {/* FAQ */}
          {subView === 'faq' && (
            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="glass-inset p-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <span className="text-[14px] font-semibold text-white">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--label-2)] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 pt-2.5 border-t border-white/[0.08] text-[13px] text-[var(--label-2)] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Einstellungen */}
          {subView === 'settings' && (
            <div className="space-y-3">
              <div className="glass-inset divide-y divide-white/[0.08]">
                <label className="p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      Mitteilungen zu Fristen
                    </div>
                    <div className="text-[12px] text-[var(--label-2)]">
                      Vor Brief- und Steuerterminen erinnern
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={deadlineAlerts}
                    onChange={(e) => setDeadlineAlerts(e.target.checked)}
                    className="w-5 h-5 accent-[#34C759] cursor-pointer shrink-0"
                  />
                </label>

                <label className="p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-[14px] font-semibold text-white">
                      Kassenbons automatisch zuordnen
                    </div>
                    <div className="text-[12px] text-[var(--label-2)]">
                      Artikel auf der Startseite kategorisieren
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReceipts}
                    onChange={(e) => setAutoReceipts(e.target.checked)}
                    className="w-5 h-5 accent-[#34C759] cursor-pointer shrink-0"
                  />
                </label>

                <div className="p-3.5 flex items-center justify-between gap-3">
                  <span className="text-[14px] font-semibold text-white">
                    App-Sprache
                  </span>
                  <span className="text-[13px] text-[var(--label-2)]">
                    Deutsch
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onShowToast('Einstellungen gespeichert (Demo)');
                  setSubView('main');
                }}
                className="w-full min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
              >
                Speichern
              </button>
            </div>
          )}

          {/* Abmelden Confirmation */}
          {subView === 'logout' && (
            <div className="space-y-4">
              <div className="glass-inset p-4 space-y-2">
                <div className="text-[15px] font-semibold text-white">
                  Möchtest du dich wirklich abmelden?
                </div>
                <p className="text-[13px] text-[var(--label-2)] leading-relaxed">
                  Im Konzept-Prototyp wird deine aktuelle Sitzung beendet. Du kannst dich jederzeit wieder anmelden.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubView('main')}
                  className="flex-1 min-h-[46px] glass-btn text-[14px] font-semibold cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onShowToast('Erfolgreich abgemeldet (Demo)');
                  }}
                  className="flex-1 min-h-[46px] glass-btn glass-btn-primary text-[14px] font-semibold cursor-pointer"
                >
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
