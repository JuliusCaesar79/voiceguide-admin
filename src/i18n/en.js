// src/i18n/en.js
export default {
  common: {
    appName: "VoiceGuide Partner",
    language: "Language",
    italian: "Italian",
    english: "English",
    loading: "Loading…",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    logout: "Log out",
  },

  errors: {
    partnerTokenMissing: "Missing partner token. Please log in again.",
    partnerDataLoad: "Unable to load partner data. Please try again.",
  },

  auth: {
    title: "Partner Login",
    email: "Email",
    referralCode: "Partner Code",
    login: "Log in",
    loggingIn: "Logging in…",

    // Login page (new keys)
    portalSubtitle: "AirLink Partner Portal",
    subtitle:
      "Enter your registered email and your partner code to access the partner area.",
    emailLabel: "Partner email",
    emailPlaceholder: "name@company.com",
    partnerCodeLabel: "Partner code",
    partnerCodePlaceholder: "VG-ROME-001",
    loginCta: "Access partner area",
    invalidCredentials: "Invalid credentials or server unreachable",
    footerLeft: "VoiceGuide AirLink Partner",
    poweredBy: "Powered by",
  },

  dashboard: {
    // Sidebar
    title: "Partner Dashboard",
    summary: "Summary",
    orders: "Orders",
    payouts: "Payouts",

    // Header page
    breadcrumb: "PARTNER • VOICEGUIDE AIRLINK",
    subtitle: "Earned commissions, received payouts, and remaining balance.",
    viewOrders: "View orders",
    loading: "Loading data…",

    // Cards
    partnerData: "Partner details",
    active: "ACTIVE",
    name: "Name",
    email: "Email",
    partnerCode: "Partner code",
    affiliateLink: "Affiliate link",
    copyAffiliate: "Copy affiliate link",
    affiliateNotReady: "Affiliate link not available.",

    partnershipStatus: "Partnership status",
    partnerLevel: "Partner tier",
    levelUnavailable: "Not available",

    partnerTypeLine:
      "Type: {type} — Commission: {pct}% on each valid order.",

    residualBalance: "Remaining balance",
    balanceHint: "Earned commissions minus already received payouts.",

    receivedPayments: "Received payouts",
    paidHint:
      "Total real payouts registered by the platform (bank transfers / credits).",

    // Copy messages
    copyOk: "Link copied to clipboard ✅",
    copyFail: "Unable to copy the link. Please try again.",

    // Stats
    totalCommissions: "Total earned commissions",
    totalCommissionsHint:
      "Sum of commissions generated from your orders.",
    totalOrders: "Total generated orders",
    totalOrdersHint:
      "Number of orders placed using your partner code.",
    soldLicenses: "Licenses sold",
    soldLicensesHint:
      "Total number of licenses linked to your orders.",

    // CTA
    goToOrders: "Go to orders & commissions →",
  },

  orders: {
    breadcrumb: "PARTNER • VOICEGUIDE AIRLINK",
    title: "Generated orders",
    subtitle:
      "List of orders associated with your partner code, including amount and earned commission.",

    loading: "Loading orders…",
    loadError: "Error while loading partner orders.",

    empty:
      "No orders have been registered with your partner code yet.\nShare your affiliate link to start earning commissions.",

    defaultProduct: "VoiceGuide AirLink license / package",
    discountApplied: "-5% applied",

    stats: {
      count: "Orders",
      volume: "Order volume",
      totalCommission: "Total commissions",
      pendingCommission: "Pending commissions",
      paidCommission: "Paid commissions",
    },

    table: {
      date: "Date",
      product: "Product",
      subtotal: "Subtotal",
      discount: "Discount",
      total: "Total",
      commission: "Commission",
      status: "Status",
    },

    status: {
      paid: "Commission paid",
      pendingPayout: "Commission pending",
      paymentPending: "Payment in progress",
      paymentFailed: "Payment failed",
      refunded: "Refunded",
      unknown: "Unknown",
    },
  },
};
