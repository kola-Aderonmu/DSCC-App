"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  CreditCard, 
  Trash2, 
  ExternalLink,
  ArrowLeft,
  Search,
  User,
  Calendar,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchCards() {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      try {
        const cardsSnap = await getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc")));
        setCards(cardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching cards:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [router]);

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    
    try {
      await deleteDoc(doc(db, "profiles", cardId));
      setCards(cards.filter(c => c.id !== cardId));
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Failed to delete card.");
    }
  };

  const filteredCards = cards.filter(card => 
    card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-4 border-[#36c1bf] border-t-transparent"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="rounded-full p-2 hover:bg-black/5 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">Card Management</h2>
            <p className="text-slate-500 font-medium">Review and manage all digital cards created by users.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search cards by name, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10 shadow-sm"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <div 
                className="absolute top-0 left-0 h-2 w-full"
                style={{ backgroundColor: card.theme || "#36c1bf" }}
              />
              
              <div className="mb-6 flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <User className="h-7 w-7" />
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/p/${card.id}`}
                    target="_blank"
                    className="rounded-full p-2.5 text-slate-400 hover:bg-slate-50 hover:text-[#36c1bf] transition border border-transparent hover:border-slate-100"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="rounded-full p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition border border-transparent hover:border-rose-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">{card.name}</h3>
                <p className="text-sm font-bold text-slate-500">{card.title}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.company}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <Calendar className="h-3 w-3" />
                  {card.createdAt?.toDate ? card.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </div>
                <Link
                  href={`/p/${card.id}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs font-black text-[#36c1bf] hover:underline"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-50 p-6">
              <CreditCard className="h-12 w-12 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No cards found</h3>
            <p className="text-slate-500">Try adjusting your search term.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
