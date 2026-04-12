"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { Plus, User, ExternalLink, QrCode, MoreVertical, Trash2, Edit, Sparkles, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  name: string;
  title: string;
  company: string;
  theme: string;
  createdAt: any;
}

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "profiles"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profileData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Profile[];
      setProfiles(profileData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profiles:", error);
      
      // Standardized error handling for Firestore
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
        },
        operationType: 'list',
        path: 'profiles'
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "profiles", deletingId));
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
        },
        operationType: 'delete',
        path: `profiles/${deletingId}`
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      alert("Failed to delete card. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-[#36c1bf] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Your Digital Cards <Sparkles className="h-5 w-5 text-amber-400" />
          </h2>
          <p className="text-slate-500 italic">Manage and share your smart contact profiles.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/profiles/new"
            className="flex items-center gap-2 rounded-full bg-[#36c1bf] px-2 py-1 font-meduim text-white shadow-lg shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2]"
          >
            <Plus className="h-3 w-3" />
            Create New Card
          </Link>
        </motion.div>
      </motion.div>

      {profiles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center"
        >
          <div className="mb-4 rounded-full bg-slate-50 p-6">
            <User className="h-12 w-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No cards yet</h3>
          <p className="mb-8 max-w-xs text-slate-500">
            Create your first digital card to start sharing your professional info instantly.
          </p>
          <Link
            href="/profiles/new"
            className="font-semibold text-[#36c1bf] hover:underline"
          >
            Get started now &rarr;
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div 
                className="absolute top-0 left-0 h-2 w-full"
                style={{ backgroundColor: profile.theme || "#36c1bf" }}
              />
              
              <div className="mb-4 flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href={`/p/${profile.id}`}
                      target="_blank"
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-[#36c1bf] transition"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <button
                      onClick={() => setDeletingId(profile.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">{profile.name}</h3>
                <p className="text-sm text-slate-500">{profile.title}</p>
                <p className="text-xs font-medium text-slate-400">{profile.company}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <QrCode className="h-4 w-4" />
                  Scan to share
                </div>
                <Link
                  href={`/p/${profile.id}`}
                  className="text-sm font-bold text-[#36c1bf] hover:underline"
                >
                  View Card
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeletingId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 rounded-3xl bg-rose-50 p-4 text-rose-500">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-black text-slate-800">Delete this card?</h3>
                <p className="mb-8 text-slate-500">
                  This action cannot be undone. All information associated with this digital card will be permanently removed.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    disabled={isDeleting}
                    onClick={() => setDeletingId(null)}
                    className="flex-1 rounded-2xl border border-slate-100 py-4 font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="flex-1 rounded-2xl bg-rose-500 py-4 font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      />
                    ) : (
                      "Delete Card"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


