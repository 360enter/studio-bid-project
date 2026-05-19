import React from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/src/lib/utils";
import { Timer, ArrowUpRight, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export function Inventory() {
  const [lots, setLots] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/lots")
      .then(res => res.json())
      .then(data => {
        setLots(Object.values(data));
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-20 md:pt-32 pb-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-white/10 pb-12 gap-8">
           <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-8 md:w-12 h-[1px] bg-emerald-500" />
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-emerald-500 italic">Inventory_Nodes</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tighter italic leading-none">The Fleet Ledger</h1>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/30 font-black leading-loose max-w-md">
                 Institutional allocations currently active on the global node network.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row bg-[#0A0A0A] border border-white/10 p-1 md:p-2">
              <div className="relative flex items-center px-4 md:px-6 border-b sm:border-b-0 sm:border-r border-white/5 py-4 sm:py-0">
                 <Search className="w-3 md:w-4 h-3 md:h-4 text-white/20 mr-4" />
                 <input 
                   type="text" 
                   placeholder="Filter Nodes..." 
                   className="bg-transparent text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white outline-none w-full sm:w-48 placeholder:text-white/10"
                 />
              </div>
              <button className="flex items-center justify-center gap-4 px-6 md:px-8 py-4 hover:bg-white/5 transition-colors">
                 <Filter className="w-3 md:w-4 h-3 md:h-4 text-white/40" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Filters</span>
              </button>
           </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-white/10">
           {loading ? (
             Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] border-r border-b border-white/10 animate-pulse bg-white/5" />
             ))
           ) : (
             lots.map((lot, index) => (
               <InventoryCard key={lot.id} lot={lot} index={index} />
             ))
           )}
        </div>
      </div>
    </div>
  );
}

interface InventoryCardProps {
  lot: any;
  index: number;
  key?: React.Key;
}

function InventoryCard({ lot, index }: InventoryCardProps) {
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
      transition={{ delay: (index % 4) * 0.1 }}
      className="group relative border-r border-b border-white/10 bg-[#080808] overflow-hidden"
    >
      <Link to={`/lot/${lot.id}`} className="block">
        <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
          <img 
            src={lot.image || lot.thumbnail} 
            alt={lot.name} 
            className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
          />
          
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 space-y-4 md:space-y-6 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-6 md:w-8 h-[1px] bg-white/20" />
                   <span className="text-[8px] md:text-[10px] font-mono text-white/30 truncate">{lot.id}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter italic text-white/90 leading-none">{lot.name}</h3>
             </div>

             <div className="grid grid-cols-2 border-t border-white/10 pt-4 md:pt-6 gap-4 md:gap-6">
                <div className="space-y-1">
                   <span className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 block">Ask Pulse</span>
                   <span className="text-lg md:text-xl font-mono font-bold tracking-tighter text-emerald-500">{formatCurrency(lot.currentBid)}</span>
                </div>
                <div className="space-y-1 text-right">
                   <span className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 block">Pulse Time</span>
                   <div className="flex items-center justify-end gap-1.5 md:gap-2 text-white/40">
                      <Timer className="w-2.5 md:w-3 h-2.5 md:h-3" />
                      <span className="text-[10px] md:text-[12px] font-mono tracking-tighter">{timeLeft}</span>
                   </div>
                </div>
             </div>

             <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/60 italic">Analysis</span>
                <ArrowUpRight className="w-3 md:w-4 h-3 md:h-4 text-white" />
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
