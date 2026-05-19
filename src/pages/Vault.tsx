import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, Eye, Key, Terminal, ArrowUpRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Vault() {
  const [accessPulse, setAccessPulse] = React.useState(false);
  const [nodeId, setNodeId] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [authPin, setAuthPin] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('apex_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.status === 'Approved') {
          setAccessPulse(true);
        }
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
  }, []);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nodeId.trim() || !signature.trim() || !authPin.trim()) {
      setError("ALL PROTOCOLS MUST BE FULLY COMPLETED");
      setLoading(false);
      return;
    }

    if (authPin.length < 4) {
      setError("AUTHORIZATION PIN MUST BE MINIMUM 4 DIGITS");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nodeId, password: signature })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("apex_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
        setAccessPulse(true);
      } else {
        setError(data.error || "VAULT REJECTED GATE INGRESS CREDENTIALS");
      }
    } catch (err) {
      setError("SECURE TRANSMISSION FAULT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-24">
        
        {/* Entrance Gate */}
        {!accessPulse ? (
          <div className="max-w-xl mx-auto space-y-8 md:space-y-12 py-16 md:py-24 animate-fade-in">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-white/5 border border-white/10 flex items-center justify-center mx-auto rounded-full group-hover:border-white transition-all">
                 <Lock className="w-6 md:w-8 h-6 md:h-8 text-white/20" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter italic leading-none">Vault Access <br />Restricted</h2>
                <p className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/30 font-black leading-loose">
                   Sovereign node verification required. Enter critical sequence credentials to authenticate connection.
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthentication} className="space-y-8 bg-[#0A0A0A] border border-white/10 p-8 md:p-12 shadow-2xl">
               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Encrypted Node ID</label>
                    <input 
                      type="email" 
                      value={nodeId}
                      onChange={e => setNodeId(e.target.value)}
                      placeholder="CLIENT@VAULT.COM"
                      required
                      className="w-full bg-black border border-white/10 p-5 text-xs font-mono uppercase tracking-widest text-white outline-none focus:border-white/40 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Authentication Signature</label>
                    <input 
                      type="password" 
                      value={signature}
                      onChange={e => setSignature(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black border border-white/10 p-5 text-xs font-mono tracking-widest text-white outline-none focus:border-white/40 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[0.4em] font-black text-white/20 ml-2">Authorization Pin</label>
                    <input 
                      type="password" 
                      value={authPin}
                      onChange={e => setAuthPin(e.target.value)}
                      placeholder="••••"
                      maxLength={6}
                      required
                      className="w-full bg-black border border-white/10 p-5 text-xs font-mono tracking-widest text-white outline-none focus:border-white/40 transition-all text-center"
                    />
                 </div>
               </div>

               {error && (
                 <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] uppercase tracking-widest font-black text-center italic">
                   {error}
                 </div>
               )}

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full py-6 bg-white text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] md:tracking-[0.8em] hover:bg-neutral-200 transition-all disabled:opacity-50"
               >
                 {loading ? "ESTABLISHING SIGNAL..." : "Verify Credentials"}
               </button>
            </form>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-16 md:space-y-24"
          >
            {/* Vault Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-white/10 pb-8 md:pb-12 gap-8 md:gap-12">
               <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                     <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-emerald-500 italic">Secure_Pulse_Online: Node_4812</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter italic leading-none">The Vault</h1>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/30 font-black leading-loose max-w-sm md:max-w-lg">
                     Private institutional acquisitions, procurement documents, and secure settlement channels.
                  </p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-[#0A0A0A] border border-white/10 p-1 w-full md:w-auto">
                  <div className="p-6 md:p-8 border border-white/5 space-y-1 md:space-y-2">
                     <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-white/10 block">Node_Equity</span>
                     <span className="text-2xl md:text-3xl font-mono font-bold tracking-tighter">$14.8M</span>
                  </div>
                  <div className="p-6 md:p-8 border border-white/5 space-y-1 md:space-y-2">
                     <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-white/10 block">Active_Nodes</span>
                     <span className="text-2xl md:text-3xl font-mono font-bold tracking-tighter uppercase">4 LIVE</span>
                  </div>
               </div>
            </div>

            {/* Vault Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-8 space-y-12">
                  <h3 className="text-[10px] uppercase font-black tracking-[0.6em] text-white/20">Authorized Procurement Ledger</h3>
                  <div className="space-y-6">
                      {[
                        { id: "NODE_7201", status: "In Transit", name: "2024 PAGANI UTOPIA", price: "$4.1M", date: "May 12, 2026" },
                        { id: "NODE_1822", status: "Settled", name: "1962 FERRARI 250 GTO", price: "$52M", date: "Jan 18, 2026" },
                        { id: "NODE_4409", status: "Settled", name: "BUGATTI TOURBILLON", price: "$4.8M", date: "Dec 04, 2025" }
                      ].map((item, i) => (
                        <div key={i} className="p-6 md:p-10 bg-[#0A0A0A] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-white/20 transition-all cursor-default gap-6">
                           <div className="flex gap-6 md:gap-10 items-center">
                              <div className="w-12 md:w-16 h-12 md:h-16 bg-white flex items-center justify-center rotate-45 group-hover:bg-emerald-500 transition-colors shrink-0">
                                 <Shield className="w-5 md:w-6 h-5 md:h-6 text-black -rotate-45" />
                              </div>
                              <div className="space-y-1.5 md:space-y-2 overflow-hidden">
                                 <div className="flex items-center gap-3 md:gap-4">
                                    <span className="text-[8px] md:text-[9px] font-mono text-white/20 uppercase tracking-widest truncate">{item.id}</span>
                                    <span className={cn("text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1", item.status === 'Settled' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500')}>{item.status}</span>
                                 </div>
                                 <h4 className="text-xl md:text-2xl font-bold uppercase tracking-tighter italic truncate">{item.name}</h4>
                              </div>
                           </div>
                           <div className="sm:text-right space-y-0.5 md:space-y-1 sm:shrink-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                              <span className="text-[12px] md:text-sm font-mono font-bold text-white/60 block">{item.price}</span>
                              <span className="text-[8px] md:text-[9px] font-mono text-white/20 uppercase">{item.date}</span>
                           </div>
                        </div>
                      ))}
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-12">
                  <h3 className="text-[10px] uppercase font-black tracking-[0.6em] text-white/20">Secure Node Intel</h3>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 space-y-8">
                     <div className="flex items-center gap-4">
                        <Terminal className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Node_Transmission</span>
                     </div>
                     <p className="text-sm text-emerald-500/60 leading-relaxed font-mono">
                        System Alert: A high-velocity node [NODE_7209: PORSCHE 918] has been detected. Auction signal initializing in 24 hours. Monitor pulse link for priority clearance.
                     </p>
                     <button className="w-full py-4 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400">
                        View Node Data
                     </button>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Private Documents</h4>
                     <div className="space-y-2">
                        {["Bill_of_Sale_7201.pdf", "Providence_Audit_Report.pkg", "Logistics_Schedule_Q2.txt"].map((doc, i) => (
                           <button key={i} className="w-full p-6 border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/5 transition-all">
                              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{doc}</span>
                              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
