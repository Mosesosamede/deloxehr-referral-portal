import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  getDocFromServer,
  deleteField
} from "firebase/firestore";
import { db, auth } from "./firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// ------------------ TypeScript Interfaces ------------------

export function getRewardConfig(country: string, partnerType: 'individual' | 'corporate') {
  const normCountry = country ? country.toLowerCase().trim() : 'nigeria';
  if (normCountry === 'united states' || normCountry === 'us' || normCountry === 'usa') {
    return {
      rate: partnerType === 'corporate' ? 2.17 : 1.8,
      currency: 'USD',
      symbol: '$'
    };
  } else if (normCountry === 'united kingdom' || normCountry === 'uk' || normCountry === 'gbp') {
    return {
      rate: partnerType === 'corporate' ? 1.66 : 1.66,
      currency: 'GBP',
      symbol: '£'
    };
  } else if (normCountry === 'europe' || normCountry === 'european union' || normCountry === 'eur') {
    return {
      rate: partnerType === 'corporate' ? 1.91 : 1.91,
      currency: 'EUR',
      symbol: '€'
    };
  } else {
    // Default/Nigeria
    return {
      rate: partnerType === 'corporate' ? 3000 : 1500,
      currency: 'NGN',
      symbol: '₦'
    };
  }
}

export const CRYPTO_NETWORKS: Record<string, string[]> = {
  USDT: ['SOL', 'Polygon', 'Ethereum', 'Arbitrum'],
  USDC: ['SOL', 'Polygon', 'Ethereum', 'Base', 'Arbitrum'],
  RLUSD: ['Ethereum']
};

export function isValidCryptoNetwork(currency: string, network: string): boolean {
  if (!CRYPTO_NETWORKS[currency]) return false;
  return CRYPTO_NETWORKS[currency].includes(network);
}

export function isValidWalletAddress(network: string, address: string): { valid: boolean; message?: string } {
  if (!address || address.trim() === "") {
    return { valid: false, message: "Wallet address cannot be empty." };
  }
  if (/\s/.test(address)) {
    return { valid: false, message: "🚫 Oops! Adding a space anywhere in the address makes it invalid." };
  }

  const evmNetworks = ['Ethereum', 'Polygon', 'Base', 'Arbitrum'];
  if (evmNetworks.includes(network)) {
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmRegex.test(address)) {
      return { valid: false, message: `🚫 Invalid ${network} address format. Must start with '0x' and be exactly 42 characters long.` };
    }
  } else if (network === 'SOL') {
    const solRegex = /^[1-57-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solRegex.test(address)) {
      return { valid: false, message: "🚫 Invalid Solana address format. Must be 32-44 characters (Base58, excluding 0, O, I, l)." };
    }
  }
  return { valid: true };
}

