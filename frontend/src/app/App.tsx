import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, CreditCard, BarChart3, Settings, LogOut, Plus,
  X, Check, ChevronLeft,
  Bell, TrendingUp, TrendingDown, Target,
  Car, Tv, ShoppingCart, Zap, Heart, BookOpen,
  Eye, EyeOff, AlertCircle, Coffee, Home,
  ArrowUpRight, ArrowDownRight, Loader2, Moon, Sun, Menu,
  Sparkles, Lightbulb, Wallet, PiggyBank, Activity, Star,
  Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

// ─── Import Real Backend Services ───────────────────────────────────────────
import { useAuth } from "../contexts/AuthContext";
import { expenseService } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "login" | "register" | "dashboard" | "expenses" | "add-expense" | "reports" | "settings";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Food & Dining", icon: Coffee, color: "#FDCB6E" },
  { name: "Transport", icon: Car, color: "#00D4FF" },
  { name: "Entertainment", icon: Tv, color: "#6C5CE7" },
  { name: "Shopping", icon: ShoppingCart, color: "#FF6B6B" },
  { name: "Bills & Utilities", icon: Zap, color: "#00B894" },
  { name: "Health", icon: Heart, color: "#E17055" },
  { name: "Education", icon: BookOpen, color: "#74B9FF" },
  { name: "Other", icon: Star, color: "#A29BFE" },
];

