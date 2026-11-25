import {
  BriefLetter,
  DigitalReceipt,
  ExpenseCategoryId,
  HeimvorteilTx,
  KlartextNewsItem,
  ParticipatingShop,
  RadarBenefit,
  RadarToggles,
  RegionId,
  Timeframe,
  WalletCard,
  WealthCategoryItem,
} from '../types';

export const DISCLAIMER_TEXT =
  'Konzept-Prototyp eines Studierendenprojekts (HTW Berlin × Sparkasse, AI Promptathon). Kein offizielles Angebot der Sparkasse.';

export const DEMO_BALANCE_EUR = 1284.5;
export const DEMO_NET_INCOME_EUR = 1450;

export const CHART_SERIES: Record<Timeframe, number[]> = {
  '1T': [1278.2, 1279.8, 1279.1, 1281.4, 1282.9, 1283.6, 1284.5],
  '1W': [1241.0, 1249.5, 1255.2, 1262.8, 1270.1, 1278.4, 1284.5],
  '1M': [1165.0, 1188.4, 1204.0, 1228.5, 1249.0, 1268.2, 1284.5],
  '1J': [840.0, 915.0, 980.0, 1055.0, 1130.0, 1212.0, 1284.5],
  Max: [420.0, 590.0, 740.0, 895.0, 1045.0, 1175.0, 1284.5],
};

export const REGIONS: Record<RegionId, { city: string; bonusName: string }> = {
  berlin: { city: 'Berlin', bonusName: 'Kiez-Bonus' },
  koeln: { city: 'Köln', bonusName: 'Veedel-Bonus' },
  muenchen: { city: 'München', bonusName: 'Viertel-Bonus' },
};

