import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Timer, Gavel, ShieldCheck, Info, History, 
  ChevronRight, ArrowLeft, Share2, Heart,
  Zap, AlertCircle, CheckCircle
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";

export function LotDetails() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = React.useState(false);
  const [bidValue, setBidValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [lotData, setLotData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchLot = async () => {
      try {
        const res = await fetch("/api/lots");
        const data = await res.json();
        if (id && data[id]) {
          setLotData(data[id]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchLot();
    const interval = setInterval(fetchLot, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const [timeLeft, setTimeLeft] = React.useState({ h: "00", m: "00", s: "00", d: "00" });

  React.useEffect(() => {
    const updateTimer = () => {
      if (!lotData?.expiresAt) return;
      const now = new Date().getTime();
      const end = new Date(lotData.expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00", d: "00" });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ 
        d: d.toString().padStart(2, '0'),
        h: h.toString().padStart(2, '0'), 
        m: m.toString().padStart(2, '0'), 
        s: s.toString().padStart(2, '0') 
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lotData?.expiresAt]);

  const images = lotData?.image ? [lotData.image] : [
    "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000&auto=format&fit=crop"
  ];

  const bids = lotData?.bidHistory || [];

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("apex_user") || "{}");
    if (!user.email) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: id,
          amount: Number(bidValue),
          email: user.email
        })
      });
      
      await new Promise(r => setTimeout(r, 2000));
      setIsSubmitting(false);
      setIsBiddingModalOpen(false);
      setBidValue("");
    } catch (err) {
      console.error("Bid submission failed:", err);
      setIsSubmitting(false);
    }
  };

  const invoiceSent = lotData?.adminInvoiceStatus === 'Sent';

  if (!lotData) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-12">
        <div className="text-white/20 font-mono text-[9px] uppercase tracking-[0.5em] animate-pulse">Syncing Vault Node...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-[#050505]">
        {/* Left Section: Visuals & Data - High Density Pattern */}
        <section className="w-full lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 lg:overflow-y-auto no-scrollbar">
          {/* Full-Bleed Hero Image */}
          <div className="h-[45vh] lg:h-[55vh] flex-shrink-0 bg-neutral-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <motion.img 
              key={currentImageIndex}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              src={images[currentImageIndex]} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
            />
            
            <div className="absolute top-6 md:top-8 left-6 md:left-8 z-20 flex flex-wrap gap-2 md:gap-3">
              <div className="flex items-center gap-2 bg-red-700 px-3 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse" />
                Live Channel
              </div>
              <div className="bg-black/90 backdrop-blur-md border border-white/10 px-3 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/60 font-mono">
                Lot #{id?.split('-')[0].toUpperCase() || '72091'}
              </div>
            </div>

            <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 z-20 space-y-3 md:space-y-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none"
              >
                {lotData?.name || "Apex Node"} <br />
                <span className="text-white/20">Institutional Asset</span>
              </motion.h1>
              <div className="flex items-center gap-3 md:gap-4">
                <span className="w-8 md:w-12 h-[1px] bg-white/20" />
                <p className="text-white/40 text-[8px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase italic">Verified Acquisition • Sterling Procurement</p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 z-20 flex gap-1">
              {images.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={cn(
                    "h-1 md:h-1.5 transition-all duration-500",
                    currentImageIndex === i ? "bg-white w-12 md:w-20" : "bg-white/10 hover:bg-white/30 w-6 md:w-12"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Information Grid: High Density Style */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 bg-[#080808]">
            {[
              { label: "Odometer", value: "1,420", unit: "mi" },
              { label: "Title Status", value: "CLEAN", unit: "" },
              { label: "Geographic Hub", value: "APEX VAULT 01", unit: "" },
              { label: "Powerplant", value: "5.5L LT6 V8", unit: "" },
              { label: "Transmission", value: "8-SPD DCT", unit: "" },
              { label: "Colorway", value: "CARBON FLASH", unit: "" },
              { label: "VIN Sequence", value: "JTJAA", unit: "..." },
              { label: "Verified Data", value: "PDK-8SPD", unit: "" },
              { label: "Dossier Status", value: "VERIFIED", unit: "" },
            ].map((spec, i) => (
              <div key={i} className="p-6 md:p-12 border-r border-b border-white/5 group hover:bg-white/[0.01] transition-colors overflow-hidden">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black text-white/10 block mb-2 md:mb-3 group-hover:text-white/20 transition-colors italic whitespace-nowrap">{spec.label}</span>
                <span className="text-xl md:text-2xl font-mono text-white tracking-tighter uppercase font-bold leading-none truncate block">
                  {spec.value} <span className="text-[10px] md:text-xs text-white/20">{spec.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Section: Bid Engine & CRM Pipeline - High Density Pattern */}
        <section className="flex-1 bg-[#0A0A0A] flex flex-col lg:overflow-hidden min-h-[600px] lg:min-h-0">
          {/* Active Bidding Module */}
          <div className="p-6 md:p-12 border-b border-white/10 space-y-10 md:space-y-16">
            <div className="flex justify-between items-baseline gap-4">
              <div className="space-y-1">
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-white/20 italic">Current Allocation pulse</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse blur-[1px]" />
                  <span className="text-[8px] md:text-[10px] font-mono font-bold text-white/40 tracking-widest uppercase">TUNNEL_ACTIVE_4.2</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-4xl md:text-6xl font-light tracking-tighter text-white font-mono leading-none">
                  {formatCurrency(lotData?.currentBid || 124500)}
                </span>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {lotData.adminInvoiceStatus === 'Sent' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 md:p-12 bg-white text-black border border-white/10 space-y-4 md:space-y-6 text-center shadow-xl"
                >
                  <CheckCircle className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-2" />
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none">Invoice <br />Dispatched</h3>
                  <div className="h-[1px] w-8 md:w-12 bg-black/10 mx-auto" />
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed opacity-60 max-w-xs mx-auto">
                    Please check both your Primary Inbox and Spam/Junk folders for procurement documents from Apex Strategic Holdings.
                  </p>
                </motion.div>
              ) : lotData.status === 'Sold' ? (
                <div className="p-6 md:p-12 border border-white/10 bg-[#0A0A0A] space-y-6 md:space-y-8 text-center uppercase tracking-widest">
                   <div className="space-y-2">
                     <span className="text-[7px] md:text-[8px] uppercase tracking-[0.4em] font-black text-white/20">Market Status</span>
                     <h3 className="text-2xl md:text-3xl font-black tracking-tighter italic text-amber-500">Lot Closed</h3>
                   </div>
                   <div className="h-[1px] w-8 md:w-12 bg-white/10 mx-auto" />
                   <div className="space-y-4">
                     <p className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] leading-relaxed text-white/40">
                       A formal commercial invoice is being processed by Sterling and will be transmitted shortly.
                     </p>
                   </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black text-white/20">Time Remaining</span>
                    <div className="flex gap-1">
                      {[timeLeft.d, timeLeft.h, timeLeft.m, timeLeft.s].map((t, i) => (
                        <div key={i} className="flex items-baseline gap-1">
                          <span className={cn("text-lg md:text-xl font-mono font-bold tracking-tighter", i === 3 ? "text-emerald-500" : "text-white")}>{t}</span>
                          <span className="text-[7px] md:text-[8px] font-mono text-white/20 uppercase">{["D", "H", "M", "S"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {localStorage.getItem('apex_user') ? (
                    <button 
                      onClick={() => setIsBiddingModalOpen(true)}
                      className="w-full bg-[#D4AF37] text-black font-black uppercase tracking-[0.4em] py-5 md:py-7 text-[9px] md:text-[10px] hover:bg-[#B5962E] transition-all relative overflow-hidden group shadow-xl"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Gavel className="w-4 h-4 mb-0.5" />
                        Access Allocation Terminal
                      </span>
                      <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-y-0 w-1/3 bg-white/20 skew-x-12"
                      />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-white/5 border border-white/10 text-center space-y-4">
                        <AlertCircle className="w-6 h-6 text-white/20 mx-auto" />
                        <p className="text-[9px] uppercase tracking-[0.3em] font-black leading-relaxed text-white/40">
                          Institutional authorization required for market participation. 
                        </p>
                      </div>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('apex-open-login'))}
                        className="w-full py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-neutral-200 transition-all"
                      >
                         Secure Sign In
                      </button>
                    </div>
                  )}
                  <p className="text-[8px] text-center text-white/10 uppercase tracking-[0.3em] font-black italic">Institutional Entry Point Only</p>
                </>
              )}
            </div>
          </div>

          {/* Real-Time Bidding Stream */}
          <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 bg-[#050505]">
            <div className="px-6 md:px-12 py-6 border-b border-white/10 flex justify-between items-center bg-[#080808]">
              <h3 className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-white/20 italic">Activity Tunnels</h3>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-[8px] md:text-[9px] text-emerald-500 font-mono font-bold tracking-tighter">SIGNAL_NOMINAL</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[9px] md:text-[10px]">
              {bids.map((bid, i) => (
                <div 
                  key={bid.id} 
                  className={cn(
                    "px-6 md:px-12 py-5 md:py-6 flex justify-between items-center border-b border-white/5 transition-all group hover:bg-white/[0.02] cursor-default",
                    i === 0 ? "bg-white/[0.02] border-l-[1px] border-l-white" : ""
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 group-hover:text-white/60 tracking-[0.15em] uppercase font-bold">{bid.bidder || "AUTHORIZED_NODE"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/10 uppercase text-[7px] md:text-[8px] font-bold tracking-tighter">{new Date(bid.timestamp).toLocaleTimeString()} SIGNAL</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-white font-bold tracking-tighter text-lg md:text-xl group-hover:text-emerald-500 transition-colors">{formatCurrency(bid.amount)}</span>
                    <span className="text-[7px] md:text-[8px] font-black text-white/5 tracking-[0.3em] uppercase">verified_allocation</span>
                  </div>
                </div>
              ))}
              
              <div className="p-12 md:p-16 text-center opacity-40">
                <div className="inline-block border border-dashed border-white/10 px-6 md:px-10 py-4 md:py-6 bg-white/[0.01]">
                  <span className="text-[8px] md:text-[9px] text-white/30 uppercase tracking-[0.4em] italic leading-loose font-black px-2">
                    Monitoring Encrypted Node Data...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Node Status Footer */}
          <div className="p-8 bg-black border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex space-x-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-white/20 uppercase font-black tracking-[0.4em]">Node Velocity</span>
                  <span className="text-[10px] text-white/60 font-mono font-bold italic tracking-tighter uppercase whitespace-nowrap">4.2 Bids/Min per node</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-white/20 uppercase font-black tracking-[0.4em]">Signal Latency</span>
                  <span className="text-[10px] text-white/60 font-mono font-bold italic tracking-tighter uppercase">8ms (Verified)</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-6 px-6 py-2.5 border border-white/5 bg-white/5 rounded-full">
                <span className="text-[9px] uppercase tracking-tighter font-black text-white/20 italic">Global Distribution</span>
                <div className="w-12 h-6 bg-emerald-950/30 rounded-full relative border border-emerald-500/20 overflow-hidden">
                  <motion.div 
                    animate={{ x: [-5, 30, -5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1.5 w-3 h-3 bg-emerald-500 rounded-full blur-[1px] shadow-[0_0_12px_rgba(16,185,129,1)]" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Verification Wall Modal */}
      <AnimatePresence>
        {isBiddingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-8 md:p-12 rounded-sm space-y-8 md:space-y-12 relative overflow-hidden my-auto"
            >
              <button 
                onClick={() => setIsBiddingModalOpen(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <XBtn />
              </button>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-widest italic">Verification Vault</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium leading-relaxed">
                  Enter your private access token or request bid authorization from our procurement director.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handlePlaceBid}>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-white/30 ml-2">Allocation Token</label>
                  <input 
                    type="password" 
                    placeholder="ENTER_AUTHORIZED_TOKEN"
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-sm text-sm font-mono tracking-widest placeholder:text-white/10 focus:outline-none focus:border-white/40 transition-all"
                    required
                  />
                  <div className="flex items-center gap-2 mt-2 ml-2">
                    <AlertCircle className="w-3 h-3 text-white/20" />
                    <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Single-use persistent tunnel</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-white/30 ml-2">Bid Amount (USD)</label>
                  <input 
                    type="number" 
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                    placeholder="125,000"
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-sm text-2xl font-mono font-bold tracking-tighter placeholder:text-white/10 focus:outline-none focus:border-white/40 transition-all text-white"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-white text-black text-xs font-bold uppercase tracking-[0.4em] rounded-sm hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Locking Channel..." : "Authorize Allocation"}
                </button>

                <p className="text-center text-[8px] text-white/20 uppercase tracking-widest font-medium">
                  By clicking, you agree to invoice assignment conditions as per Article 4 Logistics Manifest.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function InvoiceOverlay({ amount }: { amount: string }) {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl space-y-12 my-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="w-16 h-16 bg-green-500 flex items-center justify-center rounded-sm rotate-45 mb-12 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                <ShieldCheck className="w-8 h-8 text-black -rotate-45" />
              </div>
              <h1 className="text-5xl font-bold uppercase tracking-tighter leading-none italic">
                Bid Locked & <br />Allocated
              </h1>
              <div className="space-y-2">
                <p className="text-sm text-white/40 uppercase tracking-widest font-medium leading-relaxed">
                  Lot Closed. A formal commercial invoice outlining bank wire instruction coordinates has been generated.
                </p>
                <p className="text-[10px] font-mono text-green-500/60 uppercase tracking-tighter">
                  Status: Secure Channel Established // Invoice ID: APX-9921-2026
                </p>
              </div>
              <div className="pt-8 flex gap-6">
                <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.3em] border border-white/20 px-8 py-4 rounded-sm hover:border-white transition-colors">Exit Portal</Link>
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] bg-white text-black px-8 py-4 rounded-sm hover:bg-neutral-200 transition-all">Download Manifest</button>
              </div>
           </div>

           <div className="p-12 bg-white text-black rounded-sm space-y-12 shadow-[0_100px_200px_rgba(255,255,255,0.05)] border-l-8 border-green-500">
              <div className="flex justify-between items-start border-b border-black/10 pb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Client Allocation</span>
                  <span className="text-xs font-bold">{localStorage.getItem('user_email') || "VERIFIED_BIDDER"}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Invoice Amount</span>
                  <span className="text-4xl font-mono font-bold tracking-tighter">${amount}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="opacity-40">Asset ID</span>
                  <span className="tracking-tighter font-mono">LOT-Z06-C2D4</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="opacity-40">Vault Location</span>
                  <span className="tracking-tighter font-mono">TERMINAL_01_NEW_YORK</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="opacity-40">Procurement Fee</span>
                  <span className="tracking-tighter font-mono">$0.00 (WAIVED)</span>
                </div>
              </div>

              <div className="p-6 bg-black/[0.03] border-2 border-dashed border-black/10 rounded-sm">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 opacity-40" />
                  <p className="text-[9px] uppercase font-bold tracking-tighter leading-tight opacity-40">
                    Sterling will transmit your signed routing manifest to your verified email within 10 minutes. Please prepare wire coordinates.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

function XBtn() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