export interface PartnerDocument {
  partnerId: string;           // Maps directly to Firebase Auth UID
  partnerDisplayId: string;    // User-friendly short partner ID, e.g. DELXp8129
  partnerType: 'individual' | 'corporate';
  status: 'active';            // Defaults to 'active' instantly upon creation
  fullName: string;
  companyName: string | null;
  representativeName: string | null;
  representativeTitle: string | null;
  email: string;
  phone: string;
  socialHandle: string;
  country: string;             // Partner's operation country
  currency: string;            // Auto-currency mapping, e.g., NGN, USD, GBP, EUR
  referralCode: string;        // E.g., MOSES91
  trackingSlug: string;        // E.g., /register?ref=MOSES91
  rewardRate: number;          // Individual or Corporate, auto-converted based on country
  payoutFrequency: 'weekly' | 'monthly';
  payoutMethod: 'bank_transfer' | 'crypto';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  cryptoCurrency?: 'USDT' | 'USDC' | 'RLUSD';
  cryptoNetwork?: string;
  walletAddress?: string;
  agreementAccepted: boolean;
  agreementSignedAt: Timestamp | any;
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

export interface PartnerStatsDocument {
  partnerId: string;           // Maps to Firebase Auth UID
  totalClicks: number;        // Default: 0
  totalPurchases: number;     // Default: 0
  totalCommission: number;    // Default: 0
  totalPaid: number;          // Default: 0
  balance: number;            // Default: 0
  nextPayout: Timestamp | any | null;
  updatedAt: Timestamp | any;
}

export interface PartnerCommissionDocument {
  commissionId: string;
  partnerId: string;
  purchaseId: string;
  transactionId: string;
  email: string;              // Purchaser email 
  amountPaid: number;         // Total consumer order value
  commissionAmount: number;   // Cut earned by partner
  payoutStatus: 'pending' | 'processing' | 'paid';
  createdAt: Timestamp | any;
}

export interface PayoutDocument {
  payoutId: string;
  partnerId: string;
  periodStart: Timestamp | any;
  periodEnd: Timestamp | any;
  totalAmount: number;
  paymentReference: string;
  status: 'processing' | 'completed' | 'failed';
  paidAt: Timestamp | any;
}

export interface NotificationDocument {
  notificationId: string;
  partnerId: string;
  title: string;
  message: string;
  read: boolean;               // Default: false
  createdAt: Timestamp | any;
}

export interface ReferralClickDocument {
  clickId: string;
  partnerId: string;
  referralCode: string;
  ip: string;
  device: string;
  browser: string;
  country: string;
  landingPage: string;
  createdAt: Timestamp | any;
}

// ------------------ Database Helper Functions ------------------

/**
 * Check if an email is already used by another partner in Firestore
 */
export async function isEmailRegisteredInPartners(email: string, excludePartnerId?: string): Promise<boolean> {
  const path = "partners";
  try {
    const q = query(collection(db, "partners"), where("email", "==", email.trim()));
    const querySnapshot = await getDocs(q);
    let taken = false;
    querySnapshot.forEach((docSnap) => {
      if (!excludePartnerId || docSnap.id !== excludePartnerId) {
        taken = true;
      }
    });
    return taken;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return false;
  }
}

/**
 * Check if a partner name (fullName) is already linked to another email in Firestore
 */
export async function isNameRegisteredWithAnotherEmail(fullName: string, currentEmail: string): Promise<boolean> {
  const path = "partners";
  try {
    const q = query(collection(db, "partners"), where("fullName", "==", fullName.trim()));
    const querySnapshot = await getDocs(q);
    let invalid = false;
    querySnapshot.forEach((docSnap) => {
      const partnerData = docSnap.data() as PartnerDocument;
      if (partnerData.email && partnerData.email.trim().toLowerCase() !== currentEmail.trim().toLowerCase()) {
        invalid = true;
      }
    });
    return invalid;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return false;
  }
}

/**
 * Fetch partner profile from firestore
 */
export async function getPartnerProfile(partnerId: string): Promise<PartnerDocument | null> {
  const path = `partners/${partnerId}`;
  try {
    const docSnap = await getDoc(doc(db, "partners", partnerId));
    if (docSnap.exists()) {
      return docSnap.data() as PartnerDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Create partner profile inside 'partners' collection
 */
export async function createPartnerProfile(partner: Omit<PartnerDocument, 'createdAt' | 'updatedAt' | 'agreementSignedAt'>): Promise<void> {
  const path = `partners/${partner.partnerId}`;
  const completePartner = {
    ...partner,
    agreementSignedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, "partners", partner.partnerId), completePartner);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Initialize default partner stats document during onboarding
 */
export async function initializePartnerStats(partnerId: string): Promise<void> {
  const path = `partner_stats/${partnerId}`;
  const defaultStats: PartnerStatsDocument = {
    partnerId,
    totalClicks: 0,
    totalPurchases: 0,
    totalCommission: 0,
    totalPaid: 0,
    balance: 0,
    nextPayout: null,
    updatedAt: serverTimestamp() as any,
  };
  try {
    await setDoc(doc(db, "partner_stats", partnerId), defaultStats);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Read-Only partner stats mapping
 */
export async function getPartnerStats(partnerId: string): Promise<PartnerStatsDocument | null> {
  const path = `partner_stats/${partnerId}`;
  try {
    const docSnap = await getDoc(doc(db, "partner_stats", partnerId));
    if (docSnap.exists()) {
      return docSnap.data() as PartnerStatsDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Read-Only commissions mapping
 */
export async function getPartnerCommissions(partnerId: string): Promise<PartnerCommissionDocument[]> {
  const path = "partner_commissions";
  try {
    const q = query(
      collection(db, "partner_commissions"), 
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const list: PartnerCommissionDocument[] = [];
    snapshot.forEach((doc) => {
      list.push({ commissionId: doc.id, ...doc.data() } as PartnerCommissionDocument);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Read-Only payouts ledger mapping
 */
export async function getPayouts(partnerId: string): Promise<PayoutDocument[]> {
  const path = "payouts";
  try {
    const q = query(
      collection(db, "payouts"), 
      where("partnerId", "==", partnerId),
      orderBy("paidAt", "desc")
    );
    const snapshot = await getDocs(q);
    const list: PayoutDocument[] = [];
    snapshot.forEach((doc) => {
      list.push({ payoutId: doc.id, ...doc.data() } as PayoutDocument);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Read notifications
 */
export async function getNotifications(partnerId: string): Promise<NotificationDocument[]> {
  const path = "notifications";
  try {
    const q = query(
      collection(db, "notifications"), 
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const list: NotificationDocument[] = [];
    snapshot.forEach((doc) => {
      list.push({ notificationId: doc.id, ...doc.data() } as NotificationDocument);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Allowed Update: Toggle 'read' flag on notification
 */
export async function updateNotificationReadStatus(notificationId: string, read: boolean): Promise<void> {
  const path = `notifications/${notificationId}`;
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Allowed Update: Edit profile within partners
 */
export async function updatePartnerProfile(
  partnerId: string,
  updates: Partial<Pick<PartnerDocument, 'fullName' | 'companyName' | 'representativeName' | 'representativeTitle' | 'email' | 'phone' | 'socialHandle' | 'payoutMethod' | 'bankName' | 'accountName' | 'accountNumber' | 'cryptoCurrency' | 'cryptoNetwork' | 'walletAddress' | 'payoutFrequency'>>
): Promise<void> {
  const path = `partners/${partnerId}`;
  if (updates.payoutMethod === 'crypto') {
    if (updates.cryptoCurrency && updates.cryptoNetwork) {
      if (!isValidCryptoNetwork(updates.cryptoCurrency, updates.cryptoNetwork)) {
        throw new Error(`Invalid network "${updates.cryptoNetwork}" for cryptocurrency "${updates.cryptoCurrency}"`);
      }
    }
    if (updates.cryptoNetwork && updates.walletAddress !== undefined) {
      const val = isValidWalletAddress(updates.cryptoNetwork, updates.walletAddress);
      if (!val.valid) {
        throw new Error(val.message || "Invalid wallet address.");
      }
    }
  }

  const firestoreUpdates: any = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  if (updates.payoutMethod === 'bank_transfer') {
    firestoreUpdates.bankName = updates.bankName;
    firestoreUpdates.accountName = updates.accountName;
    firestoreUpdates.accountNumber = updates.accountNumber;
    firestoreUpdates.cryptoCurrency = deleteField();
    firestoreUpdates.cryptoNetwork = deleteField();
    firestoreUpdates.walletAddress = deleteField();
  } else if (updates.payoutMethod === 'crypto') {
    firestoreUpdates.cryptoCurrency = updates.cryptoCurrency;
    firestoreUpdates.cryptoNetwork = updates.cryptoNetwork;
    firestoreUpdates.walletAddress = updates.walletAddress;
    firestoreUpdates.bankName = deleteField();
    firestoreUpdates.accountName = deleteField();
    firestoreUpdates.accountNumber = deleteField();
  }

  try {
    await updateDoc(doc(db, "partners", partnerId), firestoreUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Seed one placeholder document in each of the remaining collections:
 * partner_commissions, referral_clicks, payouts, notifications
 */
export async function seedPlaceholderDocuments(partnerId: string, referralCode: string): Promise<void> {
  // 1. partner_commissions
  const commissionId = `comm_placeholder_${partnerId.slice(0, 5)}`;
  const commissionDoc: PartnerCommissionDocument = {
    commissionId,
    partnerId,
    purchaseId: `pur_placeholder_${partnerId.slice(0, 5)}`,
    transactionId: `tx_placeholder_${partnerId.slice(0, 5)}`,
    email: "placeholder.purchaser@example.com",
    amountPaid: 150000,
    commissionAmount: 1500,
    payoutStatus: 'pending',
    createdAt: serverTimestamp() as any
  };

  // 2. payouts
  const payoutId = `pay_placeholder_${partnerId.slice(0, 5)}`;
  const payoutDoc: PayoutDocument = {
    payoutId,
    partnerId,
    periodStart: serverTimestamp() as any,
    periodEnd: serverTimestamp() as any,
    totalAmount: 1500,
    paymentReference: `REF_placeholder_${partnerId.slice(0, 5)}`,
    status: 'processing',
    paidAt: serverTimestamp() as any
  };

  // 3. notifications
  const notificationId = `notif_placeholder_${partnerId.slice(0, 5)}`;
  const notificationDoc: NotificationDocument = {
    notificationId,
    partnerId,
    title: "System Integration",
    message: "Welcome to Deloxe Ecosystem. Your ledger collections are initialized and synchronized.",
    read: false,
    createdAt: serverTimestamp() as any
  };

  const referralClickNotifId = `notif_click_${partnerId.slice(0, 5)}`;
  const referralClickNotifDoc: NotificationDocument = {
    notificationId: referralClickNotifId,
    partnerId,
    title: "New Referral CLick",
    message: "Someone visited your referral link from NG using Chrome on Desktop.",
    read: false,
    createdAt: serverTimestamp() as any
  };

  // 4. referral_clicks
  const clickId = `click_placeholder_${partnerId.slice(0, 5)}`;
  const referralClickDoc: ReferralClickDocument = {
    clickId,
    partnerId,
    referralCode,
    ip: "127.0.0.1",
    device: "Desktop",
    browser: "Chrome",
    country: "Nigeria",
    landingPage: "/register",
    createdAt: serverTimestamp() as any
  };

  try {
    await Promise.all([
      setDoc(doc(db, "partner_commissions", commissionId), commissionDoc),
      setDoc(doc(db, "payouts", payoutId), payoutDoc),
      setDoc(doc(db, "notifications", notificationId), notificationDoc),
      setDoc(doc(db, "notifications", referralClickNotifId), referralClickNotifDoc),
      setDoc(doc(db, "referral_clicks", clickId), referralClickDoc)
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "seeding_placeholders");
  }
}

