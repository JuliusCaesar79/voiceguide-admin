// src/i18n/it.js
export default {
  common: {
    appName: "VoiceGuide Partner",
    language: "Lingua",
    italian: "Italiano",
    english: "Inglese",
    loading: "Caricamento…",
    error: "Errore",
    save: "Salva",
    cancel: "Annulla",
    back: "Indietro",
    logout: "Esci",
  },

  errors: {
    partnerTokenMissing: "Token partner mancante. Effettua di nuovo l'accesso.",
    partnerDataLoad: "Impossibile caricare i dati partner. Riprova.",
  },

  auth: {
    title: "Accesso Partner",
    email: "Email",
    referralCode: "Codice Partner",
    login: "Accedi",
    loggingIn: "Accesso in corso…",

    // Login page (nuove chiavi)
    portalSubtitle: "AirLink Partner Portal",
    subtitle:
      "Inserisci l'email registrata e il tuo codice partner per accedere all'area riservata.",
    emailLabel: "Email partner",
    emailPlaceholder: "nome@azienda.it",
    partnerCodeLabel: "Codice partner",
    partnerCodePlaceholder: "VG-ROMA-001",
    loginCta: "Accedi all’area partner",
    invalidCredentials: "Credenziali non valide o server non raggiungibile",
    footerLeft: "VoiceGuide AirLink Partner",
    poweredBy: "Powered by",
  },

  dashboard: {
    // Sidebar
    title: "Dashboard partner",
    summary: "Riepilogo",
    orders: "Ordini",
    payouts: "Pagamenti",

    // Header page
    breadcrumb: "PARTNER • VOICEGUIDE AIRLINK",
    subtitle: "Commissioni maturate, pagamenti ricevuti e saldo residuo.",
    viewOrders: "Vedi ordini",
    loading: "Caricamento dati…",

    // Cards
    partnerData: "Dati partner",
    active: "ATTIVO",
    name: "Nome",
    email: "Email",
    partnerCode: "Codice partner",
    affiliateLink: "Link affiliato",
    copyAffiliate: "Copia link affiliato",
    affiliateNotReady: "Link affiliato non disponibile.",

    partnershipStatus: "Stato partnership",
    partnerLevel: "Livello partner",
    levelUnavailable: "Non disponibile",

    partnerTypeLine: "Tipo: {type} — Commissione: {pct}% su ogni ordine valido.",

    residualBalance: "Saldo residuo",
    balanceHint: "Commissioni maturate meno pagamenti già ricevuti.",

    receivedPayments: "Pagamenti ricevuti",
    paidHint:
      "Totale pagamenti reali registrati dalla piattaforma (bonifici / saldi).",

    // Copy messages
    copyOk: "Link copiato negli appunti ✅",
    copyFail: "Impossibile copiare il link. Riprova.",

    // Stats
    totalCommissions: "Commissioni totali maturate",
    totalCommissionsHint: "Somma delle commissioni generate con i tuoi ordini.",
    totalOrders: "Ordini totali generati",
    totalOrdersHint:
      "Numero di ordini effettuati tramite il tuo codice partner.",
    soldLicenses: "Licenze vendute",
    soldLicensesHint: "Numero totale licenze collegate ai tuoi ordini.",

    // CTA
    goToOrders: "Vai agli ordini e commissioni →",
  },

  orders: {
    breadcrumb: "PARTNER • VOICEGUIDE AIRLINK",
    title: "Ordini generati",
    subtitle:
      "Elenco ordini associati al tuo codice partner, con importo e commissione maturata.",

    loading: "Caricamento ordini…",
    loadError: "Errore nel caricamento degli ordini partner.",

    empty:
      "Ancora nessun ordine registrato con il tuo codice partner.\nCondividi il tuo link affiliato per iniziare a generare commissioni.",

    defaultProduct: "Licenza / pacchetto VoiceGuide AirLink",
    discountApplied: "-5% applicato",

    stats: {
      count: "Ordini",
      volume: "Volume ordini",
      totalCommission: "Commissioni totali",
      pendingCommission: "Commissioni in attesa",
      paidCommission: "Commissioni pagate",
    },

    table: {
      date: "Data",
      product: "Prodotto",
      subtotal: "Subtotale",
      discount: "Sconto",
      total: "Totale",
      commission: "Commissione",
      status: "Stato",
    },

    status: {
      paid: "Commissione pagata",
      pendingPayout: "Commissione in attesa",
      paymentPending: "Pagamento in corso",
      paymentFailed: "Pagamento fallito",
      refunded: "Rimborsato",
      unknown: "Sconosciuto",
    },
  },
};
