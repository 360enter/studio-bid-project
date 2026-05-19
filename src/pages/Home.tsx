import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Zap, ArrowUpRight, TrendingUp, Shield, CheckCircle } from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";

interface Lot {
  id: string;
  name: string;
  image: string;
  thumbnail?: string;
  year?: string;
  make?: string;
  model?: string;
  currentBid: number;
  expiresAt: string;
  bidCount: number;
}

export function Home() {
  const [isRegModalOpen, setIsRegModalOpen] = React.useState(false);
  const [lots, setLots] = React.useState<any[]>([]);
  const [allocations, setAllocations] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotsRes, allocRes] = await Promise.all([
          fetch("/api/lots"),
          fetch("/api/allocations")
        ]);
        const lotsData = await lotsRes.json();
        const allocData = await allocRes.json();

        setLots(Object.values(lotsData));
        setAllocations(allocData);
      } catch (err) {
        console.error("Failed to fetch node data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero Section - High Density Pattern */}
      <section className="relative h-[65vh] flex items-center border-b border-white/10 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent z-10" />
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 15, ease: "linear" }}
            className="w-full h-full opacity-40 grayscale"
          >
            <img src="https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=2000" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6 md:space-y-10"
          >
            <div className="flex items-center space-x-4 md:space-x-6">
              <span className="w-10 md:w-16 h-[1px] bg-white/20" />
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-white/30">Strategic Liquidity / Apex 2026</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] md:leading-[0.8] uppercase italic">
              Advanced <br />
              <span className="text-white/10">Allocations</span>
            </h1>
            <p className="text-white/40 max-w-sm text-[8px] md:text-[10px] uppercase font-bold tracking-[0.4em] leading-[2.2]">
              Executing institutional acquisitions for sovereign wealth nodes. Entry verified to Sterling Prime protocols.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Signal Status Ticker - High Density Style */}
      <section className="bg-[#080808] border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 w-full lg:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-auto px-4 md:px-0">
              <span className="text-[8px] uppercase tracking-widest font-black text-white/20">Institutional Pulse</span>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-mono uppercase font-bold tracking-tighter">Verified_Link_Active</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-widest font-black text-white/20">Market Node</span>
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-xs font-mono uppercase font-bold tracking-tighter">SIGNAL_STABLE_4ms</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {lots.slice(0, 4).map((l, i) => (
              <div key={l.id} className="flex-shrink-0 w-48 h-20 bg-black border border-white/5 p-4 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono text-white/20 tracking-widest uppercase">Asset_{i+100}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-white/60 truncate max-w-[80px]">{l.name}</span>
                  <span className="text-[11px] font-mono text-emerald-500/80 font-bold">{formatCurrency(l.currentBid)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORICAL ALLOCATIONS (TikTok Style Video Slider) */}
      <section className="bg-[#050505] border-b border-white/10 overflow-hidden relative">
        <div className="px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 bg-[#080808] gap-4 text-center md:text-left">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <h3 className="text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-black text-white/30 italic">Apex Historical Allocations</h3>
          </div>
          <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">SETTLED_LOG</span>
        </div>
        
        <div className="flex animate-scroll whitespace-nowrap py-16 gap-8">
          {allocations.map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-[240px] aspect-[9/16] bg-[#0A0A0A] border border-white/5 relative group overflow-hidden cursor-pointer">
              <img src={item.img} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
              
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-sm border border-white/10 text-[8px] font-black font-mono">10.4k plays</div>
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-sm text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Settled</div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-black opacity-40" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-white/50">{item.user}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold italic uppercase tracking-tighter text-white">{item.model}</span>
                  <span className="text-lg font-mono text-emerald-500 font-bold tracking-tighter">WIN@{item.price}</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 scale-0 group-hover:scale-100 transition-transform duration-500">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                 </div>
              </div>
            </div>
          ))}
          {/* Duplicate loop for seamless scroll */}
          {allocations.map((item, idx) => (
             <div key={`dup-${idx}`} className="flex-shrink-0 w-[240px] aspect-[9/16] bg-[#0A0A0A] border border-white/5 relative opacity-30 grayscale pointer-events-none">
                <img src={item.img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
             </div>
          ))}
        </div>
      </section>

      {/* Live Inventory Grid - High Density Pattern */}
      <section className="px-6 md:px-12 py-16 md:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 border-b border-white/10 pb-12">
            <div className="space-y-3">
               <h2 className="text-[10px] uppercase font-black tracking-[0.6em] text-white/20">Curated Nodes</h2>
               <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none">Secured Inventory</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 border border-white/10 p-1 bg-white/5 relative z-10">
               <button className="px-8 md:px-12 py-3 text-[10px] font-bold uppercase tracking-widest bg-white text-black italic">Live Pulse</button>
               <Link to="/vault" className="px-8 md:px-12 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all italic border-t sm:border-t-0 sm:border-l border-white/5 text-center flex items-center justify-center">Sovereign Vault</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-white/10">
            {lots.map((lot, idx) => (
              <LotCard key={lot.id} lot={lot} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Gatekeeper Section - High Density Pattern */}
      <section className="px-6 md:px-12 py-24 md:py-48 border-t border-white/10 bg-[#0A0A0A] relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.02] font-black text-[30vw] md:text-[20vw] uppercase italic tracking-tighter select-none pointer-events-none">NODE</div>
        
        <div className="max-w-3xl mx-auto space-y-12 md:space-y-16 relative z-10">
           <div className="space-y-6">
              <div className="w-12 md:w-20 h-[1px] bg-white/10 mx-auto" />
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase italic leading-[0.95] md:leading-[0.9]">Request Secure <br /><span className="text-white/10 tracking-tight">Access Ingress</span></h2>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-bold text-white/20 max-w-[280px] md:max-w-sm mx-auto leading-loose">
                Verification required for secondary market participation. All Node Ingress is monitored.
              </p>
           </div>
           <button 
             onClick={() => setIsRegModalOpen(true)}
             className="w-full sm:w-auto px-12 md:px-20 py-6 md:py-8 bg-white text-black text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-neutral-200 transition-all shadow-2xl"
           >
             Initialize Verification
           </button>
        </div>
      </section>

      <RegistrationModal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} />
    </div>
  );
}

function RegistrationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = React.useState<'form' | 'loading' | 'success'>('form');
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [apiError, setApiError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.password) newErrors.password = "Required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Min 6 characters required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep('loading');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setApiError(data.error || "Establish Link Failed");
        setStep('form');
        return;
      }
    } catch (err) {
      console.error(err);
      setApiError("Network Connection Error");
      setStep('form');
      return;
    }

    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-[#050505]/98 backdrop-blur-3xl overflow-y-auto"
    >
      <div className="w-full max-w-xl relative my-auto">
        <button onClick={onClose} className="absolute -top-12 md:-top-16 right-0 text-white/20 hover:text-white uppercase text-[9px] tracking-[0.4em] font-bold transition-colors">[X] EXIT</button>
        
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-[#0A0A0A] border border-white/10 p-8 md:p-16 rounded-sm space-y-12 md:space-y-20"
            >
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic">Secure <br />Verification</h3>
                <div className="h-[1px] w-12 md:w-20 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-8">
                  <Input label="Institutional Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="IDENT_SEQUENCE" error={errors.name} />
                  <Input label="Verified Phone" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="+0_000_000" error={errors.phone} />
                  <Input label="Encrypted Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="CLIENT@VAULT.COM" error={errors.email} />
                  <Input label="Password" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} placeholder="••••••••" isPassword error={errors.password} />
                  <Input label="Reconfirm Password" value={formData.confirmPassword} onChange={(v: string) => setFormData({...formData, confirmPassword: v})} placeholder="••••••••" isPassword error={errors.confirmPassword} />
                </div>
                
                {apiError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] uppercase tracking-widest font-black text-center italic">
                    {apiError}
                  </div>
                )}

                <div className="flex items-start gap-4 py-6 px-8 bg-white/5 border border-white/10">
                  <input type="checkbox" required className="mt-1 w-4 h-4 accent-white bg-transparent border-white/20" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 leading-relaxed">
                    I agree to the formal asset assignment conditions and institutional settlement protocols as defined by Apex Strategic Holdings.
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <button className="w-full py-7 bg-white text-black text-[10px] font-bold uppercase tracking-[0.8em] hover:bg-neutral-200 transition-all">
                    Request Authorization
                  </button>
                  <button type="button" onClick={onClose} className="w-full py-5 border border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] hover:text-white hover:bg-white/5 transition-all">
                    Cancel Sequence
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="text-center p-20 space-y-16"
            >
              <div className="w-40 h-40 relative mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[1px] border-t-white border-white/5 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-6 border-[1px] border-b-white/20 border-transparent rounded-full"
                />
                <div className="absolute inset-16 border-[1px] border-white/5 rounded-full animate-pulse blur-[1px]" />
              </div>
              <div className="space-y-8 flex flex-col items-center">
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold uppercase tracking-[0.6em] italic">Auditing Vault Ingress</h4>
                  <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Sterling Procurement Node is verifying institutional coordinates...</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep('form')}
                  className="mt-6 px-8 py-3 border border-white/10 text-[8px] font-mono uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  [←] Abort & Return to Form
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white text-black p-24 rounded-sm text-center space-y-20 shadow-[0_50px_100px_rgba(255,255,255,0.1)]"
            >
              <div className="w-24 h-24 bg-black flex items-center justify-center rounded-sm rotate-45 mx-auto">
                <CheckCircle className="w-12 h-12 text-white -rotate-45" />
              </div>
              <div className="space-y-8">
                <h3 className="text-6xl font-bold uppercase tracking-tighter italic leading-none">Tunnel <br />Secure</h3>
                <p className="text-[11px] uppercase tracking-[0.5em] font-black opacity-30 leading-loose max-w-sm mx-auto">
                  Verification protocol successfully initiated. An institutional coordinator will transmit your Secure Node Link once credentials are authenticated.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  type="button" 
                  onClick={() => setStep('form')} 
                  className="px-10 py-6 border border-black/10 text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-black/5 transition-all"
                >
                  Return to Form
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-10 py-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-neutral-800 transition-all"
                >
                  Clear Terminal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Input({ label, value, onChange, placeholder, isPassword, error }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] uppercase tracking-[0.4em] font-black text-white/20">{label}</label>
        {error && <span className="text-[8px] text-red-500 uppercase tracking-widest font-black italic">{error}</span>}
      </div>
      <input 
        type={isPassword ? "password" : "text"} 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className={cn(
          "w-full bg-black border p-5 rounded-none text-xs font-mono tracking-[0.2em] placeholder:text-white/5 focus:outline-none transition-all text-white uppercase",
          error ? "border-red-500/50" : "border-white/10 focus:border-white/40"
        )} 
      />
    </div>
  );
}

