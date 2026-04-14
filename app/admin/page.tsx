"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, limit, orderBy, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Activity as ActivityIcon,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Download,
  MoreVertical,
  Clock,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface Activity {
  id: string;
  type: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: any;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCards: 0,
    activeToday: 0,
    recentUsers: [] as any[],
    activities: [] as Activity[],
    chartData: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminAndFetchStats() {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      try {
        // Fetch all data for analytics
        const usersSnap = await getDocs(collection(db, "users"));
        const profilesSnap = await getDocs(collection(db, "profiles"));
        const activitiesSnap = await getDocs(query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(20)));
        const recentUsersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)));

        // Process chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
          const usersOnDay = usersSnap.docs.filter(doc => {
            const createdAt = doc.data().createdAt;
            const dateStr = createdAt instanceof Timestamp ? createdAt.toDate().toISOString().split('T')[0] : String(createdAt).split('T')[0];
            return dateStr === date;
          }).length;

          const cardsOnDay = profilesSnap.docs.filter(doc => {
            const createdAt = doc.data().createdAt;
            const dateStr = createdAt instanceof Timestamp ? createdAt.toDate().toISOString().split('T')[0] : String(createdAt).split('T')[0];
            return dateStr === date;
          }).length;

          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            users: usersOnDay,
            cards: cardsOnDay,
          };
        });

        setStats({
          totalUsers: usersSnap.size,
          totalCards: profilesSnap.size,
          activeToday: activitiesSnap.docs.filter(doc => {
            const ts = doc.data().timestamp;
            if (!ts) return false;
            const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
            return date.toDateString() === new Date().toDateString();
          }).length,
          recentUsers: recentUsersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          activities: activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)),
          chartData,
        });
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin check failed:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchStats();
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case 'card_created': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'card_updated': return <ActivityIcon className="h-4 w-4 text-amber-500" />;
      case 'admin_login': return <ShieldAlert className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-[0.2em] mb-1">
              <ShieldAlert className="h-4 w-4" />
              Administrator Console
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              System <span className="text-[#36c1bf]">Intelligence</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Real-time monitoring and advanced data analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue", trend: "+12.5%" },
            { label: "Digital Cards", value: stats.totalCards, icon: CreditCard, color: "purple", trend: "+8.2%" },
            { label: "Daily Activities", value: stats.activeToday, icon: ActivityIcon, color: "emerald", trend: "+24%" },
            { label: "System Health", value: "99.9%", icon: ShieldAlert, color: "amber", trend: "Stable" },
          ].map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-sm transition hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 transition group-hover:scale-110`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
                  item.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {item.trend}
                </span>
              </div>
              <h3 className="text-4xl font-black text-slate-900">{item.value}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{item.label}</p>
              
              {/* Decorative background element */}
              <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-${item.color}-50 opacity-0 transition group-hover:opacity-50`} />
            </motion.div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-[3rem] bg-white p-10 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">Growth Analytics</h3>
                <p className="text-sm font-medium text-slate-500">User and card creation trends over the last 7 days.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#36c1bf]" />
                  <span className="text-xs font-bold text-slate-600">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">Cards</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36c1bf" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#36c1bf" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '15px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#36c1bf" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cards" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorCards)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Live Activity</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {stats.activities.length > 0 ? stats.activities.map((activity, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={activity.id} 
                  className="flex gap-4 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center transition group-hover:bg-white/20">
                      {getActivityIcon(activity.type)}
                    </div>
                    {i !== stats.activities.length - 1 && <div className="w-px flex-1 bg-white/10 my-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-bold text-white/90">
                      <span className="text-[#36c1bf]">{activity.userName}</span>
                      {" "}{activity.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{activity.details}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">
                      {activity.timestamp instanceof Timestamp ? activity.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12 opacity-30">
                  <ActivityIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm font-bold">No activity recorded yet</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 rounded-2xl bg-white/10 py-4 text-xs font-black uppercase tracking-widest transition hover:bg-white/20">
              View Full Audit Log
            </button>
          </motion.div>
        </div>

        {/* Management Table */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[3rem] bg-white border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">User Directory</h3>
                  <p className="text-sm font-medium text-slate-500">Manage and monitor all platform users.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-[#36c1bf]/20"
                    />
                  </div>
                  <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.recentUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 transition">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{user.fullName}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                            user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-500">
                          {user.createdAt instanceof Timestamp ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-600">Active</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 rounded-lg text-slate-300 hover:text-slate-600 transition">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-slate-50/50 text-center">
                <Link href="/admin/users" className="text-sm font-black text-[#36c1bf] hover:underline">
                  View All Users
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[3rem] bg-white p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Review All Cards", icon: CreditCard, href: "/admin/cards", color: "purple" },
                  { label: "System Settings", icon: ShieldAlert, href: "#", color: "amber" },
                  { label: "User Support", icon: Users, href: "#", color: "blue" },
                ].map((action) => (
                  <Link 
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 transition hover:bg-slate-100 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl bg-${action.color}-100 flex items-center justify-center text-${action.color}-600`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-slate-800">{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* System Status Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[3rem] bg-gradient-to-br from-[#36c1bf] to-indigo-600 p-8 text-white shadow-xl shadow-[#36c1bf]/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">System Status</h3>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ActivityIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold opacity-70">Database Latency</span>
                  <span className="text-xs font-black">24ms</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-white rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold opacity-70">Storage Usage</span>
                  <span className="text-xs font-black">12.4 GB / 100 GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[12%] bg-white rounded-full" />
                </div>
              </div>
              <button className="w-full mt-8 rounded-2xl bg-white py-4 text-xs font-black text-[#36c1bf] shadow-lg transition hover:bg-slate-50">
                System Diagnostics
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
