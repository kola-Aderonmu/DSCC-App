"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  Users, 
  Shield, 
  User, 
  Trash2, 
  MoreVertical,
  ArrowLeft,
  Mail,
  Calendar,
  Search,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      try {
        const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching users:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const toggleRole = async (user: any) => {
    setIsUpdating(true);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. You might not have permission.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will NOT delete their Firebase Auth account, only their Firestore document.")) return;
    
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="text-2xl font-black tracking-tight text-slate-800">User Management</h2>
            <p className="text-slate-500 font-medium">Manage all registered users and their permissions.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white px-12 py-4 outline-none transition focus:ring-4 focus:ring-[#36c1bf]/10 shadow-sm"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">User</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Joined</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-slate-400 hover:bg-white hover:text-[#36c1bf] rounded-full transition shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-xl mb-6 overflow-hidden">
                    {selectedUser.photoURL ? (
                      <img src={selectedUser.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedUser.fullName}</h3>
                  <p className="text-slate-500 font-medium mb-8">{selectedUser.email}</p>

                  <div className="w-full grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Role</p>
                      <p className="font-bold text-slate-800 capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Joined</p>
                      <p className="font-bold text-slate-800">
                        {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    <button
                      disabled={isUpdating}
                      onClick={() => toggleRole(selectedUser)}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold transition ${
                        selectedUser.role === 'admin' 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600'
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      {selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                    <button
                      onClick={() => deleteUser(selectedUser.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-50 text-rose-500 py-4 font-bold transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete User Data
                    </button>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="w-full py-4 font-bold text-slate-400 hover:text-slate-600 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