interface LotCardProps {
  lot: Lot;
  index: number;
  key?: string | number;
}

function LotCard({ lot, index }: LotCardProps) {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(lot.expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lot.expiresAt]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.15 }}
      className="group relative border-r border-b border-white/10 bg-[#080808] overflow-hidden"
    >
      <Link to={`/lot/${lot.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
          <img 
            src={lot.image || lot.thumbnail} 
            alt={lot.name} 
            className="w-full h-full object-cover opacity-30 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />

          {/* Badges - High Density Theme */}
          <div className="absolute top-8 left-8 flex flex-col gap-3">
            <div className="flex items-center gap-4 px-4 py-2 bg-emerald-600 text-[8px] font-black uppercase tracking-[0.3em] text-white">
              Institutional Allocation
            </div>
            <div className="flex items-center gap-4 px-4 py-2 bg-black/90 backdrop-blur-lg border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
              Node #{index + 7209}
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 truncate max-w-[200px]">{lot.name}</span>
                <span className="text-3xl font-bold uppercase tracking-tighter italic leading-none text-white/90">Apex Node</span>
             </div>
             <motion.div 
               whileHover={{ x: 5, y: -5 }}
               className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500"
             >
               <ArrowUpRight className="w-5 h-5 text-white group-hover:text-black transition-colors" />
             </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="p-6 md:p-10 border-r border-white/10 flex flex-col gap-1 transition-colors group-hover:bg-white/[0.02]">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Active Ask</span>
            <span className="text-xl md:text-2xl font-mono font-bold tracking-tighter text-white">{formatCurrency(lot.currentBid)}</span>
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-center items-end transition-colors group-hover:bg-white/[0.02]">
            <div className="flex items-center gap-2 md:gap-3 text-white/20">
              <Timer className="w-3 md:w-4 h-3 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase">{timeLeft}</span>
            </div>
            <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-white/10 mt-3">VERIFIED_PULSE</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
