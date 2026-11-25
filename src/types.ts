export type TabId =
  | 'start'
  | 'klartext'
  | 'spass'
  | 'heimvorteil'
  | 'assistent'
  | 'ueberweisen';
export type Timeframe = '1T' | '1W' | '1M' | '1J' | 'Max';
export type RegionId = 'berlin' | 'koeln' | 'muenchen';
export type BonusAction = 'auszahlen' | 'sparen' | 'spenden';

export type TransferChannelId =
  | 's-one'
  | 'wero'
  | 'banken'
  | 'gruppen'
  | 'krypton'
  | 'wohltaetig';

export interface TransferRecord {
  id: string;
  channel: TransferChannelId;
  channelLabel: string;
  recipient: string;
  reference: string;
  amountEur: number;
  dateLabel: string;
}

export interface UserNumbers {
  tagesgeld: number;
  kaltmiete: number;
  stromKwh: number;
}

export interface KlartextNewsItem {
  id: string;
  source: string;
  topic: string;
  headline: string;
  summary: string;
  url: string;
  hasFormula: boolean;
  computeEuroLine: (nums: UserNumbers) => string;
  computeFormula: (nums: UserNumbers) => string;
}

export interface WalletCard {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  detail: string;
}

export type ProofClaimType = 'rent3x' | 'over18' | 'enrolled';

export interface BriefLetter {
  id: string;
  chipLabel: string;
  sender: string;
  amount: string;
  deadline: string;
  summaryKi: string;
  todo: string;
  actions: string[];
}

export interface RadarToggles {
  studiere: boolean;
  miete: boolean;
  niedrigesEinkommen: boolean;
  kind: boolean;
}

export interface RadarBenefit {
  id: string;
  name: string;
  office: string;
  note?: string;
}

export interface HeimvorteilTx {
  id: string;
  merchant: string;
  initial: string;
  amountEur: number;
  ratePct: number | null;
  note?: string;
  dateLabel: string;
}

export interface ParticipatingShop {
  id: string;
  name: string;
  initial: string;
  category: string;
  ratePct: number;
  sampleAmountEur: number;
}

export interface ChatMsg {
  id: string;
  sender: 'ai' | 'user' | 'adviser';
  text: string;
  time: string;
}

export type ExpenseCategoryId =
  | 'lebensmittel'
  | 'bargeld'
  | 'restaurant'
  | 'vertraege'
  | 'miete'
  | 'freizeit';

export interface ReceiptLineItem {
  id: string;
  name: string;
  subcategory?: string;
  category: ExpenseCategoryId;
  amountEur: number;
}

export interface DigitalReceipt {
  id: string;
  merchant: string;
  initial: string;
  dateLabel: string;
  items: ReceiptLineItem[];
}

export type WealthCategoryId =
  | 'investieren'
  | 'geldmittel'
  | 'erspartes_fonds'
  | 'credit'
  | 'crypto'
  | 'verknuepft';

export interface WealthCategoryItem {
  id: WealthCategoryId;
  label: string;
  subtitle: string;
  amountEur: number;
  isLiability?: boolean;
  color: string;
}

export type StartWidgetId =
  | 'karten'
  | 'sparziele'
  | 'abos'
  | 'wechselgeld'
  | 'fristen'
  | 'kiezbonus';

export interface StartWidgetMeta {
  id: StartWidgetId;
  title: string;
  category: string;
  description: string;
}