function getCategoryMeta(name: string) {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[7];
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Toast System ────────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-toast-in"
          style={{
            background: t.type === "success" ? "#00B894" : t.type === "error" ? "#FF6B6B" : "#6C5CE7",
            color: "#fff",
            minWidth: 260,
            backdropFilter: "blur(8px)",
          }}
        >
          {t.type === "success" && <Check size={11} />}
          {t.type === "error" && <AlertCircle size={11} />}
          {t.type === "info" && <Sparkles size={11} />}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, mobile, closeMobile }: any) {
  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "expenses" as Page, label: "Expenses", icon: CreditCard },
    { id: "reports" as Page, label: "Reports", icon: BarChart3 },
    { id: "settings" as Page, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)", width: 240, minWidth: 240 }}>
      <div className="flex items-center gap-3 px-6 py-6">
        {mobile && <button onClick={closeMobile} className="text-white/60 hover:text-white mr-1"><X size={18} /></button>}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #00D4FF, #6C5CE7)" }}>
          <Wallet size={18} color="#fff" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Finly</span>
      </div>
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => { setPage(id); closeMobile?.(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                active ? "text-white" : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
              style={active ? { background: "rgba(108,92,231,0.25)", boxShadow: "inset 0 0 0 1px rgba(108,92,231,0.4)" } : {}}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: "#a29bfe" }} />}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? "" : "group-hover:bg-white/5"}`}
                style={active ? { background: "linear-gradient(135deg, #6C5CE7, #a29bfe)", boxShadow: "0 4px 12px rgba(108,92,231,0.4)" } : {}}>
                <Icon size={16} color={active ? "#fff" : undefined} />
              </div>
              {label}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <button onClick={() => { setPage("add-expense"); closeMobile?.(); }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[#1A1A2E] transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg"
          style={{ background: "linear-gradient(135deg, #00D4FF, #00b8d9)", boxShadow: "0 6px 20px rgba(0,212,255,0.35)" }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>
      <div className="px-4 pb-6 border-t border-white/8 pt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)" }}>
          AJ
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">Alex Johnson</p>
          <p className="text-white/35 text-xs truncate">alex@finly.app</p>
        </div>
        <button className="text-white/35 hover:text-white/70 transition-colors flex-shrink-0" onClick={() => setPage("login")}>
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────
function AppShell({ children, page, setPage, addToast, dark, toggleDark }: {
  children: React.ReactNode;
  page: Page;
  setPage: (p: Page) => void;
  addToast: (m: string, t?: Toast["type"]) => void;
  dark: boolean;
  toggleDark: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPage, setPrevPage] = useState(page);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (page !== prevPage) {
      setTransitioning(true);
      const t = setTimeout(() => { setPrevPage(page); setTransitioning(false); }, 180);
      return () => clearTimeout(t);
    }
  }, [page, prevPage]);

  const pageTitles: Record<Page, string> = {
    login: "", register: "",
    dashboard: "Dashboard", expenses: "Expenses",
    "add-expense": "Add Expense", reports: "Reports", settings: "Settings",
  };

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "dark" : ""}`} style={{ background: dark ? "#0d0d1a" : "#F5F7FA" }}>
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar page={page} setPage={setPage} />
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-right">
            <Sidebar page={page} setPage={setPage} mobile closeMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center gap-4 px-6 py-4 flex-shrink-0 border-b"
          style={{
            background: dark ? "rgba(22,22,46,0.95)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(26,26,46,0.08)",
          }}
        >
          <button className="lg:hidden" style={{ color: dark ? "#9CA3AF" : "#6B7280" }} onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden sm:block">
            <p className="font-bold text-sm" style={{ color: dark ? "#fff" : "#1A1A2E" }}>{pageTitles[page]}</p>
          </div>
          <div className="flex-1" />
          <button onClick={toggleDark} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : "#F0F1F5", color: dark ? "#A29BFE" : "#6B7280" }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => addToast("Notifications coming soon", "info")}
            className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all hover:scale-105"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : "#F0F1F5", color: dark ? "#9CA3AF" : "#6B7280" }}>
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ background: "#FF6B6B" }} />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white cursor-pointer hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)" }}>
            AJ
          </div>
        </header>
        <main className="flex-1 overflow-y-auto transition-opacity duration-180" style={{ opacity: transitioning ? 0 : 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── useCountUp Hook ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target * 100) / 100);
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return value;
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ label, value, numericValue, sub, icon: Icon, color, trend, up, sparkData }: any) {
  const [hovered, setHovered] = useState(false);
  const counted = useCountUp(numericValue, 1000, true);
  const displayValue = value.includes("$") ? formatCurrency(counted) : String(Math.round(counted));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl p-5 border border-border transition-all duration-300 cursor-default relative overflow-hidden"
      style={{ boxShadow: hovered ? "0 12px 40px rgba(108,92,231,0.12)" : "0 1px 4px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-2px)" : "none" }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-8 translate-x-8 transition-opacity"
        style={{ background: color, opacity: hovered ? 0.12 : 0.05 }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform" style={{ background: `${color}18`, transform: hovered ? "scale(1.08)" : "scale(1)" }}>
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
            {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[#1A1A2E] font-bold text-2xl mb-1 font-mono tabular-nums">{displayValue}</p>
      <p className="text-[#9CA3AF] text-xs">{sub}</p>
      {sparkData && (
        <div className="absolute bottom-3 right-3 opacity-30">
          <ResponsiveContainer width={60} height={24}>
            <AreaChart data={sparkData.map((v: number, i: number) => ({ i, v }))}>
              <defs><linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── BudgetProgress ──────────────────────────────────────────────────────────
function BudgetProgress({ label, spent, total, color }: any) {
  const [animated, setAnimated] = useState(false);
  const pct = Math.min((spent / total) * 100, 100);
  const overBudget = spent > total;
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-[#1A1A2E]">{label}</span>
        <span className={`text-xs font-semibold ${overBudget ? "text-[#FF6B6B]" : "text-[#6B7280]"}`}>
          {formatCurrency(spent)} / {formatCurrency(total)}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: overBudget ? "#FEE2E2" : "#F3F4F6" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: animated ? `${Math.min(pct, 100)}%` : "0%", background: overBudget ? "linear-gradient(90deg, #FF6B6B, #ff9b9b)" : color }}
        />
      </div>
      {overBudget && <p className="text-[10px] text-[#FF6B6B] font-medium mt-0.5">Over budget by {formatCurrency(spent - total)}</p>}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ setPage, addToast, onLogin }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
      addToast("Welcome back!", "success");
      setPage("dashboard");
    } catch (err) {
      addToast("Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const glassInput = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 outline-none transition-all";
  const glassInputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1A1A2E 50%, #0f2444 100%)" }}>
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[120px] pointer-events-none" style={{ background: "#6C5CE7", top: "10%", left: "5%" }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.10] blur-[100px] pointer-events-none" style={{ background: "#00D4FF", bottom: "10%", right: "5%" }} />
      <div className="relative w-full max-w-[420px] animate-fade-up">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #00D4FF, #6C5CE7)" }}>
            <Wallet size={26} color="#fff" />
          </div>
          <span className="text-white font-bold text-3xl tracking-tight">Finly</span>
        </div>
        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
          <h1 className="text-white font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-7">Sign in to manage your finances</p>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="text-white/60 text-xs font-semibold mb-2 block uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@finly.app"
                className={glassInput} style={glassInputStyle} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs font-semibold transition-colors hover:opacity-80" style={{ color: "#00D4FF" }}>Forgot?</button>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className={`${glassInput} pr-11`} style={glassInputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] mt-1"
              style={{ background: "linear-gradient(135deg, #6C5CE7, #8B7CF8)", boxShadow: "0 8px 32px rgba(108,92,231,0.5)" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-white/35 text-sm mt-6">
            No account?{" "}
            <button onClick={() => setPage("register")} className="font-bold hover:underline" style={{ color: "#00D4FF" }}>Create one free</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
function RegisterPage({ setPage, addToast, onRegister }: any) {
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const glassInput = "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/30 outline-none transition-all";
  const glassInputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" };

  const strength = form.password.length > 10 ? 3 : form.password.length > 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthColors = ["", "#FF6B6B", "#FDCB6E", "#00B894"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { addToast("Passwords do not match", "error"); return; }
    setLoading(true);
    try {
      await onRegister(form.username, form.password, form.email);
      addToast("Account created!", "success");
      setPage("login");
    } catch (err) {
      addToast("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1A1A2E 50%, #0f2444 100%)" }}>
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.10] blur-[120px] pointer-events-none" style={{ background: "#00D4FF", top: "5%", right: "0%" }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.12] blur-[100px] pointer-events-none" style={{ background: "#6C5CE7", bottom: "5%", left: "0%" }} />
      <div className="relative w-full max-w-[420px] animate-fade-up">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #00D4FF, #6C5CE7)" }}>
            <Wallet size={26} color="#fff" />
          </div>
          <span className="text-white font-bold text-3xl tracking-tight">Finly</span>
        </div>
        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
          <h1 className="text-white font-bold text-2xl mb-1">Create account</h1>
          <p className="text-white/40 text-sm mb-7">Join 50,000+ people tracking smarter</p>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Email", key: "email", type: "email", placeholder: "alex@finly.app" }, { label: "Username", key: "username", type: "text", placeholder: "alexj" }].map(({ label, key, type, placeholder }) => (
                <div key={key} className={key === "email" ? "col-span-2" : ""}>
                  <label className="text-white/60 text-xs font-semibold mb-2 block uppercase tracking-wider">{label}</label>
                  <input type={type} placeholder={placeholder} className={glassInput} style={glassInputStyle}
                    value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            {[{ label: "Password", key: "password", placeholder: "Min. 8 characters" }, { label: "Confirm password", key: "confirm", placeholder: "Repeat password" }].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-white/60 text-xs font-semibold mb-2 block uppercase tracking-wider">{label}</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder={placeholder} className={`${glassInput} pr-11`} style={glassInputStyle}
                    value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {key === "password" && form.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((s) => <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: s <= strength ? strengthColors[strength] : "rgba(255,255,255,0.1)" }} />)}
                    </div>
                    <span className="text-xs font-medium" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] mt-1"
              style={{ background: "linear-gradient(135deg, #6C5CE7, #8B7CF8)", boxShadow: "0 8px 32px rgba(108,92,231,0.5)" }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>
          <p className="text-center text-white/35 text-sm mt-6">
            Already have an account?{" "}
            <button onClick={() => setPage("login")} className="font-bold hover:underline" style={{ color: "#00D4FF" }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ setPage, expenses, dark, user }: any) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const totalSpent = expenses.filter((e: any) => e.type === "debit").reduce((s: number, e: any) => s + e.amount, 0);
  const totalIncome = expenses.filter((e: any) => e.type === "credit").reduce((s: number, e: any) => s + e.amount, 0);
  const savings = totalIncome - totalSpent;

  const cardBg = dark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = dark ? "rgba(255,255,255,0.06)" : "rgba(26,26,46,0.08)";
  const textPrimary = dark ? "#F9FAFB" : "#1A1A2E";
  const textMuted = dark ? "#9CA3AF" : "#6B7280";

  // Real chart data derived from expenses
  const monthlyData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = m.toLocaleDateString("en-US", { month: "short" });
    const monthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.expenseDate || e.date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    });
    const income = monthExpenses.filter((e: any) => e.type === "credit").reduce((s: number, e: any) => s + e.amount, 0);
    const spent = monthExpenses.filter((e: any) => e.type === "debit").reduce((s: number, e: any) => s + e.amount, 0);
    monthlyData.push({ month: monthStr, income, expenses: spent });
  }

  // Category split
  const categoryTotals: Record<string, number> = {};
  expenses.filter((e: any) => e.type === "debit").forEach((e: any) => {
    const cat = e.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
  });
  const totalCat = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const donutData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.round((value / totalCat) * 100),
    color: getCategoryMeta(name).color || "#A29BFE",
  }));
  if (donutData.length === 0) {
    donutData.push({ name: "No Data", value: 100, color: "#A29BFE" });
  }

  // Insights
  const insights = [
    { icon: Lightbulb, color: "#FDCB6E", text: `You have ${expenses.length} transactions.` },
    { icon: TrendingDown, color: "#00B894", text: totalSpent > 0 ? `You spent ${formatCurrency(totalSpent)}.` : "No expenses yet." },
    { icon: Star, color: "#6C5CE7", text: `Total income: ${formatCurrency(totalIncome)}` },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Good morning, {user || "User"} 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: textMuted }}>{today}</p>
        </div>
        <button onClick={() => setPage("add-expense")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#1A1A2E] transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #00D4FF, #00b8d9)", boxShadow: "0 6px 20px rgba(0,212,255,0.3)" }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl p-7"
            style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2d1b69 50%, #0f3460 100%)", boxShadow: "0 20px 60px rgba(26,26,46,0.3)" }}>
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #00D4FF 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6C5CE7 0%, transparent 50%)" }} />
            <svg className="absolute bottom-0 right-0 opacity-5 w-48 h-48" viewBox="0 0 100 100" fill="none">
              <circle cx="80" cy="80" r="80" stroke="white" strokeWidth="0.5" />
              <circle cx="80" cy="80" r="60" stroke="white" strokeWidth="0.5" />
              <circle cx="80" cy="80" r="40" stroke="white" strokeWidth="0.5" />
            </svg>
            <div className="relative">
              <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Net Balance · {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              <p className="text-white font-bold text-5xl mb-1 font-mono">{formatCurrency(savings)}</p>
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,184,148,0.2)", color: "#00B894" }}>
                  <ArrowUpRight size={11} /> {totalIncome ? Math.round((savings/totalIncome)*100) : 0}% savings rate
                </span>
                <span className="text-white/30 text-xs">vs 34% last month</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Income", value: totalIncome, icon: ArrowUpRight, color: "#00B894" },
                  { label: "Expenses", value: totalSpent, icon: ArrowDownRight, color: "#FF6B6B" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} color={color} />
                      <span className="text-white/50 text-xs font-medium">{label}</span>
                    </div>
                    <p className="text-white font-bold text-lg font-mono">{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2d2b55 100%)", boxShadow: "0 8px 32px rgba(108,92,231,0.2)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8" style={{ background: "#6C5CE7" }} />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} color="#a29bfe" />
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Insight</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${insights[0].color}22` }}>
                <Lightbulb size={16} color={insights[0].color} />
              </div>
              <p className="text-white/85 text-sm leading-relaxed">{insights[0].text}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {insights.map((_, i) => (
                <button key={i} className="rounded-full transition-all duration-300"
                  style={{ width: i === 0 ? 16 : 5, height: 5, background: i === 0 ? "#a29bfe" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #00B89422, #00B89411)" }}>
              <PiggyBank size={22} color="#00B894" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: textMuted }}>Monthly Goal</p>
              <p className="font-bold text-xl" style={{ color: textPrimary }}>${savings > 0 ? Math.round(savings) : 0} saved</p>
              <div className="h-1.5 w-32 rounded-full mt-1.5 overflow-hidden" style={{ background: dark ? "rgba(255,255,255,0.1)" : "#F3F4F6" }}>
                <div className="h-full rounded-full w-[46%]" style={{ background: "linear-gradient(90deg, #00B894, #00d4a8)" }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: textMuted }}>46% of $1,080 goal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Income" value={formatCurrency(totalIncome)} numericValue={totalIncome} sub="This month" icon={TrendingUp} color="#00B894" trend="8.2%" up />
        <StatCard label="Total Expenses" value={formatCurrency(totalSpent)} numericValue={totalSpent} sub="This month" icon={TrendingDown} color="#FF6B6B" trend="3.1%" />
        <StatCard label="Net Savings" value={formatCurrency(savings)} numericValue={savings} sub="This month" icon={Target} color="#6C5CE7" trend="12.5%" up />
        <StatCard label="Transactions" value={String(expenses.length)} numericValue={expenses.length} sub="All time" icon={Activity} color="#00D4FF" trend="+5" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold" style={{ color: textPrimary }}>Income vs Expenses</h2>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyData} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.05)" : "#F3F4F6"} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `$${v}`} />
              <Tooltip formatter={(v: any) => v !== undefined ? formatCurrency(v) : ''} contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "10px 14px" }} cursor={{ fill: dark ? "rgba(255,255,255,0.03)" : "rgba(108,92,231,0.04)" }} />
              <Bar dataKey="income" fill="#00B894" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#FF6B6B" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h2 className="font-bold mb-0.5" style={{ color: textPrimary }}>Category Split</h2>
          <p className="text-xs mb-4" style={{ color: textMuted }}>This month</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={44} outerRadius={74} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {donutData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => v !== undefined ? `${v}%` : ''} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mt-1">
            {donutData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] truncate" style={{ color: textMuted }}>{d.name}</span>
                <span className="text-[10px] font-bold ml-auto" style={{ color: textPrimary }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold" style={{ color: textPrimary }}>Recent Transactions</h2>
            <button onClick={() => setPage("expenses")} className="text-xs font-bold hover:underline" style={{ color: "#6C5CE7" }}>View all</button>
          </div>
          <div className="flex flex-col">
            {expenses.slice(0, 6).map((e: any, i: number) => {
              const meta = getCategoryMeta(e.category);
              const Icon = meta.icon;
              return (
                <div key={e.id} className={`flex items-center gap-3 py-3 ${i < 5 ? "border-b" : ""}`} style={{ borderColor: dark ? "rgba(255,255,255,0.04)" : "#F9FAFB" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18` }}>
                    <Icon size={16} color={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{e.description || "No description"}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{e.category} · {formatDate(e.expenseDate || e.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold font-mono ${e.type === "credit" ? "text-emerald-500" : ""}`} style={e.type === "debit" ? { color: textPrimary } : {}}>
                      {e.type === "credit" ? "+" : "-"}{formatCurrency(e.amount)}
                    </span>
                    <div className={`text-[10px] mt-0.5 font-medium ${e.type === "credit" ? "text-emerald-500" : "text-[#FF6B6B]"}`}>
                      {e.type === "credit" ? "Income" : "Expense"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 className="font-bold mb-5" style={{ color: textPrimary }}>Budget Status</h2>
            <div className="flex flex-col gap-4">
              <BudgetProgress label="Food & Dining" spent={109} total={300} color="#FDCB6E" />
              <BudgetProgress label="Transport" spent={88} total={150} color="#00D4FF" />
              <BudgetProgress label="Shopping" spent={499} total={400} color="#FF6B6B" />
              <BudgetProgress label="Entertainment" spent={25} total={100} color="#6C5CE7" />
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 className="font-bold mb-4" style={{ color: textPrimary }}>Upcoming Bills</h2>
            <div className="flex flex-col gap-3">
              {[
                { name: "Rent", amount: 1200, due: "Aug 5", daysLeft: 3, icon: Home, color: "#FF6B6B" },
                { name: "Netflix", amount: 14.99, due: "Aug 8", daysLeft: 6, icon: Tv, color: "#6C5CE7" },
                { name: "Spotify", amount: 9.99, due: "Aug 10", daysLeft: 8, icon: Coffee, color: "#00B894" },
                { name: "Gym", amount: 75, due: "Aug 15", daysLeft: 13, icon: Heart, color: "#E17055" },
              ].map((p) => {
                const Icon = p.icon;
                const urgent = p.daysLeft <= 5;
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}18` }}>
                      <Icon size={15} color={p.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: textPrimary }}>{p.name}</p>
                      <p className="text-[10px] font-medium" style={{ color: urgent ? "#FF6B6B" : textMuted }}>
                        {urgent ? "⚠ " : ""}{p.daysLeft}d left · {p.due}
                      </p>
                    </div>
                    <span className="text-sm font-bold font-mono" style={{ color: textPrimary }}>{formatCurrency(p.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Expenses Page ──────────────────────────────────────────────────────────
function ExpensesPage({ expenses, setExpenses, setPage, setEditId, addToast, dark, onDelete, onUpdate }: any) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const textPrimary = dark ? "#F9FAFB" : "#1A1A2E";
  const textMuted = dark ? "#9CA3AF" : "#6B7280";

  const filtered = expenses.filter((e: any) =>
    (category === "All" || e.category === category) &&
    (e.description?.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>All Expenses</h1>
        <button onClick={() => { setEditId(null); setPage("add-expense"); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)", boxShadow: "0 6px 20px rgba(108,92,231,0.3)" }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl px-4 py-2 border focus:outline-none flex-1 min-w-48"
          style={{ background: dark ? "rgba(255,255,255,0.05)" : "#F5F7FA", borderColor: dark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: textPrimary }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl px-4 py-2 border bg-transparent"
          style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: textPrimary }}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "#F3F4F6"}` }}>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase" style={{ color: textMuted }}>Description</th>
              <th className="text-left px-4 py-4 text-xs font-bold uppercase" style={{ color: textMuted }}>Category</th>
              <th className="text-left px-4 py-4 text-xs font-bold uppercase" style={{ color: textMuted }}>Date</th>
              <th className="text-right px-6 py-4 text-xs font-bold uppercase" style={{ color: textMuted }}>Amount</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center" style={{ color: textMuted }}>No expenses found</td></tr>
            ) : filtered.map((e: any) => (
              <tr key={e.id} className="border-b border-border" style={{ borderColor: dark ? "rgba(255,255,255,0.04)" : "#F3F4F6" }}>
                <td className="px-6 py-3.5" style={{ color: textPrimary }}>{e.description || "—"}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold" style={{ background: `${getCategoryMeta(e.category).color}20`, color: getCategoryMeta(e.category).color }}>
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-3.5" style={{ color: textMuted }}>{formatDate(e.expenseDate || e.date)}</td>
                <td className="px-6 py-3.5 text-right" style={{ color: e.type === "credit" ? "#00B894" : textPrimary }}>
                  {e.type === "credit" ? "+" : "-"}{formatCurrency(e.amount)}
                </td>
                <td className="px-4 py-3.5 flex justify-end gap-2">
                  <button onClick={() => { setEditId(e.id); setPage("add-expense"); }}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200">Edit</button>
                  <button onClick={async () => { if (window.confirm("Delete?")) await onDelete(e.id); }}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Add/Edit Expense Page ──────────────────────────────────────────────────
function AddExpensePage({ expenses, setExpenses, setPage, editId, setEditId, addToast, dark, onAdd, onUpdate }: any) {
  const existing = editId !== null ? expenses.find((e: any) => e.id === editId) : null;
  const [form, setForm] = useState({
    amount: existing?.amount?.toString() ?? "",
    category: existing?.category ?? CATEGORIES[0].name,
    description: existing?.description ?? "",
    expenseDate: existing?.expenseDate ?? new Date().toISOString().split("T")[0],
    type: existing?.type ?? "debit",
  });

  const textPrimary = dark ? "#F9FAFB" : "#1A1A2E";
  const textMuted = dark ? "#9CA3AF" : "#6B7280";
  const inputStyle = { background: dark ? "rgba(255,255,255,0.06)" : "#FAFBFF", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#E5E7EB"}`, color: textPrimary };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) { addToast("Please fill required fields", "error"); return; }
    const data = { amount: parseFloat(form.amount), category: form.category, description: form.description, expenseDate: form.expenseDate };
    try {
      if (existing) {
        await onUpdate(existing.id, data);
        addToast("Expense updated!", "success");
      } else {
        await onAdd(data);
        addToast("Expense added!", "success");
      }
      setEditId(null);
      setPage("expenses");
    } catch (err) {
      addToast("Failed to save", "error");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => { setEditId(null); setPage("expenses"); }}
        className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors hover:opacity-80" style={{ color: "#6C5CE7" }}>
        <ChevronLeft size={16} /> Back to Expenses
      </button>
      <h1 className="text-2xl font-bold mb-6" style={{ color: textPrimary }}>{existing ? "Edit Expense" : "New Expense"}</h1>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: textMuted }}>Transaction Type</label>
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#F5F7FA" }}>
            {(["debit", "credit"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${form.type === t ? "text-white" : ""}`}
                style={form.type === t ? { background: t === "debit" ? "#FF6B6B" : "#00B894", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } : { color: textMuted }}>
                {t === "debit" ? "💸 Expense" : "💰 Income"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: textMuted }}>Amount *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: textMuted }}>$</span>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00" className="w-full pl-9 pr-4 py-4 rounded-xl text-2xl font-bold outline-none transition-all"
              style={{ ...inputStyle, fontFamily: "monospace" }} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-3 block" style={{ color: textMuted }}>Category *</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = form.category === cat.name;
              return (
                <button key={cat.name} type="button" onClick={() => setForm({ ...form, category: cat.name })}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105"
                  style={{ borderColor: active ? cat.color : "transparent", background: active ? `${cat.color}15` : dark ? "rgba(255,255,255,0.04)" : "#F5F7FA" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}22` }}>
                    <Icon size={15} color={cat.color} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight" style={{ color: active ? cat.color : textMuted }}>{cat.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: textMuted }}>Description *</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What was this for?" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-[#9CA3AF]"
              style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: textMuted }}>Date</label>
            <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ ...inputStyle, colorScheme: dark ? "dark" : "light" }} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { setEditId(null); setPage("expenses"); }}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors"
            style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#E5E7EB"}`, color: textMuted, background: "transparent" }}>
            Cancel
          </button>
          <button type="submit" className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)", boxShadow: "0 8px 24px rgba(108,92,231,0.35)" }}>
            {existing ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Reports Page ────────────────────────────────────────────────────────────
function ReportsPage({ expenses, dark, addToast }: any) {
  const textPrimary = dark ? "#F9FAFB" : "#1A1A2E";
  const textMuted = dark ? "#9CA3AF" : "#6B7280";

  const totalSpent = expenses.filter((e: any) => e.type === "debit").reduce((s: number, e: any) => s + e.amount, 0);
  const totalIncome = expenses.filter((e: any) => e.type === "credit").reduce((s: number, e: any) => s + e.amount, 0);
  const savings = totalIncome - totalSpent;

  const catTotals: Record<string, number> = {};
  expenses.filter((e: any) => e.type === "debit").forEach((e: any) => {
    const cat = e.category || "Other";
    catTotals[cat] = (catTotals[cat] || 0) + e.amount;
  });
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Reports</h1>
        <button onClick={() => addToast("CSV downloaded", "success")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)" }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl p-5" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: textMuted }}>Total Income</p>
          <p className="text-2xl font-bold font-mono" style={{ color: "#00B894" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: textMuted }}>Total Expenses</p>
          <p className="text-2xl font-bold font-mono" style={{ color: "#FF6B6B" }}>{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: textMuted }}>Net Savings</p>
          <p className="text-2xl font-bold font-mono" style={{ color: savings >= 0 ? "#00B894" : "#FF6B6B" }}>{formatCurrency(savings)}</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
        <h2 className="font-bold mb-4" style={{ color: textPrimary }}>Spending by Category</h2>
        {sortedCats.length === 0 ? (
          <p style={{ color: textMuted }}>No data yet.</p>
        ) : (
          sortedCats.map(([cat, amount]) => {
            const meta = getCategoryMeta(cat);
            const pct = totalSpent ? Math.round((amount / totalSpent) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "#F3F4F6" }}>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="flex-1 text-sm" style={{ color: textPrimary }}>{cat}</span>
                <span className="text-sm font-bold font-mono" style={{ color: textPrimary }}>{formatCurrency(amount)}</span>
                <span className="text-xs font-medium" style={{ color: textMuted }}>{pct}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ addToast, dark, toggleDark }: any) {
  const [budgets, setBudgets] = useState({ food: 300, transport: 150, shopping: 400, entertainment: 100 });
  const [notifs, setNotifs] = useState({ weekly: true, budget: true, payments: false, tips: true });

  const labels: Record<string, string> = { food: "Food & Dining", transport: "Transport", shopping: "Shopping", entertainment: "Entertainment" };
  const colors: Record<string, string> = { food: "#FDCB6E", transport: "#00D4FF", shopping: "#FF6B6B", entertainment: "#6C5CE7" };

  const Toggle = ({ on, toggle }: any) => (
    <button onClick={toggle} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none"
      style={{ background: on ? "#6C5CE7" : dark ? "rgba(255,255,255,0.12)" : "#D1D5DB" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform"
        style={{ transform: on ? "translateX(21px)" : "translateX(2px)" }} />
    </button>
  );

  const textPrimary = dark ? "#F9FAFB" : "#1A1A2E";
  const textMuted = dark ? "#9CA3AF" : "#6B7280";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: textPrimary }}>Settings</h1>

      <div className="rounded-2xl p-6" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Appearance</h2>
        <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: textPrimary }}>Dark mode</p>
            <p className="text-xs" style={{ color: textMuted }}>Switch between light and dark themes</p>
          </div>
          <Toggle on={dark} toggle={toggleDark} />
        </div>
      </div>

      <div className="rounded-2xl p-6 mt-6" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Budget Limits</h2>
        {Object.entries(budgets).map(([key, val]) => (
          <div key={key} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: textPrimary }}>{labels[key]}</span>
              <span className="font-bold font-mono text-sm" style={{ color: colors[key] }}>${val}/mo</span>
            </div>
            <input type="range" min={0} max={2000} step={25} value={val} onChange={(e) => setBudgets({ ...budgets, [key]: parseInt(e.target.value) })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: colors[key] }} />
          </div>
        ))}
        <button onClick={() => addToast("Budget limits saved", "success")} className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6C5CE7, #a29bfe)" }}>
          Save budgets
        </button>
      </div>

      <div className="rounded-2xl p-6 mt-6" style={{ background: dark ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Notifications</h2>
        {[
          { key: "weekly" as const, label: "Weekly summary", emoji: "📊" },
          { key: "budget" as const, label: "Budget alerts", emoji: "⚠️" },
          { key: "payments" as const, label: "Upcoming bills", emoji: "📅" },
          { key: "tips" as const, label: "Smart tips", emoji: "💡" },
        ].map(({ key, label, emoji }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: textPrimary }}>{emoji} {label}</p>
            </div>
            <Toggle on={notifs[key]} toggle={() => setNotifs({ ...notifs, [key]: !notifs[key] })} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user, login, register, isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>("login");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [dark, setDark] = useState(false);
  const toastId = useRef(0);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const toggleDark = () => setDark((d) => !d);

  const loadExpenses = useCallback(async () => {
    try {
      const res = await expenseService.getAll();
      setExpenses(res.data);
    } catch (err) {
      addToast("Failed to load expenses", "error");
    }
  }, [addToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [isAuthenticated, loadExpenses]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (username: string, password: string, email: string) => {
    await register(username, password, email);
  };

  const handleAddExpense = async (data: any) => {
    await expenseService.create(data);
    await loadExpenses();
  };

  const handleDeleteExpense = async (id: number) => {
    await expenseService.delete(id);
    await loadExpenses();
  };

  const handleUpdateExpense = async (id: number, data: any) => {
    await expenseService.update(id, data);
    await loadExpenses();
  };

  if (!isAuthenticated) {
    if (page === "register") {
      return <RegisterPage setPage={setPage} addToast={addToast} onRegister={handleRegister} />;
    }
    return <LoginPage setPage={setPage} addToast={addToast} onLogin={handleLogin} />;
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      <AppShell page={page} setPage={setPage} addToast={addToast} dark={dark} toggleDark={toggleDark}>
        {page === "dashboard" && <DashboardPage setPage={setPage} expenses={expenses} dark={dark} user={user} />}
        {page === "expenses" && <ExpensesPage expenses={expenses} setExpenses={setExpenses} setPage={setPage} setEditId={setEditId} addToast={addToast} dark={dark} onDelete={handleDeleteExpense} onUpdate={handleUpdateExpense} />}
        {page === "add-expense" && <AddExpensePage expenses={expenses} setExpenses={setExpenses} setPage={setPage} editId={editId} setEditId={setEditId} addToast={addToast} dark={dark} onAdd={handleAddExpense} onUpdate={handleUpdateExpense} />}
        {page === "reports" && <ReportsPage expenses={expenses} dark={dark} addToast={addToast} />}
        {page === "settings" && <SettingsPage addToast={addToast} dark={dark} toggleDark={toggleDark} />}
      </AppShell>
    </>
  );
}