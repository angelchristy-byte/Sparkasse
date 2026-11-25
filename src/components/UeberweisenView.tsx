import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Camera,
  CheckCircle2,
  Coins,
  HeartHandshake,
  ScanBarcode,
  Search,
  Smartphone,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { TransferChannelId, TransferRecord } from '../types';
import { formatEur } from '../utils/format';
import { GlassCard } from './GlassCard';

interface UeberweisenViewProps {
  balanceEur: number;
  transfers: TransferRecord[];
  onBackToStart: () => void;
  onExecuteTransfer: (transfer: Omit<TransferRecord, 'id' | 'dateLabel'>) => void;
  onShowToast?: (message: string) => void;
}

interface ChannelOption {
  id: TransferChannelId;
  label: string;
  subtitle: string;
  badgeText: string;
  color: string;
  icon: typeof Sparkles;
}

interface SearchableContact {
  id: string;
  name: string;
  sOneId: string;
  phone: string;
  email: string;
  channel: TransferChannelId;
  recipientValue: string;
  iban?: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: 's-one',
    label: 'S/One',
    subtitle: 'Direkt an @Tag oder Kontakt · Sofort',
    badgeText: 'Echtzeit · 0 €',
    color: '#FF3B30',
    icon: Sparkles,
  },
  {
    id: 'wero',
    label: 'Wero',
    subtitle: 'Europäisch per Handynummer oder E-Mail',
    badgeText: 'In 10 Sek.',
    color: '#0A84FF',
    icon: Smartphone,
  },
  {
    id: 'banken',
    label: 'Banken',
    subtitle: 'Klassisch oder per SEPA-Echtzeit via IBAN',
    badgeText: 'IBAN · SEPA',
    color: '#34C759',
    icon: Building2,
  },
  {
    id: 'gruppen',
    label: 'Gruppen',
    subtitle: 'Beträge mit WG, Reise oder Verein teilen',
    badgeText: 'Split & Pool',
    color: '#BF5AF2',
    icon: Users,
  },
  {
    id: 'krypton',
    label: 'Krypton',
    subtitle: 'An Wallet-Adresse oder Krypto-Depot',
    badgeText: 'BTC · ETH · USDC',
    color: '#FF9F0A',
    icon: Coins,
  },
  {
    id: 'wohltaetig',
    label: 'Wohltätige Organisation',
    subtitle: 'Spenden mit Beleg direkt im S-Pass',
    badgeText: '0 % Gebühr',
    color: '#FF6961',
    icon: HeartHandshake,
  },
];

const SEARCHABLE_DIRECTORY: SearchableContact[] = [
  {
    id: 'dir-1',
    name: 'Lena Krüger',
    sOneId: '@lena.s1',
    phone: '+49 176 3102 8841',
    email: 'lena.krueger@mail.de',
    channel: 's-one',
    recipientValue: '@lena.s1',
  },
  {
    id: 'dir-2',
    name: 'Jonas Meyer',
    sOneId: '@jonas.s1',
    phone: '+49 151 9482 1104',
    email: 'jonas.meyer@mail.de',
    channel: 's-one',
    recipientValue: '@jonas.s1',
  },
  {
    id: 'dir-3',
    name: 'Tarek Saleh',
    sOneId: '@tarek.s1',
    phone: '+49 172 6019 4520',
    email: 'tarek.saleh@mail.de',
    channel: 's-one',
    recipientValue: '@tarek.s1',
  },
  {
    id: 'dir-4',
    name: 'Marie Weber',
    sOneId: 'S1-MW-3910482',
    phone: '+49 176 4820 1190',
    email: 'marie.weber@mail.de',
    channel: 'wero',
    recipientValue: '+49 176 4820 1190',
  },
  {
    id: 'dir-5',
    name: 'Paul Richter',
    sOneId: 'S1-PR-5082149',
    phone: '+49 160 7731 9920',
    email: 'paul.richter@mail.de',
    channel: 'wero',
    recipientValue: 'paul.richter@mail.de',
  },
  {
    id: 'dir-6',
    name: 'Hausverwaltung Nord',
    sOneId: 'DE89 1005 0000 0190 4421 08',
    phone: '+49 30 5550 2400',
    email: 'miete@hausverwaltung-nord.de',
    channel: 'banken',
    recipientValue: 'Hausverwaltung Nord',
    iban: 'DE89 1005 0000 0190 4421 08',
  },
];

