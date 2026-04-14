"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Phone, Globe, MapPin, User, Briefcase, Share2, Download, Sparkles, MessageSquare, CreditCard, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { auth } from "@/lib/firebase";

interface Profile {
  userId: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  location: string;
  theme: string;
  cardDesign: string;
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showVirtualCard, setShowVirtualCard] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const generateVCard = (p: Profile) => {
    const whatsappClean = p.whatsapp ? p.whatsapp.replace(/\D/g, "") : "";
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${p.name}`,
      `N:${p.name.split(" ").reverse().join(";")};;;`,
      `ORG:${p.company}`,
      `TITLE:${p.title}`,
      `TEL;TYPE=CELL,VOICE:${p.phone}`,
      p.whatsapp ? `TEL;TYPE=WORK,VOICE:${p.whatsapp}` : "",
      `EMAIL;TYPE=INTERNET,HOME:${p.email}`,
      p.whatsapp ? `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${whatsappClean}` : "",
      p.whatsapp ? `URL;TYPE=WhatsApp:https://wa.me/${whatsappClean}` : "",
      `URL;TYPE=WORK:${shareUrl}`,
      `item1.URL:${shareUrl}`,
      `item1.X-ABLabel:VIEW VIRTUAL CARD`,
      `NOTE:Digital Smart Card: ${shareUrl}`,
      `ADR:;;${p.location};;;;`,
      "END:VCARD"
    ].filter(Boolean).join("\n");
    return vcard;
  };

  const downloadVCard = () => {
    if (!profile) return;
    const vcardData = generateVCard(profile);
    const blob = new Blob([vcardData], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${profile.name.replace(/\s+/g, "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    setIsMounted(true);
    async function fetchProfile() {
      if (!id) return;
      try {
        const docRef = doc(db, "profiles", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Profile;
          setProfile(data);
          setIsOwner(auth.currentUser?.uid === data.userId);
        } else {
          setError(true);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        
        // Standardized error handling for Firestore
        const errInfo = {
          error: err instanceof Error ? err.message : String(err),
          authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
          },
          operationType: 'get',
          path: `profiles/${id}`
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
        
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();

    // Check for view parameter to show virtual card automatically
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "card") {
      setShowVirtualCard(true);
    }
  }, [id]);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-[#36c1bf] border-t-transparent"
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center"
      >
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-800">Profile Not Found</h1>
          <p className="text-slate-600">The digital card you're looking for doesn't exist or has been removed.</p>
        </div>
      </motion.div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?view=card` : "";
  const vCardData = profile ? generateVCard(profile) : "";

  const renderPhysicalCard = () => {
    if (!profile) return null;

    const designs = {
      modern: (
        <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center bg-white">
          <div className="absolute top-0 left-0 h-2 w-full" style={{ backgroundColor: profile.theme }} />
          <div className="h-16 w-16 rounded-2xl mb-4 flex items-center justify-center bg-slate-50 border border-slate-100">
            <User className="h-8 w-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-black text-slate-800">{profile.name}</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#36c1bf] mt-1">{profile.title}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{profile.company}</p>
          <div className="mt-6 space-y-2 text-[11px] font-bold text-slate-500">
            <p className="flex items-center justify-center gap-2"><Phone className="h-3 w-3" /> {profile.phone}</p>
            <p className="flex items-center justify-center gap-2"><Mail className="h-3 w-3" /> {profile.email}</p>
            <p className="flex items-center justify-center gap-2"><Globe className="h-3 w-3" /> {profile.website}</p>
          </div>
        </div>
      ),
      classic: (
        <div className="relative h-full w-full flex flex-col pt-12 p-8 bg-slate-900 text-white">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10" style={{ backgroundColor: profile.theme }} />
          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-tight leading-tight">{profile.name}</h2>
            <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em] mt-1">{profile.title}</p>
            <div className="h-1 w-12 mt-4" style={{ backgroundColor: profile.theme }} />
          </div>
          <div className="mt-6 space-y-2 text-xs font-medium opacity-80">
            <p className="flex items-center gap-3"><Phone className="h-3.5 w-3.5" /> {profile.phone}</p>
            <p className="flex items-center gap-3"><Mail className="h-3.5 w-3.5" /> {profile.email}</p>
            <p className="flex items-center gap-3"><Briefcase className="h-3.5 w-3.5" /> {profile.company}</p>
          </div>
        </div>
      ),
      creative: (
        <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${profile.theme}, #4f46e5)` }} />
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-30" style={{ backgroundColor: profile.theme }} />
          <div className="z-10 bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-2xl border border-white w-full">
            <h2 className="text-xl font-black text-slate-800">{profile.name}</h2>
            <p className="text-xs font-black text-[#36c1bf] mt-1">{profile.title}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex flex-col items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-300" />
                <span>Call</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-300" />
                <span>Email</span>
              </div>
            </div>
          </div>
        </div>
      )
    };

    return designs[profile.cardDesign as keyof typeof designs] || designs.modern;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 overflow-x-hidden">
      {/* Back Button for Owner */}
      {isOwner && (
        <div className="fixed top-6 left-6 z-50">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-slate-700 shadow-lg border border-white/20 transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-48 w-full origin-top"
        style={{ backgroundColor: profile.theme || "#36c1bf" }}
      />

      <div className="mx-auto -mt-24 max-w-xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Profile Info */}
          <div className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto -mt-20 mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-2 shadow-lg"
            >
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-50">
                <User className="h-16 w-16 text-slate-300" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-slate-800"
            >
              {profile.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-1 text-lg font-medium text-[#36c1bf]"
            >
              {profile.title}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500"
            >
              {profile.company}
            </motion.p>
            
            {profile.bio && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-slate-600 leading-relaxed"
              >
                {profile.bio}
              </motion.p>
            )}

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                onClick={downloadVCard}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#36c1bf] px-6 py-4 font-bold text-white shadow-lg shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2]"
              >
                <Download className="h-5 w-5" />
                Save Contact
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                onClick={() => setShowVirtualCard(true)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-4 font-bold text-white shadow-lg shadow-slate-800/20 transition hover:bg-slate-900"
              >
                <CreditCard className="h-5 w-5" />
                View Virtual Card
              </motion.button>
            </div>
          </div>

          {/* Contact Actions */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 1.0
                }
              }
            }}
            className="grid grid-cols-1 gap-px bg-slate-100 border-y border-slate-100"
          >
            {profile.email && (
              <motion.a 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                href={`mailto:${profile.email}`} 
                className="flex items-center gap-4 bg-white p-5 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Send email</p>
                  <p className="font-medium text-slate-700">{profile.email}</p>
                </div>
              </motion.a>
            )}
            {profile.whatsapp && profile.whatsapp.trim() !== "" && (
              <motion.a 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white p-5 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chat on whatsapp:</p>
                  <p className="font-medium text-slate-700">{profile.whatsapp}</p>
                </div>
              </motion.a>
            )}
            {profile.phone && (
              <motion.a 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                href={`tel:${profile.phone}`} 
                className="flex items-center gap-4 bg-white p-5 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Call</p>
                  <p className="font-medium text-slate-700">{profile.phone}</p>
                </div>
              </motion.a>
            )}
            {profile.website && (
              <motion.a 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 bg-white p-5 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Website</p>
                  <p className="font-medium text-slate-700">{profile.website.replace(/^https?:\/\//, "")}</p>
                </div>
              </motion.a>
            )}
            {profile.location && (
              <motion.div 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                className="flex items-center gap-4 bg-white p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="font-medium text-slate-700">{profile.location}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* QR Code Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="bg-slate-50 p-10 text-center"
          >
            <p className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Scan to Save Contact
            </p>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="mx-auto inline-block rounded-3xl bg-white p-6 shadow-sm"
            >
              <QRCodeSVG 
                value={vCardData} 
                size={200}
                fgColor={profile.theme || "#36c1bf"}
                level="M"
                includeMargin={false}
              />
            </motion.div>
            <div className="mt-8 flex justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${profile.name}'s Digital Card`,
                      url: shareUrl
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <Share2 className="h-4 w-4" />
                Share Card
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-400">
            Powered by <span className="font-bold text-slate-500">DSCC</span> Digital Smart Cards
          </p>
        </motion.div>
      </div>

      {/* Virtual Card Modal */}
      <AnimatePresence>
        {showVirtualCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVirtualCard(false)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            
            {/* Floating Notification inside Modal */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-10 left-1/2 z-[110] -translate-x-1/2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-white">
                <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                You can screen shot for later
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              {/* Close Button at Top Right - Smaller and repositioned */}
              <button
                onClick={() => setShowVirtualCard(false)}
                className="absolute right-4 top-4 z-[110] flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:bg-white border border-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="w-full overflow-hidden h-auto min-h-[300px]">
                {renderPhysicalCard()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
