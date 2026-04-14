"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { User, Briefcase, Globe, Mail, Phone, MapPin, Save, ArrowLeft, Palette, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard-layout";
import { logActivity } from "@/lib/activity";

export default function EditProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    bio: "",
    email: "",
    phone: "",
    website: "",
    whatsapp: "",
    location: "",
    theme: "#36c1bf",
    cardDesign: "modern",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!id || !auth.currentUser) return;
      try {
        const docRef = doc(db, "profiles", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check: only owner can edit
          if (data.userId !== auth.currentUser.uid) {
            router.push("/dashboard");
            return;
          }
          setFormData({
            name: data.name || "",
            title: data.title || "",
            company: data.company || "",
            bio: data.bio || "",
            email: data.email || "",
            phone: data.phone || "",
            website: data.website || "",
            whatsapp: data.whatsapp || "",
            location: data.location || "",
            theme: data.theme || "#36c1bf",
            cardDesign: data.cardDesign || "modern",
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !id) return;

    setSaving(true);
    try {
      const docRef = doc(db, "profiles", id as string);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      // Log activity
      await logActivity("card_updated", auth.currentUser.uid, formData.name, `Updated ${formData.cardDesign} card`);

      router.push(`/p/${id}`);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-4 border-[#36c1bf] border-t-transparent"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-rose-50 p-6 text-rose-500">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Card Not Found</h3>
          <p className="mt-2 text-slate-500">The card you're trying to edit doesn't exist.</p>
          <Link href="/dashboard" className="mt-6 font-bold text-[#36c1bf] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }}>
              <Link 
                href="/dashboard"
                className="rounded-full p-2 hover:bg-slate-100 transition"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800">Edit Digital Card</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                <User className="h-4 w-4 text-[#36c1bf]" /> Basic Information
              </h3>
              <div className="grid gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Job Title</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Software Engineer"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Company</label>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Tech Corp"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell people a bit about yourself..."
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                <Phone className="h-4 w-4 text-[#36c1bf]" /> Contact Details
              </h3>
              <div className="grid gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp Number</label>
                    <input
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Website</label>
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="New York, NY"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-base outline-none transition focus:border-[#36c1bf] focus:ring-4 focus:ring-[#36c1bf]/10"
                    />
                  </div>
                </div>
              </div>
            </section>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-700">
                <Palette className="h-4 w-4 text-[#36c1bf]" /> Card Style
              </h3>
              
              <div className="space-y-6">
                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                  <label className="text-sm font-medium text-slate-600 block mb-3">Theme Color</label>
                  <div className="flex flex-wrap gap-3">
                    {["#36c1bf", "#4f46e5", "#ec4899", "#f59e0b", "#10b981", "#000000"].map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData(p => ({ ...p, theme: color }))}
                        className={`h-10 w-10 rounded-full border-2 transition ${
                          formData.theme === color ? "border-slate-800 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                  <label className="text-sm font-medium text-slate-600 block mb-4">Physical Card Design</label>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: "modern", name: "Modern Minimal", desc: "Clean, centered layout with soft shadows" },
                      { id: "classic", name: "Professional Bold", desc: "Left-aligned with strong accents" },
                      { id: "creative", name: "Creative Gradient", desc: "Vibrant background with floating elements" }
                    ].map((design) => (
                      <motion.button
                        key={design.id}
                        type="button"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, cardDesign: design.id }))}
                        className={`flex items-center justify-between rounded-2xl p-4 border-2 transition-all ${
                          formData.cardDesign === design.id 
                            ? "border-[#36c1bf] bg-white shadow-md" 
                            : "border-transparent bg-white/50 hover:bg-white"
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-bold text-slate-800">{design.name}</p>
                          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">{design.desc}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          formData.cardDesign === design.id ? "border-[#36c1bf]" : "border-slate-200"
                        }`}>
                          {formData.cardDesign === design.id && <div className="h-2.5 w-2.5 rounded-full bg-[#36c1bf]" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#36c1bf] px-8 py-4 font-bold text-white shadow-lg shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2] disabled:opacity-70"
              >
                {saving ? "Saving Changes..." : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