const S_ONE_CONTACTS = [
  { name: 'Lena K.', handle: '@lena.s1' },
  { name: 'Jonas M.', handle: '@jonas.s1' },
  { name: 'Tarek S.', handle: '@tarek.s1' },
];

const WERO_CONTACTS = [
  { name: 'Marie Weber', contact: '+49 176 4820 1190' },
  { name: 'Paul Richter', contact: 'paul.richter@mail.de' },
];

const BANK_TEMPLATES = [
  {
    name: 'Hausverwaltung Nord',
    iban: 'DE89 1005 0000 0190 4421 08',
    ref: 'Miete November',
  },
  {
    name: 'Stadtwerke Berlin',
    iban: 'DE44 1005 0000 0821 3340 12',
    ref: 'Abschlag Strom',
  },
];

const GROUP_PRESETS = [
  { id: 'wg', name: 'WG-Kasse Friedrichshain', members: 3 },
  { id: 'trip', name: 'Lissabon-Trip 2026', members: 5 },
  { id: 'verein', name: 'SV Nord Mannschaftskasse', members: 11 },
];

const CRYPTO_ASSETS = [
  { id: 'btc', label: 'Bitcoin (BTC)', rateEur: 84200 },
  { id: 'eth', label: 'Ethereum (ETH)', rateEur: 2950 },
  { id: 'usdc', label: 'USD Coin (USDC)', rateEur: 0.94 },
];

const CHARITY_ORGS = [
  {
    id: 'tafel',
    name: 'Berliner Tafel e. V.',
    focus: 'Lebensmittelrettung & Nachbarschaft',
  },
  {
    id: 'kinder',
    name: 'Deutsches Kinderhilfswerk',
    focus: 'Chancengleichheit für Kinder',
  },
  {
    id: 'nabu',
    name: 'NABU Naturschutzbund',
    focus: 'Klima- & Artenschutz vor Ort',
  },
  {
    id: 'msf',
    name: 'Ärzte ohne Grenzen',
    focus: 'Medizinische Nothilfe weltweit',
  },
];

const QUICK_AMOUNTS = [10, 25, 50, 100];

const DEMO_SCANNED_CODES = [
  { label: 'Lena Krüger (@lena.s1)', value: '@lena.s1' },
  { label: 'Jonas Meyer (S1-JM-7721049)', value: 'S1-JM-7721049' },
  { label: 'Marie Weber (+49 176 4820 1190)', value: '+49 176 4820 1190' },
];

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
}