export const KLARTEXT_NEWS: KlartextNewsItem[] = [
  {
    id: 'hb-vorsorgedepot',
    source: 'Handelsblatt · 14.11.2026',
    topic: 'Vorsorge',
    headline:
      'Rente: „Wer in Eigenregie anlegt, läuft Gefahr, teure Fehler zu begehen“ – zwölf Antworten zum Vorsorgedepot',
    summary:
      'Das Altersvorsorgedepot ersetzt ab 2027 die Riester-Rente und lockt mit staatlicher Förderung. Das sorgt bei vielen Fachleuten für Begeisterung. Doch die neue Förderrente ist nicht in allen Belangen spitze.',
    url: 'https://www.handelsblatt.com/finanzen/vorsorge/altersvorsorge-sparen/rente-die-zwoelf-wichtigsten-antworten-zum-altersvorsorgedepot/100265976.html',
    hasFormula: false,
    computeEuroLine: () =>
      'Start für Neuverträge ab 2027, aktuell keine direkte Euro-Auswirkung auf dein Girokonto. Die Sparkasse bewertet politische Vorhaben nicht.',
    computeFormula: () => '',
  },
  {
    id: 'hb-ezb',
    source: 'Handelsblatt · 13.11.2026',
    topic: 'Geldpolitik & Zinsen',
    headline:
      'Notenbank: Merz will nächste Woche deutschen Vorschlag für Posten in EZB-Führung vorlegen',
    summary:
      'Der Bundeskanzler kündigt einen Plan aus Berlin für die EZB-Spitze an. Nach der jüngsten Zinspause richtet sich der Blick am Markt auf den weiteren Zinskurs im Euroraum.',
    url: 'https://www.handelsblatt.com/finanzen/geldpolitik/notenbank-merz-will-deutschen-vorschlag-fuer-posten-in-ezb-fuehrung-vorlegen/100269750.html',
    hasFormula: true,
    computeEuroLine: ({ tagesgeld }) => {
      const diff = (tagesgeld * 0.0025).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `Bei deinem Tagesgeld (${tagesgeld.toLocaleString('de-DE')} €) entspricht ein Zinsschritt von 0,25 Prozentpunkten rund ${diff} € Unterschied pro Jahr.`;
    },
    computeFormula: ({ tagesgeld }) => {
      const diff = (tagesgeld * 0.0025).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${tagesgeld.toLocaleString('de-DE')} € × 0,25 % = ${diff} € / Jahr (Sensitivität pro 0,25 Prozentpunkte)`;
    },
  },
  {
    id: 'hb-immobilien',
    source: 'Handelsblatt · 14.11.2026',
    topic: 'Wohnen & Immobilien',
    headline:
      'Immobilien: Bis zu 135 Jahre Preisvorteil – wo sich ein Immobilienkauf rund um Düsseldorf für Pendler lohnt',
    summary:
      'Die NRW-Landeshauptstadt gilt als eine der teuersten Metropolen Deutschlands. Eine exklusive Auswertung zeigt, welche umliegenden Städte für Pendler besonders attraktiv sind.',
    url: 'https://www.handelsblatt.com/finanzen/immobilien/immobilien-wo-sich-ein-immobilienkauf-rund-um-duesseldorf-fuer-pendler-lohnt/100266843.html',
    hasFormula: true,
    computeEuroLine: ({ kaltmiete }) => {
      const perYear = kaltmiete * 12;
      const diff4 = kaltmiete * 0.04;
      return `Deine Kaltmiete (${kaltmiete.toLocaleString('de-DE')} €) summiert sich auf ${perYear.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € im Jahr – jeder Unterschied von 4 % bedeutet ${diff4.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € pro Monat.`;
    },
    computeFormula: ({ kaltmiete }) => {
      const perYear = kaltmiete * 12;
      const diff4 = kaltmiete * 0.04;
      return `${kaltmiete.toLocaleString('de-DE')} € × 12 = ${perYear.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr | 4 % = ${diff4.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Monat`;
    },
  },
  {
    id: 'hb-energie',
    source: 'Handelsblatt · 11.11.2026',
    topic: 'Energie & Netze',
    headline:
      'Energie: Stabile Zahlen, wachsende Netzlast: Eon steigert Ergebnis leicht und hält an Investitionsplänen fest',
    summary:
      'Nach dem jüngst bekannt gewordenen Sparprogramm will der Konzern weiter Milliarden in die Netze investieren – ist aber besorgt wegen einer ausstehenden Behördenentscheidung.',
    url: 'https://www.handelsblatt.com/unternehmen/energie/energie-eon-steigert-ergebnis-leicht-und-haelt-an-investitionsplaenen-fest/100267945.html',
    hasFormula: true,
    computeEuroLine: ({ stromKwh }) => {
      const impact = stromKwh * 0.02;
      return `Bei deinem Verbrauch (${stromKwh.toLocaleString('de-DE')} kWh/Jahr) verändern 2 Cent/kWh beim Netz- oder Strompreis deine Jahreskosten um ${impact.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €.`;
    },
    computeFormula: ({ stromKwh }) => {
      const impact = stromKwh * 0.02;
      return `${stromKwh.toLocaleString('de-DE')} kWh × 0,02 € = ${impact.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr`;
    },
  },
  {
    id: 'hb-neobroker',
    source: 'Handelsblatt · 13.11.2026',
    topic: 'Banking & Börse',
    headline: 'Neobroker: So setzt Trade Republic die Börsen unter Druck',
    summary:
      'Der Neobroker Trade Republic wickelt inzwischen viele Kundenorders selbst ab – und bedroht damit das Geschäft kleinerer Börsen. Die erheben nun schwere Vorwürfe.',
    url: 'https://www.handelsblatt.com/finanzen/banken-versicherungen/banken/trade-republic-warum-etablierte-boersen-den-berliner-neobroker-kritisieren/100269404.html',
    hasFormula: false,
    computeEuroLine: () =>
      'Betrifft die Abwicklung im Wertpapierhandel; auf dein laufendes Girokonto hat das keine direkte Auswirkung.',
    computeFormula: () => '',
  },
];

export const WALLET_CARDS: WalletCard[] = [
  {
    id: 'pers',
    title: 'Personalausweis',
    subtitle: 'eID · verifiziert',
    status: 'aktiv',
    detail: 'Ausweisdokument (Beispiel) · NFC-Chip bestätigt',
  },
  {
    id: 'stud',
    title: 'Studierendenausweis',
    subtitle: 'Hochschule (Beispiel)',
    status: 'aktiv',
    detail: 'Immatrikulation Wintersemester (Beispiel)',
  },
  {
    id: 'einkommen',
    title: 'Einkommensnachweis',
    subtitle: 'aus Gehaltseingängen erkannt',
    status: 'aktiv',
    detail: 'Durchschnitt 1.450 € netto / Monat (Beispiel)',
  },
];

export const BRIEF_LETTERS: BriefLetter[] = [
  {
    id: 'rundfunk',
    chipLabel: 'Beitragsservice 55,08 €',
    sender: 'ARD ZDF Deutschlandradio Beitragsservice (Beispiel)',
    amount: '55,08 €',
    deadline: '28.11.2026',
    summaryKi:
      'Quartalsbeitrag für drei Monate (18,36 €/Monat). Wenn du BAföG erhältst, kannst du dich rückwirkend oder ab sofort befreien lassen.',
    todo: 'Entweder 55,08 € bis 28.11.2026 überweisen oder Befreiungsantrag im Anspruchs-Radar vorbereiten.',
    actions: ['Überweisung vormerken', 'Befreiung prüfen', 'Frist merken'],
  },
  {
    id: 'finanzamt',
    chipLabel: 'Finanzamt +312 € Erstattung',
    sender: 'Finanzamt Mitte · Steuerbescheid (Beispiel)',
    amount: '+312,00 € Erstattung',
    deadline: 'Einspruch bis 18.12.2026',
    summaryKi:
      'Dein Steuerbescheid weist eine Erstattung von 312 € aus. Falls Fahrtkosten oder Arbeitsmittel fehlen, läuft die Einspruchsfrist bis zum 18.12.2026.',
    todo: 'Prüfen, ob Werbungskosten berücksichtigt wurden. Falls alles stimmt, erfolgt die Gutschrift automatisch.',
    actions: ['Bescheid abhaken', 'Einspruch-Check', 'Belege prüfen'],
  },
  {
    id: 'krankenkasse',
    chipLabel: 'Krankenkasse +4,20 €/Monat',
    sender: 'Gesetzliche Krankenkasse (Beispiel)',
    amount: '+4,20 € / Monat',
    deadline: 'Wechsel bis 31.01.2027',
    summaryKi:
      'Deine Krankenkasse erhöht den Zusatzbeitrag. Dadurch entsteht ein Sonderkündigungsrecht bis zum 31.01.2027.',
    todo: 'Beitragssatz vergleichen. Bei einem Wechsel übernimmt die neue Kasse die Abmeldung.',
    actions: ['Frist speichern', 'Beitrag vergleichen'],
  },
];

export function computeRadarBenefits(toggles: RadarToggles): RadarBenefit[] {
  const list: RadarBenefit[] = [];
  if (toggles.studiere) {
    list.push({
      id: 'bafoeg',
      name: 'BAföG',
      office: 'Studierendenwerk / BAföG-Amt',
    });
  }
  if (toggles.miete && toggles.niedrigesEinkommen) {
    list.push({
      id: 'wohngeld',
      name: 'Wohngeld',
      office: 'Wohngeldstelle der Stadt / des Bezirks',
      note: 'Hinweis: meist ausgeschlossen bei einem bestehenden BAföG-Anspruch dem Grunde nach.',
    });
  }
  if (toggles.niedrigesEinkommen || toggles.studiere) {
    list.push({
      id: 'rundfunk',
      name: 'Befreiung Rundfunkbeitrag',
      office: 'ARD ZDF Deutschlandradio Beitragsservice',
    });
  }
  if (toggles.kind) {
    list.push({
      id: 'kindergeld',
      name: 'Kindergeld',
      office: 'Familienkasse der Bundesagentur für Arbeit',
    });
  }
  return list;
}

export const INITIAL_HEIMVORTEIL_TX: HeimvorteilTx[] = [
  {
    id: 'h-1',
    merchant: 'Bäckerei Krume',
    initial: 'B',
    amountEur: 6.4,
    ratePct: 3,
    dateLabel: 'Heute · Beispiel',
  },
  {
    id: 'h-2',
    merchant: 'Online-Versandhändler',
    initial: 'O',
    amountEur: 39.99,
    ratePct: null,
    note: 'kein lokaler Händler',
    dateLabel: 'Gestern · Beispiel',
  },
  {
    id: 'h-3',
    merchant: 'Buchladen Seitenwind',
    initial: 'B',
    amountEur: 18.0,
    ratePct: 5,
    dateLabel: '12.11. · Beispiel',
  },
  {
    id: 'h-4',
    merchant: 'Café Ecke',
    initial: 'C',
    amountEur: 4.2,
    ratePct: 3,
    dateLabel: '10.11. · Beispiel',
  },
  {
    id: 'h-5',
    merchant: 'Bio-Laden Grünzeug',
    initial: 'B',
    amountEur: 23.15,
    ratePct: 2,
    dateLabel: '08.11. · Beispiel',
  },
];

export const PARTICIPATING_SHOPS: ParticipatingShop[] = [
  {
    id: 'shop-1',
    name: 'Bäckerei Krume (Beispiel)',
    initial: 'B',
    category: 'Bäckerei & Backwaren',
    ratePct: 3,
    sampleAmountEur: 6.4,
  },
  {
    id: 'shop-2',
    name: 'Buchladen Seitenwind (Beispiel)',
    initial: 'B',
    category: 'Bücher & Kultur',
    ratePct: 5,
    sampleAmountEur: 18.0,
  },
  {
    id: 'shop-3',
    name: 'Café Ecke (Beispiel)',
    initial: 'C',
    category: 'Café',
    ratePct: 3,
    sampleAmountEur: 4.2,
  },
  {
    id: 'shop-4',
    name: 'Bio-Laden Grünzeug (Beispiel)',
    initial: 'B',
    category: 'Lebensmittel',
    ratePct: 2,
    sampleAmountEur: 23.15,
  },
];

export const LOCAL_CLUBS = [
  'Jugendfußball SV Nord (Beispiel)',
  'Nachbarschaftsgarten e. V. (Beispiel)',
  'Tierheim um die Ecke (Beispiel)',
];

export const EXPENSE_CATEGORIES: {
  id: ExpenseCategoryId;
  label: string;
  color: string;
}[] = [
  { id: 'lebensmittel', label: 'Lebensmittel', color: '#34C759' },
  { id: 'bargeld', label: 'Bargeld', color: '#FFD60A' },
  { id: 'restaurant', label: 'Restaurant', color: '#FF9F0A' },
  { id: 'vertraege', label: 'Verträge', color: '#0A84FF' },
  { id: 'miete', label: 'Miete', color: '#BF5AF2' },
  { id: 'freizeit', label: 'Freizeit', color: '#FF6961' },
];

export const INITIAL_RECEIPTS: DigitalReceipt[] = [
  {
    id: 'bon-rewe',
    merchant: 'REWE Markt (Beispiel)',
    initial: 'R',
    dateLabel: 'Heute · 14:22',
    items: [
      { id: 'i-1', name: 'Bio-Äpfel & Gemüse', subcategory: 'Obst & Gemüse', category: 'lebensmittel', amountEur: 11.2 },
      { id: 'i-2', name: 'Hafermilch & Vollkornbrot', subcategory: 'Grundnahrungsmittel', category: 'lebensmittel', amountEur: 6.35 },
      { id: 'i-3', name: 'Schokolade & Fruchtgummi', subcategory: 'Süßigkeiten', category: 'lebensmittel', amountEur: 5.4 },
      { id: 'i-4', name: 'Nuss-Mix & Kekse', subcategory: 'Süßigkeiten', category: 'lebensmittel', amountEur: 4.2 },
    ],
  },
  {
    id: 'bon-miete',
    merchant: 'Hausverwaltung Nord (Beispiel)',
    initial: 'M',
    dateLabel: '01.11. · Dauerauftrag',
    items: [
      { id: 'i-5', name: 'Kaltmiete Wohnung', subcategory: 'Wohnen', category: 'miete', amountEur: 520.0 },
      { id: 'i-6', name: 'Betriebskosten-Vorauszahlung', subcategory: 'Nebenkosten', category: 'miete', amountEur: 65.0 },
    ],
  },
  {
    id: 'bon-bargeld',
    merchant: 'Sparkasse Geldautomat (Beispiel)',
    initial: 'S',
    dateLabel: 'Gestern · 18:10',
    items: [
      { id: 'i-7', name: 'Bargeldauszahlung', subcategory: 'Abhebung', category: 'bargeld', amountEur: 50.0 },
    ],
  },
  {
    id: 'bon-restaurant',
    merchant: 'Trattoria Bella (Beispiel)',
    initial: 'T',
    dateLabel: '12.11. · 20:15',
    items: [
      { id: 'i-8', name: 'Pasta & Limonade', subcategory: 'Abendessen', category: 'restaurant', amountEur: 18.9 },
      { id: 'i-9', name: 'Tiramisu', subcategory: 'Dessert', category: 'restaurant', amountEur: 5.5 },
    ],
  },
  {
    id: 'bon-vertraege',
    merchant: 'Monatliche Verträge (Beispiel)',
    initial: 'V',
    dateLabel: '05.11. · Lastschrift',
    items: [
      { id: 'i-10', name: 'Deutschlandticket', subcategory: 'ÖPNV', category: 'vertraege', amountEur: 58.0 },
      { id: 'i-11', name: 'Stromabschlag', subcategory: 'Energie', category: 'vertraege', amountEur: 38.0 },
      { id: 'i-12', name: 'Mobilfunk-Tarif', subcategory: 'Handy', category: 'vertraege', amountEur: 14.99 },
    ],
  },
  {
    id: 'bon-freizeit',
    merchant: 'Kino am Ostkreuz (Beispiel)',
    initial: 'K',
    dateLabel: '09.11. · 19:45',
    items: [
      { id: 'i-13', name: 'Kinoticket Abendvorstellung', subcategory: 'Kino', category: 'freizeit', amountEur: 12.5 },
      { id: 'i-14', name: 'Popcorn & Nachos', subcategory: 'Süßigkeiten & Snacks', category: 'freizeit', amountEur: 7.9 },
    ],
  },
  {
    id: 'bon-bio',
    merchant: 'Bio-Laden Grünzeug (Beispiel)',
    initial: 'G',
    dateLabel: '08.11. · 18:05',
    items: [
      { id: 'i-15', name: 'Pasta, Tomaten & Käse', subcategory: 'Kochen', category: 'lebensmittel', amountEur: 17.45 },
      { id: 'i-16', name: 'Dunkle Schokolade 75 %', subcategory: 'Süßigkeiten', category: 'lebensmittel', amountEur: 5.7 },
    ],
  },
];

export const EXTRA_RECEIPTS: DigitalReceipt[] = [
  {
    id: 'bon-spaeti',
    merchant: 'Spätkauf am Kiez (Beispiel)',
    initial: 'S',
    dateLabel: 'Gerade eben · Bon verknüpft',
    items: [
      { id: 'ex-1', name: 'Eis & Gummibärchen', subcategory: 'Süßigkeiten', category: 'lebensmittel', amountEur: 4.9 },
      { id: 'ex-2', name: 'Mineralwasser 1 L', subcategory: 'Getränke', category: 'lebensmittel', amountEur: 2.5 },
    ],
  },
  {
    id: 'bon-cafe',
    merchant: 'Café Ecke (Beispiel)',
    initial: 'C',
    dateLabel: 'Gerade eben · Bon verknüpft',
    items: [
      { id: 'ex-3', name: 'Flat White', subcategory: 'Café', category: 'restaurant', amountEur: 4.2 },
      { id: 'ex-4', name: 'Brownie', subcategory: 'Dessert', category: 'restaurant', amountEur: 3.6 },
    ],
  },
];

export const WEALTH_CATEGORIES: WealthCategoryItem[] = [
  {
    id: 'investieren',
    label: 'Investieren',
    subtitle: 'ETFs & Aktien-Sparplan',
    amountEur: 4850.0,
    color: '#34C759',
  },
  {
    id: 'geldmittel',
    label: 'Geldmittel',
    subtitle: 'Giro & liquide Rücklagen',
    amountEur: DEMO_BALANCE_EUR,
    color: '#0A84FF',
  },
  {
    id: 'erspartes_fonds',
    label: 'Erspartes und Fonds',
    subtitle: 'Tagesgeld & Deka-Fonds',
    amountEur: 5200.0,
    color: '#BF5AF2',
  },
  {
    id: 'credit',
    label: 'Credit',
    subtitle: 'Kreditkarte & Ratenrahmen',
    amountEur: -420.0,
    isLiability: true,
    color: '#FF6961',
  },
  {
    id: 'crypto',
    label: 'Crypto',
    subtitle: 'Bitcoin & Ethereum (Beispiel)',
    amountEur: 1460.0,
    color: '#FF9F0A',
  },
  {
    id: 'verknuepft',
    label: 'Verknüpft',
    subtitle: 'Externe Konten · Multibanking',
    amountEur: 2150.0,
    color: '#5AC8FA',
  },
];

