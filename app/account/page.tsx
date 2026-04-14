"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Lock,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardTheme } from "@/context/theme-context";
import DashboardLayout from "@/components/dashboard-layout";

function AccountContent() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme } = useDashboardTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setPreviewImage(userDoc.data().photoURL || null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        setMessage({ text: "Image size must be less than 500KB", type: "error" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    const path = `users/${auth.currentUser.uid}`;
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        fullName: userData?.fullName || auth.currentUser.displayName || "",
        email: auth.currentUser.email,
        whatsapp: userData?.whatsapp || "",
        photoURL: previewImage || auth.currentUser.photoURL || null,
        updatedAt: serverTimestamp(),
        // Ensure role is set if document is being created for the first time
        role: userData?.role || "user",
      }, { merge: true });
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      // Standardized error handling for Firestore
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
        },
        operationType: 'update',
        path
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      
      setMessage({ text: error.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !auth.currentUser.email) return;

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (passwordData.new.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setChangingPassword(true);
    setMessage({ text: "", type: "" });

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordData.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, passwordData.new);
      
      setMessage({ text: "Password updated successfully!", type: "success" });
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      let errorMsg = "Failed to change password";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Current password is incorrect";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg = "Please log out and log back in to change your password";
      }
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#36c1bf]" />
      </div>
    );
  }

  const cardClasses = {
    light: "bg-white border-slate-100 shadow-sm",
    dark: "bg-slate-900 border-slate-800 shadow-xl",
    glass: "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl",
    neo: "bg-[#e0e5ec] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border-transparent",
  }[theme as keyof typeof cardClasses] || "bg-white border-slate-100";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="rounded-full p-2 hover:bg-black/5 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight">Account Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <section className={`rounded-[2.5rem] p-8 border ${cardClasses}`}>
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                  {previewImage ? (
                    <img src={previewImage} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-[#36c1bf] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">Profile Picture</h3>
                <p className="text-xs opacity-50 mt-1 uppercase tracking-widest font-bold">Max size: 500KB</p>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section className={`rounded-[2.5rem] p-8 border ${cardClasses} space-y-6`}>
            <div className="flex items-center gap-2 text-[#36c1bf] mb-2">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold">Personal Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold opacity-60 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="text"
                    value={userData?.fullName || ""}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 opacity-60">
                <label className="text-sm font-bold ml-1">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold opacity-60 ml-1">WhatsApp Number</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="text"
                    value={userData?.whatsapp || ""}
                    onChange={(e) => setUserData({ ...userData, whatsapp: e.target.value })}
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${
                  message.type === "success" 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#36c1bf] px-8 py-5 font-black text-white shadow-xl shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </form>

        {/* Change Password Section */}
        <form onSubmit={handleChangePassword} className="space-y-6 pb-12">
          <section className={`rounded-[2.5rem] p-8 border ${cardClasses} space-y-6`}>
            <div className="flex items-center gap-2 text-[#36c1bf] mb-2">
              <Lock className="h-5 w-5" />
              <h3 className="font-bold">Security</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold opacity-60 ml-1">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold opacity-60 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold opacity-60 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-30" />
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full rounded-2xl border border-black/5 bg-black/5 px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={changingPassword}
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 px-8 py-5 font-black text-white shadow-xl shadow-slate-800/20 transition hover:bg-slate-900 disabled:opacity-50"
          >
            {changingPassword ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Update Password
              </>
            )}
          </motion.button>
        </form>
      </div>
  );
}

export default function AccountPage() {
  return (
    <DashboardLayout>
      <AccountContent />
    </DashboardLayout>
  );
}