export function UeberweisenView({
  balanceEur,
  transfers,
  onBackToStart,
  onExecuteTransfer,
  onShowToast,
}: UeberweisenViewProps) {
  const [channel, setChannel] = useState<TransferChannelId>('s-one');

  // Search bar ("Name, @S/OneID, Telefon, E-mail")
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Camera Barcode Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<
    'starting' | 'active' | 'error'
  >('starting');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form fields
  const [recipient, setRecipient] = useState('@lena.s1');
  const [iban, setIban] = useState('DE89 1005 0000 0190 4421 08');
  const [sepaInstant, setSepaInstant] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(GROUP_PRESETS[0].id);
  const [selectedCryptoId, setSelectedCryptoId] = useState(CRYPTO_ASSETS[0].id);
  const [walletAddress, setWalletAddress] = useState(
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  );
  const [selectedCharity, setSelectedCharity] = useState(CHARITY_ORGS[0].name);
  const [saveReceiptInSPass, setSaveReceiptInSPass] = useState(true);

  const [amountInput, setAmountInput] = useState('25,00');
  const [reference, setReference] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    channelLabel: string;
    recipient: string;
    amountEur: number;
  } | null>(null);

  const activeChannelMeta = useMemo(
    () => CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0],
    [channel]
  );

  const parsedAmount = useMemo(() => {
    const normalized = amountInput.replace(/\./g, '').replace(',', '.').trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }, [amountInput]);

  const selectedGroup = useMemo(
    () =>
      GROUP_PRESETS.find((g) => g.id === selectedGroupId) ?? GROUP_PRESETS[0],
    [selectedGroupId]
  );

  const selectedCrypto = useMemo(
    () =>
      CRYPTO_ASSETS.find((a) => a.id === selectedCryptoId) ?? CRYPTO_ASSETS[0],
    [selectedCryptoId]
  );

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCHABLE_DIRECTORY;
    return SEARCHABLE_DIRECTORY.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.sOneId.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q) ||
        entry.email.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const applyScannedOrEnteredValue = useCallback(
    (rawValue: string, sourceLabel: string) => {
      const val = rawValue.trim();
      if (!val) return;

      const lower = val.toLowerCase();
      if (/^de\d{2}/i.test(val.replace(/\s+/g, ''))) {
        setChannel('banken');
        setIban(val);
        setRecipient('IBAN-Empfänger');
      } else if (
        lower.startsWith('bc1') ||
        lower.startsWith('0x') ||
        lower.startsWith('1') ||
        lower.startsWith('3')
      ) {
        setChannel('krypton');
        setWalletAddress(val);
      } else if (val.includes('@') && !lower.endsWith('.s1')) {
        setChannel('wero');
        setRecipient(val);
      } else if (/^\+?\d[\d\s-]{6,}$/.test(val)) {
        setChannel('wero');
        setRecipient(val);
      } else {
        setChannel('s-one');
        setRecipient(val);
      }

      setSearchQuery(val);
      setSearchOpen(false);
      setErrorMsg(null);
      setLastReceipt(null);
      onShowToast?.(`${sourceLabel}: ${val}`);
    },
    [onShowToast]
  );

  // Automatically start camera when scanner modal opens
  useEffect(() => {
    if (!scannerOpen) {
      stopCameraStream();
      return;
    }

    let cancelled = false;
    let detectTimer: number | null = null;

    const startCamera = async () => {
      setCameraStatus('starting');
      setCameraError(null);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraStatus('error');
        setCameraError(
          'Kamera wird von diesem Browser oder Gerät nicht unterstützt.'
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraStatus('active');

        // Use native BarcodeDetector if available in the browser
        const DetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts?: {
              formats?: string[];
            }) => BarcodeDetectorLike;
          }
        ).BarcodeDetector;

        if (DetectorCtor && videoRef.current) {
          const detector = new DetectorCtor({
            formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
          });
          detectTimer = window.setInterval(async () => {
            if (cancelled || !videoRef.current || videoRef.current.readyState < 2)
              return;
            try {
              const codes = await detector.detect(videoRef.current);
              const first = codes.find((c) => c.rawValue)?.rawValue;
              if (first) {
                setScannerOpen(false);
                applyScannedOrEnteredValue(first, 'Barcode erkannt');
              }
            } catch {
              // Ignore single-frame detection errors
            }
          }, 450);
        }
      } catch (err) {
        if (cancelled) return;
        setCameraStatus('error');
        const msg =
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Kamerazugriff wurde abgelehnt. Bitte erlaube die Kamera im Browser oder nutze den Demo-Scan.'
            : 'Keine aktive Kamera gefunden. Du kannst unten direkt einen Beispiel-Barcode scannen.';
        setCameraError(msg);
      }
    };

    startCamera();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setScannerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelled = true;
      if (detectTimer !== null) {
        window.clearInterval(detectTimer);
      }
      window.removeEventListener('keydown', handleKey);
      stopCameraStream();
    };
  }, [scannerOpen, stopCameraStream, applyScannedOrEnteredValue]);

  const handleSelectChannel = (next: TransferChannelId) => {
    setChannel(next);
    setErrorMsg(null);
    setLastReceipt(null);
    if (next === 's-one') {
      setRecipient(S_ONE_CONTACTS[0].handle);
      setReference('Mittagessen');
    } else if (next === 'wero') {
      setRecipient(WERO_CONTACTS[0].contact);
      setReference('Wero Zahlung');
    } else if (next === 'banken') {
      setRecipient(BANK_TEMPLATES[0].name);
      setIban(BANK_TEMPLATES[0].iban);
      setReference(BANK_TEMPLATES[0].ref);
    } else if (next === 'gruppen') {
      setReference('Anteil Gruppenkasse');
    } else if (next === 'krypton') {
      setReference('Krypton Wallet-Transfer');
    } else if (next === 'wohltaetig') {
      setReference('Spende');
    }
  };

  const handleSelectDirectoryContact = (entry: SearchableContact) => {
    setChannel(entry.channel);
    setRecipient(entry.recipientValue);
    if (entry.iban) {
      setIban(entry.iban);
    }
    setSearchQuery(`${entry.name} (${entry.sOneId})`);
    setSearchOpen(false);
    setErrorMsg(null);
    setLastReceipt(null);
    onShowToast?.(`Empfänger ausgewählt: ${entry.name}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount <= 0) {
      setErrorMsg('Bitte gib einen Betrag größer als 0,00 € ein.');
      return;
    }
    if (parsedAmount > balanceEur) {
      setErrorMsg(
        `Der Betrag übersteigt dein verfügbares Guthaben (${formatEur(balanceEur)}).`
      );
      return;
    }

    let finalRecipient = recipient.trim();
    let finalReference = reference.trim();

    if (channel === 's-one') {
      if (!finalRecipient) {
        setErrorMsg('Bitte gib ein @s/One-Tag oder eine Handynummer an.');
        return;
      }
      if (!finalReference) finalReference = 'S/One Direktzahlung';
    } else if (channel === 'wero') {
      if (!finalRecipient) {
        setErrorMsg(
          'Bitte gib eine Handynummer oder E-Mail-Adresse für Wero ein.'
        );
        return;
      }
      if (!finalReference) finalReference = 'Wero Echtzeit-Transfer';
    } else if (channel === 'banken') {
      if (!finalRecipient || !iban.trim()) {
        setErrorMsg('Bitte Empfängername und IBAN ausfüllen.');
        return;
      }
      finalReference = `${finalReference || 'SEPA-Überweisung'} · ${
        sepaInstant ? 'Echtzeit' : 'Standard'
      }`;
    } else if (channel === 'gruppen') {
      finalRecipient = `${selectedGroup.name} (${selectedGroup.members} Pers.)`;
      if (!finalReference) finalReference = 'Gruppen-Ausgleich';
    } else if (channel === 'krypton') {
      if (!walletAddress.trim()) {
        setErrorMsg('Bitte eine Ziel-Wallet-Adresse angeben.');
        return;
      }
      const qty = (parsedAmount / selectedCrypto.rateEur).toFixed(6);
      finalRecipient = `${selectedCrypto.label} · ${walletAddress.trim().slice(0, 14)}…`;
      finalReference = `${qty} ${selectedCrypto.id.toUpperCase()} (Beispielkurs)`;
    } else if (channel === 'wohltaetig') {
      finalRecipient = selectedCharity;
      finalReference = saveReceiptInSPass
        ? `${finalReference || 'Spende'} · Beleg im S-Pass`
        : finalReference || 'Spende';
    }

    onExecuteTransfer({
      channel,
      channelLabel: activeChannelMeta.label,
      recipient: finalRecipient,
      reference: finalReference,
      amountEur: parsedAmount,
    });

    setLastReceipt({
      channelLabel: activeChannelMeta.label,
      recipient: finalRecipient,
      amountEur: parsedAmount,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation & Account Context Card */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToStart}
            className="min-h-[42px] px-4 glass-btn text-[13px] font-semibold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zu Start</span>
          </button>

          <div className="text-right tabular-nums">
            <div className="text-[12px] text-[var(--label-2)]">
              Giro &amp; Rücklagen · Verfügbar
            </div>
            <div className="text-[20px] font-bold text-white leading-tight">
              {formatEur(balanceEur)}
            </div>
          </div>
        </div>

        {/* Suchen Bar ("Name, @S/OneID, Telefon, E-mail") + Right-Side Camera Barcode Scan Button */}
        <div className="mt-4 pt-4 border-t border-white/[0.10] space-y-2.5">
          <div className="flex items-stretch gap-2">
            <div
              onClick={() => {
                setSearchOpen(true);
                searchInputRef.current?.focus();
              }}
              className="flex-1 min-h-[48px] glass-input px-3.5 flex items-center gap-2.5 cursor-text"
            >
              <Search className="w-4 h-4 text-[var(--label-2)] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                aria-label="Suchen: Name, @S/OneID, Telefon, E-mail"
                placeholder="Name, @S/OneID, Telefon, E-mail"
                className="w-full bg-transparent text-[14px] text-white placeholder:text-[var(--label-2)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Suche leeren"
                  className="w-7 h-7 rounded-full hover:bg-white/[0.12] flex items-center justify-center text-[var(--label-2)] hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              aria-label="Barcode mit Kamera scannen"
              title="Barcode mit Kamera scannen"
              className="min-h-[48px] px-4 glass-btn flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ScanBarcode className="w-5 h-5 text-[#0A84FF] shrink-0" />
              <span className="hidden sm:inline text-[13px] font-semibold">
                Barcode
              </span>
            </button>
          </div>

          {searchOpen && (
            <div className="glass-inset p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[12px] font-medium text-[var(--label-2)]">
                  Empfänger finden · Name, @S/OneID, Telefon, E-mail
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-[12px] font-medium text-[var(--label-2)] hover:text-white cursor-pointer"
                >
                  Schließen
                </button>
              </div>

              {filteredDirectory.length > 0 ? (
                <div className="divide-y divide-white/[0.08]">
                  {filteredDirectory.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleSelectDirectoryContact(entry)}
                      className="w-full text-left py-2.5 px-2 rounded-xl hover:bg-white/[0.08] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-white truncate">
                          {entry.name}
                        </div>
                        <div className="text-[12px] text-[var(--label-2)] truncate tabular-nums">
                          {entry.sOneId} · {entry.phone} · {entry.email}
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0A84FF] shrink-0">
                        Übernehmen
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] text-[var(--label-2)]">
                    Kein gespeicherter Kontakt für „{searchQuery}“
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      applyScannedOrEnteredValue(
                        searchQuery,
                        'Empfänger übernommen'
                      )
                    }
                    className="min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer"
                  >
                    „{searchQuery}“ direkt verwenden
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.10]">
          <div className="text-[12px] font-medium text-[var(--label-2)]">
            Zahlungsweg wählen · 6 Optionen
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-white mt-0.5">
            Geld überweisen
          </h1>

          {/* 6 Channel Options Grid */}
          <div
            role="radiogroup"
            aria-label="Überweisungsart auswählen"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4"
          >
            {CHANNELS.map((item) => {
              const Icon = item.icon;
              const isSelected = channel === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectChannel(item.id)}
                  className={`text-left glass-inset p-3.5 transition-all cursor-pointer min-h-[76px] flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white/[0.15] border-white/[0.34] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                      : 'hover:bg-white/[0.10]'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.14] flex items-center justify-center shrink-0 mt-0.5"
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${item.color}26`,
                            borderColor: `${item.color}66`,
                          }
                        : undefined
                    }
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-white truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-[var(--label-2)] mt-0.5 leading-snug">
                      {item.subtitle}
                    </div>
                    <div className="text-[11px] font-medium text-white/75 mt-1.5">
                      {item.badgeText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Active Channel Transfer Form */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.10]">
          <div>
            <div className="text-[12px] text-[var(--label-2)]">
              Ausgewählte Option
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white mt-0.5">
              {activeChannelMeta.label}
            </h2>
          </div>
          <span className="text-[12px] font-medium text-[var(--label-2)]">
            {activeChannelMeta.badgeText}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel-Specific Recipient Section */}
          {channel === 's-one' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-[var(--label-2)] mr-1">
                  Schnellauswahl:
                </span>
                {S_ONE_CONTACTS.map((c) => (
                  <button
                    key={c.handle}
                    type="button"
                    onClick={() => setRecipient(c.handle)}
                    className={`min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer whitespace-nowrap ${
                      recipient === c.handle
                        ? 'glass-btn-active text-white'
                        : 'text-[var(--label-2)]'
                    }`}
                  >
                    {c.name} ({c.handle})
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="sone-recipient"
                  className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
                >
                  s / One Tag, S/OneID oder Handynummer
                </label>
                <input
                  id="sone-recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@name.s1, S1-… oder +49 …"
                  className="w-full min-h-[46px] px-3.5 glass-input text-[14px]"
                />
              </div>
            </div>
          )}

          {channel === 'wero' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-[var(--label-2)] mr-1">
                  Wero-Kontakte:
                </span>
                {WERO_CONTACTS.map((c) => (
                  <button
                    key={c.contact}
                    type="button"
                    onClick={() => setRecipient(c.contact)}
                    className={`min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer whitespace-nowrap ${
                      recipient === c.contact
                        ? 'glass-btn-active text-white'
                        : 'text-[var(--label-2)]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="wero-recipient"
                  className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
                >
                  Mobilnummer oder E-Mail (Wero-Empfänger)
                </label>
                <input
                  id="wero-recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+49 176 … oder name@mail.de"
                  className="w-full min-h-[46px] px-3.5 glass-input text-[14px]"
                />
              </div>
            </div>
          )}

          {channel === 'banken' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-[var(--label-2)] mr-1">
                  Vorlagen:
                </span>
                {BANK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.iban}
                    type="button"
                    onClick={() => {
                      setRecipient(tpl.name);
                      setIban(tpl.iban);
                      setReference(tpl.ref);
                    }}
                    className={`min-h-[36px] px-3.5 glass-btn text-[12px] font-semibold cursor-pointer whitespace-nowrap ${
                      iban === tpl.iban
                        ? 'glass-btn-active text-white'
                        : 'text-[var(--label-2)]'
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="bank-recipient"
                    className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
                  >
                    Empfängername
                  </label>
                  <input
                    id="bank-recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Vor- und Nachname oder Firma"
                    className="w-full min-h-[46px] px-3.5 glass-input text-[14px]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bank-iban"
                    className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
                  >
                    IBAN
                  </label>
                  <input
                    id="bank-iban"
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="DE00 0000 0000 0000 0000 00"
                    className="w-full min-h-[46px] px-3.5 glass-input text-[14px] tabular-nums"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSepaInstant(true)}
                  className={`min-h-[38px] px-4 glass-btn text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    sepaInstant
                      ? 'glass-btn-active text-white'
                      : 'text-[var(--label-2)]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#34C759]" />
                  <span>Echtzeit-Überweisung</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSepaInstant(false)}
                  className={`min-h-[38px] px-4 glass-btn text-[12px] font-semibold cursor-pointer ${
                    !sepaInstant
                      ? 'glass-btn-active text-white'
                      : 'text-[var(--label-2)]'
                  }`}
                >
                  Standard-SEPA (1 Bankarbeitstag)
                </button>
              </div>
            </div>
          )}

          {channel === 'gruppen' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GROUP_PRESETS.map((grp) => {
                  const active = selectedGroupId === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSelectedGroupId(grp.id)}
                      className={`text-left glass-inset p-3.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-white/[0.14] border-white/[0.32]'
                          : 'hover:bg-white/[0.09]'
                      }`}
                    >
                      <div className="text-[14px] font-semibold text-white">
                        {grp.name}
                      </div>
                      <div className="text-[12px] text-[var(--label-2)] mt-0.5 tabular-nums">
                        {grp.members} Mitglieder
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="glass-inset p-3.5 flex items-center justify-between gap-3 text-[13px] tabular-nums">
                <span className="text-[var(--label-2)]">
                  Dein Anteil bei gleichmäßiger Teilung ({selectedGroup.members}{' '}
                  Personen)
                </span>
                <span className="font-bold text-white">
                  {formatEur(parsedAmount / selectedGroup.members)} / Person
                </span>
              </div>
            </div>
          )}

          {channel === 'krypton' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CRYPTO_ASSETS.map((asset) => {
                  const active = selectedCryptoId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedCryptoId(asset.id)}
                      className={`text-left glass-inset p-3.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-white/[0.14] border-white/[0.32]'
                          : 'hover:bg-white/[0.09]'
                      }`}
                    >
                      <div className="text-[14px] font-semibold text-white">
                        {asset.label}
                      </div>
                      <div className="text-[12px] text-[var(--label-2)] mt-0.5 tabular-nums">
                        Kurs ~{formatEur(asset.rateEur)}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="krypton-wallet"
                  className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
                >
                  Ziel-Wallet-Adresse (Krypton)
                </label>
                <input
                  id="krypton-wallet"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Wallet-Adresse oder s / One Krypto-Depot"
                  className="w-full min-h-[46px] px-3.5 glass-input text-[14px] tabular-nums"
                />
              </div>

              <div className="glass-inset p-3.5 flex flex-wrap items-center justify-between gap-2 text-[13px] tabular-nums">
                <span className="text-[var(--label-2)]">
                  Geschätzter Gegenwert (Beispielkurs)
                </span>
                <span className="font-bold text-[#FF9F0A]">
                  {(parsedAmount / selectedCrypto.rateEur).toFixed(6)}{' '}
                  {selectedCrypto.id.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {channel === 'wohltaetig' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHARITY_ORGS.map((org) => {
                  const active = selectedCharity === org.name;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedCharity(org.name)}
                      className={`text-left glass-inset p-3.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-white/[0.14] border-white/[0.32]'
                          : 'hover:bg-white/[0.09]'
                      }`}
                    >
                      <div className="text-[14px] font-semibold text-white">
                        {org.name}
                      </div>
                      <div className="text-[12px] text-[var(--label-2)] mt-0.5">
                        {org.focus}
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center justify-between gap-3 p-3.5 glass-inset cursor-pointer min-h-[48px]">
                <span className="text-[13px] font-medium text-white">
                  Zuwendungsbestätigung automatisch im S-Pass ablegen
                </span>
                <input
                  type="checkbox"
                  checked={saveReceiptInSPass}
                  onChange={(e) => setSaveReceiptInSPass(e.target.checked)}
                  className="w-5 h-5 accent-[#34C759] rounded cursor-pointer shrink-0"
                />
              </label>
            </div>
          )}

          {/* Amount & Reference Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label
                htmlFor="transfer-amount"
                className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
              >
                Betrag in EUR
              </label>
              <input
                id="transfer-amount"
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0,00"
                className="w-full min-h-[48px] px-3.5 glass-input text-[18px] font-bold text-white tabular-nums"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setAmountInput(
                        val.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      )
                    }
                    className="min-h-[34px] px-3 glass-btn text-[12px] font-semibold tabular-nums cursor-pointer"
                  >
                    {val} €
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="transfer-reference"
                className="block text-[12px] font-medium text-[var(--label-2)] mb-1.5"
              >
                Verwendungszweck / Notiz
              </label>
              <input
                id="transfer-reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Optionaler Hinweis"
                className="w-full min-h-[48px] px-3.5 glass-input text-[14px]"
              />
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="glass-inset p-3 text-[13px] font-medium text-[#FF6961]"
            >
              {errorMsg}
            </div>
          )}

          {lastReceipt && (
            <div
              role="status"
              className="glass-inset p-3.5 flex items-center gap-3 text-[13px] text-white"
            >
              <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold">
                  {formatEur(lastReceipt.amountEur)} über{' '}
                  {lastReceipt.channelLabel} gesendet
                </span>
                <span className="text-[var(--label-2)]">
                  {' '}
                  · Empfänger: {lastReceipt.recipient} (Demo)
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12px] text-[var(--label-2)]">
              Demo-Funktion ohne echte Kontobuchung
            </span>
            <button
              type="submit"
              className="min-h-[48px] px-6 glass-btn glass-btn-primary text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Jetzt über {activeChannelMeta.label} senden</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Recent Simulated Transfers */}
      {transfers.length > 0 && (
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-[16px] font-semibold text-white">
              Letzte Überweisungen · Demo-Verlauf
            </h2>
            <span className="text-[12px] text-[var(--label-2)] tabular-nums">
              {transfers.length} Buchungen
            </span>
          </div>
          <div className="divide-y divide-white/[0.08] glass-inset px-3.5 py-1">
            {transfers.map((tx) => (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-white truncate">
                    {tx.recipient}
                  </div>
                  <div className="text-[12px] text-[var(--label-2)] truncate">
                    {tx.channelLabel} · {tx.reference} · {tx.dateLabel}
                  </div>
                </div>
                <span className="text-[14px] font-bold text-white tabular-nums shrink-0">
                  -{formatEur(tx.amountEur)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Camera Barcode Scanner Modal */}
      {scannerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Kamera Barcode-Scanner"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setScannerOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
        >
          <div className="w-full max-w-md glass-thick rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-medium text-[var(--label-2)]">
                  s / One · Zahlungs-Barcode
                </div>
                <h2 className="text-[18px] font-bold text-white mt-0.5">
                  Barcode mit Kamera scannen
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                aria-label="Scanner schließen"
                className="w-[44px] h-[44px] glass-btn flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Camera Viewfinder */}
            <div className="relative aspect-[4/3] w-full rounded-[20px] overflow-hidden bg-black/70 border border-white/[0.18] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Scan Frame Corner Guides */}
              {cameraStatus === 'active' && (
                <div
                  aria-hidden="true"
                  className="absolute inset-8 pointer-events-none"
                >
                  <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white rounded-tl-xl" />
                  <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white rounded-tr-xl" />
                  <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white rounded-bl-xl" />
                  <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white rounded-br-xl" />
                </div>
              )}

              {cameraStatus === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Camera className="w-7 h-7 text-[#0A84FF]" />
                  <span className="text-[13px] font-medium text-white">
                    Kamera wird gestartet …
                  </span>
                </div>
              )}

              {cameraStatus === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center">
                  <Camera className="w-7 h-7 text-[var(--label-2)]" />
                  <p className="text-[13px] text-[var(--label-2)] leading-relaxed">
                    {cameraError}
                  </p>
                </div>
              )}
            </div>

            <p className="text-[12px] text-[var(--label-2)] leading-relaxed">
              {cameraStatus === 'active'
                ? 'Halte den s / One Barcode oder QR-Code einer anderen Person vor die Kamera.'
                : 'Alternativ kannst du direkt einen Beispiel-Barcode übernehmen:'}
            </p>

            {/* Helpful Demo Barcode Presets for Prototyping / Devices without Camera */}
            <div className="space-y-2">
              {DEMO_SCANNED_CODES.map((sample) => (
                <button
                  key={sample.value}
                  type="button"
                  onClick={() => {
                    setScannerOpen(false);
                    applyScannedOrEnteredValue(
                      sample.value,
                      'Barcode übernommen'
                    );
                  }}
                  className="w-full text-left px-3.5 min-h-[42px] glass-btn !rounded-2xl text-[13px] font-medium text-white flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate">{sample.label}</span>
                  <span className="text-[11px] font-semibold text-[#0A84FF] shrink-0">
                    Scannen
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
