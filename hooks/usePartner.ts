"use client";

import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { 
  getPartnerProfile, 
  createPartnerProfile, 
  initializePartnerStats, 
  seedPlaceholderDocuments,
  updateNotificationReadStatus, 
  updatePartnerProfile, 
  testConnection,
  getRewardConfig,
  isEmailRegisteredInPartners,
  isValidCryptoNetwork,
  isValidWalletAddress,
  PartnerDocument,
  PartnerStatsDocument,
  PartnerCommissionDocument,
  PayoutDocument,
  NotificationDocument
} from "@/lib/db-helpers";
import { onSnapshot, collection, query, where, orderBy, doc } from "firebase/firestore";

export function usePartner() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [partner, setPartner] = useState<PartnerDocument | null>(null);
  const [stats, setStats] = useState<PartnerStatsDocument | null>(null);
  const [commissions, setCommissions] = useState<PartnerCommissionDocument[]>([]);
  const [payouts, setPayouts] = useState<PayoutDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  
  // App States
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingError, setOnboardingError] = useState("");
  const [existingAccountError, setExistingAccountError] = useState("");
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Email/Password Auth States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"google" | "email">("google");
  const [authEmailMode, setAuthEmailMode] = useState<"signin" | "signup">("signin");
  const [authEmailError, setAuthEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Clock
  const [currentTime, setCurrentTime] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "commissions" | "payouts" | "materials" | "notifications" | "settings">("dashboard");

  // Onboarding Wizard Form State
  const [obForm, setObForm] = useState({
    partnerType: "individual" as "individual" | "corporate",
    country: "Nigeria",
    fullName: "",
    companyName: "",
    representativeName: "",
    representativeTitle: "",
    email: "",
    phone: "",
    socialHandle: "",
    payoutMethod: "bank_transfer" as "bank_transfer" | "crypto",
    bankName: "",
    accountName: "",
    accountNumber: "",
    cryptoCurrency: "USDT" as "USDT" | "USDC" | "RLUSD",
    cryptoNetwork: "Polygon",
    walletAddress: "",
    payoutFrequency: "weekly" as "weekly" | "monthly",
    agreementAccepted: false,
    digitalSignature: ""
  });

  // Settings Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: "",
    companyName: "",
    representativeName: "",
    representativeTitle: "",
    email: "",
    phone: "",
    socialHandle: "",
    payoutMethod: "bank_transfer" as "bank_transfer" | "crypto",
    bankName: "",
    accountName: "",
    accountNumber: "",
    cryptoCurrency: "USDT" as "USDT" | "USDC" | "RLUSD",
    cryptoNetwork: "Polygon",
    walletAddress: "",
    payoutFrequency: "weekly" as "weekly" | "monthly"
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Test Database Connection and Start Clock
  useEffect(() => {
    testConnection();
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setExistingAccountError("");
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getPartnerProfile(firebaseUser.uid);
          if (profile) {
            if (profile.partnerId !== firebaseUser.uid) {
              profile.partnerId = firebaseUser.uid;
            }
            setPartner(profile);
            setEditForm({
              fullName: profile.fullName || "",
              companyName: profile.companyName || "",
              representativeName: profile.representativeName || "",
              representativeTitle: profile.representativeTitle || "",
              email: profile.email || "",
              phone: profile.phone || "",
              socialHandle: profile.socialHandle || "",
              payoutMethod: profile.payoutMethod || "bank_transfer",
              bankName: profile.bankName || "",
              accountName: profile.accountName || "",
              accountNumber: profile.accountNumber || "",
              cryptoCurrency: profile.cryptoCurrency || "USDT",
              cryptoNetwork: profile.cryptoNetwork || "Polygon",
              walletAddress: profile.walletAddress || "",
              payoutFrequency: profile.payoutFrequency || "weekly"
            });
          } else {
            const email = firebaseUser.email;
            if (email) {
              const emailExists = await isEmailRegisteredInPartners(email, firebaseUser.uid);
              if (emailExists) {
                setExistingAccountError("An account already exists for this email. Please log in instead.");
                setPartner(null);
                setAuthChecking(false);
                setLoading(false);
                return;
              }
            }
            setObForm(prev => ({
              ...prev,
              fullName: firebaseUser.displayName || "",
              email: firebaseUser.email || ""
            }));
            setPartner(null);
            setExistingAccountError("");
          }
        } catch (error) {
          console.error("Error evaluating profile:", error);
        }
      } else {
        setUser(null);
        setPartner(null);
        setStats(null);
        setCommissions([]);
        setPayouts([]);
        setNotifications([]);
        setExistingAccountError("");
      }
      setAuthChecking(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Firestore Data in Real-time from shared collections
  useEffect(() => {
    if (!user || !partner) return;

    const timer = setTimeout(() => {
      setDbLoading(true);
    }, 0);

    const statsRef = doc(db, "partner_stats", user.uid);
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as PartnerStatsDocument);
      } else {
        setStats(null);
      }
      setDbLoading(false);
    }, (err) => {
      console.error("Stats subscription error:", err);
      setDbLoading(false);
    });

    const commissionsQuery = query(
      collection(db, "partner_commissions"),
      where("partnerId", "==", user.uid)
    );
    const unsubCommissions = onSnapshot(commissionsQuery, (snapshot) => {
      const list: PartnerCommissionDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ commissionId: docSnap.id, ...docSnap.data() } as PartnerCommissionDocument);
      });
      
      // Sort in-memory descending by createdAt to avoid composite index requirements
      list.sort((a, b) => {
        const getVal = (v: any) => {
          if (!v) return 0;
          if (typeof v.seconds === 'number') return v.seconds;
          if (v instanceof Date) return v.getTime();
          if (typeof v === 'string' || typeof v === 'number') return new Date(v).getTime();
          return 0;
        };
        return getVal(b.createdAt) - getVal(a.createdAt);
      });

      setCommissions(list);
    }, (err) => {
      console.error("Commissions subscription error:", err);
    });

    const payoutsQuery = query(
      collection(db, "payouts"),
      where("partnerId", "==", user.uid)
    );
    const unsubPayouts = onSnapshot(payoutsQuery, (snapshot) => {
      const list: PayoutDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ payoutId: docSnap.id, ...docSnap.data() } as PayoutDocument);
      });

      // Sort in-memory descending by paidAt to avoid composite index requirements
      list.sort((a, b) => {
        const getVal = (v: any) => {
          if (!v) return 0;
          if (typeof v.seconds === 'number') return v.seconds;
          if (v instanceof Date) return v.getTime();
          if (typeof v === 'string' || typeof v === 'number') return new Date(v).getTime();
          return 0;
        };
        return getVal(b.paidAt) - getVal(a.paidAt);
      });

      setPayouts(list);
    }, (err) => {
      console.error("Payouts subscription error:", err);
    });

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("partnerId", "==", user.uid)
    );
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const list: NotificationDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ notificationId: docSnap.id, ...docSnap.data() } as NotificationDocument);
      });

      // Sort in-memory descending by createdAt to avoid composite index requirements
      list.sort((a, b) => {
        const getVal = (v: any) => {
          if (!v) return 0;
          if (typeof v.seconds === 'number') return v.seconds;
          if (v instanceof Date) return v.getTime();
          if (typeof v === 'string' || typeof v === 'number') return new Date(v).getTime();
          return 0;
        };
        return getVal(b.createdAt) - getVal(a.createdAt);
      });

      setNotifications(list);

      // Check if any old notifications exist for the user before seeding placeholders
      if (snapshot.empty && partner && partner.referralCode) {
        console.log("No old notifications found. Seeding initial placeholders for real-time demonstration.");
        seedPlaceholderDocuments(user.uid, partner.referralCode).catch((err) => {
          console.error("Auto-seeding placeholder documents failed:", err);
        });
      } else {
        console.log("Old notifications already exist for this user. Skipping placeholder seeding.");
      }
    }, (err) => {
      console.error("Notifications subscription error:", err);
    });

    return () => {
      clearTimeout(timer);
      unsubStats();
      unsubCommissions();
      unsubPayouts();
      unsubNotifications();
    };
  }, [user, partner]);

  // Auth Operations
  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication rejected:", error);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthEmailError("");
    setLoading(true);

    if (!authEmail || !authPassword) {
      setAuthEmailError("Please provide both email and password.");
      setLoading(false);
      return;
    }

    try {
      if (authEmailMode === "signin") {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      let errMsg = "Authentication failed. Please verify your credentials.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        errMsg = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/email-already-in-use") {
        errMsg = "This email is already in use. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errMsg = "Password is too weak. Must be at least 6 characters.";
      } else {
        errMsg = error.message || errMsg;
      }
      setAuthEmailError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout rejected:", error);
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Wizard submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError("");

    if (!user) {
      setOnboardingError("Authentication lost. Please try logging in again.");
      return;
    }

    const { 
      partnerType, fullName, companyName, phone, email, socialHandle,
      payoutMethod, bankName, accountName, accountNumber, cryptoCurrency, cryptoNetwork, walletAddress, payoutFrequency, agreementAccepted, digitalSignature 
    } = obForm;

    if (partnerType === "corporate" && (!companyName || !obForm.representativeName || !obForm.representativeTitle)) {
      setOnboardingError("Please complete all corporate details (Company Name, Representative Details).");
      return;
    }

    if (!fullName || !phone || !email || !socialHandle) {
      setOnboardingError("Please complete all profile fields.");
      return;
    }

    if (payoutMethod === "bank_transfer") {
      if (!bankName || !accountName || !accountNumber) {
        setOnboardingError("Please complete all bank transfer details.");
        return;
      }
    } else {
      if (!cryptoCurrency || !cryptoNetwork || !walletAddress) {
        setOnboardingError("Please complete all cryptocurrency, network, and wallet address fields.");
        return;
      }
      if (!isValidCryptoNetwork(cryptoCurrency, cryptoNetwork)) {
        setOnboardingError(`Invalid network "${cryptoNetwork}" for cryptocurrency "${cryptoCurrency}".`);
        return;
      }
      const walletCheck = isValidWalletAddress(cryptoNetwork, walletAddress);
      if (!walletCheck.valid) {
        setOnboardingError(walletCheck.message || "Invalid wallet address.");
        return;
      }
    }

    if (!agreementAccepted || !digitalSignature) {
      setOnboardingError("You must read and accept the terms of agreement by typing your digital signature.");
      return;
    }

    if (digitalSignature.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      setOnboardingError(`Digital signature must match your full name exactly: "${fullName}"`);
      return;
    }

    setSubmittingOnboarding(true);

    try {
      const emailExists = await isEmailRegisteredInPartners(email);
      if (emailExists) {
        setOnboardingError("An account already exists for this email. Please log in instead.");
        setSubmittingOnboarding(false);
        return;
      }

      const rawBase = (partnerType === "corporate" ? companyName : fullName)
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const namePart = rawBase.slice(0, 6);
      const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const referralCode = `${namePart}${suffix}`;
      const trackingSlug = `/?ref=${referralCode}`;

      const rewardConfig = getRewardConfig(obForm.country, partnerType);
      const rewardRate = rewardConfig.rate;
      const currency = rewardConfig.currency;

      const partnerDisplayId = "DELXp" + Math.floor(1 + Math.random() * 999);

      const payload: Omit<PartnerDocument, 'createdAt' | 'updatedAt' | 'agreementSignedAt'> = {
        partnerId: user.uid,
        partnerDisplayId,
        partnerType,
        status: "active",
        fullName,
        companyName: partnerType === "corporate" ? companyName : null,
        representativeName: partnerType === "corporate" ? obForm.representativeName : null,
        representativeTitle: partnerType === "corporate" ? obForm.representativeTitle : null,
        email,
        phone,
        socialHandle,
        country: obForm.country,
        currency,
        referralCode,
        trackingSlug,
        rewardRate,
        payoutFrequency,
        payoutMethod,
        bankName: payoutMethod === 'bank_transfer' ? bankName : '',
        accountName: payoutMethod === 'bank_transfer' ? accountName : '',
        accountNumber: payoutMethod === 'bank_transfer' ? accountNumber : '',
        cryptoCurrency: payoutMethod === 'crypto' ? cryptoCurrency : undefined,
        cryptoNetwork: payoutMethod === 'crypto' ? cryptoNetwork : undefined,
        walletAddress: payoutMethod === 'crypto' ? walletAddress : undefined,
        agreementAccepted
      };

      await createPartnerProfile(payload);
      await initializePartnerStats(user.uid);
      await seedPlaceholderDocuments(user.uid, referralCode);

      const profile = await getPartnerProfile(user.uid);
      if (profile) {
        setPartner(profile);
        setEditForm({
          fullName: profile.fullName || "",
          companyName: profile.companyName || "",
          representativeName: profile.representativeName || "",
          representativeTitle: profile.representativeTitle || "",
          email: profile.email || "",
          phone: profile.phone || "",
          socialHandle: profile.socialHandle || "",
          payoutMethod: profile.payoutMethod || "bank_transfer",
          bankName: profile.bankName || "",
          accountName: profile.accountName || "",
          accountNumber: profile.accountNumber || "",
          cryptoCurrency: profile.cryptoCurrency || "USDT",
          cryptoNetwork: profile.cryptoNetwork || "Polygon",
          walletAddress: profile.walletAddress || "",
          payoutFrequency: profile.payoutFrequency || "weekly"
        });
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setOnboardingError(err.message || "Database transaction failed. Please verify credentials or contact admin.");
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  // Edit Profile Update Action
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setEditLoading(true);

    if (!user || !partner) {
      setEditError("Missing user instance. Reload recommended.");
      setEditLoading(false);
      return;
    }

    if (editForm.payoutMethod === 'bank_transfer') {
      if (!editForm.bankName || !editForm.accountName || !editForm.accountNumber) {
        setEditError("Please complete all bank transfer details.");
        setEditLoading(false);
        return;
      }
    } else {
      if (!editForm.cryptoCurrency || !editForm.cryptoNetwork || !editForm.walletAddress) {
        setEditError("Please complete all cryptocurrency, network, and wallet address fields.");
        setEditLoading(false);
        return;
      }
      if (!isValidCryptoNetwork(editForm.cryptoCurrency, editForm.cryptoNetwork)) {
        setEditError(`Invalid network "${editForm.cryptoNetwork}" for cryptocurrency "${editForm.cryptoCurrency}".`);
        setEditLoading(false);
        return;
      }
      const walletCheck = isValidWalletAddress(editForm.cryptoNetwork, editForm.walletAddress);
      if (!walletCheck.valid) {
        setEditError(walletCheck.message || "Invalid wallet address.");
        setEditLoading(false);
        return;
      }
    }

    try {
      await updatePartnerProfile(user.uid, {
        fullName: editForm.fullName,
        companyName: partner.partnerType === "corporate" ? editForm.companyName : null,
        representativeName: partner.partnerType === "corporate" ? editForm.representativeName : null,
        representativeTitle: partner.partnerType === "corporate" ? editForm.representativeTitle : null,
        email: editForm.email,
        phone: editForm.phone,
        socialHandle: editForm.socialHandle,
        payoutMethod: editForm.payoutMethod,
        bankName: editForm.payoutMethod === 'bank_transfer' ? editForm.bankName : '',
        accountName: editForm.payoutMethod === 'bank_transfer' ? editForm.accountName : '',
        accountNumber: editForm.payoutMethod === 'bank_transfer' ? editForm.accountNumber : '',
        cryptoCurrency: editForm.payoutMethod === 'crypto' ? editForm.cryptoCurrency : undefined,
        cryptoNetwork: editForm.payoutMethod === 'crypto' ? editForm.cryptoNetwork : undefined,
        walletAddress: editForm.payoutMethod === 'crypto' ? editForm.walletAddress : undefined,
        payoutFrequency: editForm.payoutFrequency
      });

      setEditSuccess("Profile preferences saved successfully.");
      const updatedProfile = await getPartnerProfile(user.uid);
      if (updatedProfile) {
        setPartner(updatedProfile);
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setEditError(err.message || "Failed to update profile. Ensure all inputs meet constraints.");
    } finally {
      setEditLoading(false);
    }
  };

  // Notification Toggle Read Status
  const handleToggleRead = async (notifId: string, currentRead: boolean) => {
    try {
      await updateNotificationReadStatus(notifId, !currentRead);
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: !currentRead } : n));
    } catch (err) {
      console.error("Notification update failed:", err);
    }
  };

  // Copy Referral URL helper
  const handleCopy = () => {
    if (!partner) return;
    const fullUrl = `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currencySymbol = partner ? (partner.currency === 'USD' ? '$' : partner.currency === 'GBP' ? '£' : partner.currency === 'EUR' ? '€' : '₦') : '₦';

  return {
    user,
    partner,
    stats,
    commissions,
    payouts,
    notifications,
    loading,
    authChecking,
    dbLoading,
    onboardingStep,
    onboardingError,
    existingAccountError,
    submittingOnboarding,
    isCopied,
    authEmail,
    authPassword,
    authMethod,
    authEmailMode,
    authEmailError,
    showPassword,
    currentTime,
    activeTab,
    obForm,
    editForm,
    editLoading,
    editError,
    editSuccess,
    currencySymbol,
    setUser,
    setPartner,
    setStats,
    setCommissions,
    setPayouts,
    setNotifications,
    setLoading,
    setAuthChecking,
    setDbLoading,
    setOnboardingStep,
    setOnboardingError,
    setExistingAccountError,
    setSubmittingOnboarding,
    setIsCopied,
    setAuthEmail,
    setAuthPassword,
    setAuthMethod,
    setAuthEmailMode,
    setAuthEmailError,
    setShowPassword,
    setActiveTab,
    setObForm,
    setEditForm,
    setEditLoading,
    setEditError,
    setEditSuccess,
    handleLogin,
    handleEmailAuth,
    handleLogout,
    handleOnboardingSubmit,
    handleProfileUpdate,
    handleToggleRead,
    handleCopy
  };
}
