import React from "react";
import { motion } from "motion/react";
import { formatCurrency } from "@/src/lib/utils";
import { Clock, Search, Filter, ChevronDown, List, Grid3X3, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 pt-8 pb-32">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header & Breadcrumb */}
        <div className="mb-8">
           <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-4 uppercase tracking-wider">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <span className="text-slate-900">Vehicle Inventory</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Vehicles For Sale</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
           
           {/* Sidebar Filters */}
           <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 hidden lg:block">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Filter className="w-5 h-5"/> Advanced Filters</h2>
                 
                 <div className="space-y-6">
                    {/* Filter Section */}
                    <div className="border-b border-slate-100 pb-6">
                       <button className="flex items-center justify-between w-full font-semibold text-slate-800 mb-4">
                          Make & Model <ChevronDown className="w-4 h-4 text-slate-400" />
                       </button>
                       <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600 font-medium">Mercedes-Benz <span className="text-slate-400 font-normal">(42)</span></span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600 font-medium">BMW <span className="text-slate-400 font-normal">(38)</span></span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600 font-medium">Porsche <span className="text-slate-400 font-normal">(15)</span></span>
                          </label>
                       </div>
                    </div>
                    
                    <div className="border-b border-slate-100 pb-6">
                       <button className="flex items-center justify-between w-full font-semibold text-slate-800 mb-4">
                          Vehicle Condition <ChevronDown className="w-4 h-4 text-slate-400" />
                       </button>
                       <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600 font-medium">Clean Title <span className="text-slate-400 font-normal">(84)</span></span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600 font-medium">Salvage Title <span className="text-slate-400 font-normal">(120)</span></span>
                          </label>
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           {/* Results Area */}
           <div className="flex-1 w-full">
              
              {/* Action Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 shadow-sm">
                 <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search Inventory..." className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium" />
                 </div>
                 
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                       <span className="font-bold text-slate-900">{lots.length}</span> Results
                    </div>
                    <div className="hidden sm:flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                       <button className="p-2 bg-white text-blue-600 border-r border-slate-200"><Grid3X3 className="w-4 h-4"/></button>
                       <button className="p-2 text-slate-400 hover:text-slate-600"><List className="w-4 h-4"/></button>
                    </div>
                 </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {loading ? (
                   Array(6).fill(0).map((_, i) => (
                      <div key={i} className="enterprise-card h-80 animate-pulse bg-slate-100 border-none" />
                   ))
                 ) : (
                   lots.map((lot, index) => (
                     <InventoryCard key={lot.id} lot={lot} index={index} />
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InventoryCard({ lot, index }: { lot: any, index: number, key?: React.Key }) {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(lot.expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Finished");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lot.expiresAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 6) * 0.05 }}
      className="enterprise-card flex flex-col group cursor-pointer"
    >
      <Link to={`/lot/${lot.id}`} className="block flex-1 flex flex-col">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img 
            src={lot.image || lot.thumbnail} 
            alt={lot.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur shadow-sm border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-700 uppercase tracking-widest">
             Lot #{lot.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1">
           <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{lot.name}</h3>
           <p className="text-[11px] text-slate-500 uppercase font-semibold mb-4">VIN: {lot.id.padEnd(17, '0').substring(0, 17).toUpperCase()}</p>
           
           <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                 <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Current Bid</span>
                 <span className="text-lg font-display font-bold text-blue-700">{formatCurrency(lot.currentBid)}</span>
              </div>
              <div className="text-right">
                 <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Time Left</span>
                 <div className="flex items-center justify-end gap-1.5 text-slate-700 font-bold text-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {timeLeft}
                 </div>
              </div>
           </div>
        </div>
      </Link>
    </motion.div>
  );
}
