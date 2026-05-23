import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Timer, ArrowRight, ShieldCheck, Search, Flame, Clock } from "lucide-react";
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
  const [lots, setLots] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const lotsRes = await fetch("/api/lots");
        const lotsData = await lotsRes.json();
        setLots(Object.values(lotsData));
      } catch (err) { }
    };
    fetchData();

    // Establish WebSocket for instant real-time bid updates
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "init") {
            setLots(Object.values(data.lots));
          } else if (data.type === "lot_update") {
            setLots(prevLots => {
              const exists = prevLots.some(l => l.id === data.lotId);
              if (exists) {
                return prevLots.map(l => l.id === data.lotId ? data.lot : l);
              } else {
                return [...prevLots, data.lot];
              }
            });
          }
        } catch (err) { }
      };
      socket.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
    };

    connectWS();
    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
         <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-950/10 hidden lg:block" />
         <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=2000')] bg-cover bg-center hidden lg:block rounded-l-3xl shadow-2xl border-l-[8px] border-blue-600" />
         
         <div className="max-w-[1600px] mx-auto px-6 py-20 lg:py-32 relative z-10 flex flex-col lg:w-1/2">
            <div className="flex items-center gap-2 mb-6">
               <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
               <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Trusted by 500,000+ Dealers globally</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6">
               Find Your Next Vehicle <span className="text-blue-700 dark:text-blue-400">At Auction</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl font-medium leading-relaxed">
               Access thousands of wholesale, clean title, and salvage vehicles. Bid live in real-time online or through our verified broker network.
            </p>
            
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-xl flex flex-col sm:flex-row gap-3">
               <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search Make, Model, or VIN..." className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all font-medium" />
               </div>
               <Link to="/inventory" className="enterprise-button enterprise-button-primary rounded-xl py-3.5 px-8">
                  Search
               </Link>
            </div>
            
            <div className="mt-10 flex gap-8 whitespace-nowrap overflow-x-auto no-scrollbar pb-4 items-center">
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">300k+</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Vehicles Sold</span>
               </div>
               <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">100%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Buyer Protection</span>
               </div>
               <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">24/7</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Live Bidding</span>
               </div>
            </div>
         </div>
      </section>

      {/* Featured Live Auctions */}
      <section className="py-20 max-w-[1600px] mx-auto px-6 w-full">
         <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Ending Soon</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Live Auctions</h2>
            </div>
            <Link to="/inventory" className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-350 transition-colors">
               View All Inventory <ArrowRight className="w-4 h-4" />
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lots.slice(0, 4).map((lot) => (
               <LotCard key={lot.id} lot={lot} />
            ))}
         </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="bg-slate-900 py-24 text-white mt-10">
         <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-blue-600/30">
                  <ShieldCheck className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-xl font-bold">Secure Transactions</h3>
               <p className="text-slate-400 font-medium">All payments and deposits are held in a secure escrow until vehicle delivery and title transfer is confirmed.</p>
            </div>
            <div className="space-y-4">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-blue-600/30">
                  <Timer className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-xl font-bold">Real-time Bidding</h3>
               <p className="text-slate-400 font-medium">Experience lightning-fast websocket bidding with proprietary anti-sniping proxy auto-bid technology.</p>
            </div>
            <div className="space-y-4">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-blue-600/30">
                  <Search className="w-7 h-7 text-white" />
               </div>
               <h3 className="text-xl font-bold">Transparent Reports</h3>
               <p className="text-slate-400 font-medium">Every vehicle includes an extensive condition report, dozens of high-res photos, and verified VIN checks.</p>
            </div>
         </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-[1600px] mx-auto px-6 w-full">
         <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-10">Browse Categories</h2>
         
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Exotics & Luxury', 'SUVs & Crossovers', 'Trucks & Commercial', 'Clean Title', 'Salvage Title', 'Classics'].map((cat, i) => (
               <Link to={"/inventory"} key={i} className="enterprise-card flex flex-col items-center justify-center py-10 px-4 hover:-translate-y-1 hover:shadow-lg transition-all text-center group cursor-pointer border-slate-205">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                     <Search className="w-6 h-6 text-blue-600 dark:text-blue-405 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{cat}</span>
               </Link>
            ))}
         </div>
      </section>

    </div>
  );
}

function LotCard({ lot }: { lot: any; key?: React.Key }) {
  const [timeLeft, setTimeLeft] = React.useState("");
  const [isAlert, setIsAlert] = React.useState(false);

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(lot.expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Finished");
        setIsAlert(false);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
      if (diff < 1000 * 60 * 60 * 4) setIsAlert(true); // under 4 hours
      else setIsAlert(false);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lot.expiresAt]);

  return (
    <div className="enterprise-card flex flex-col group relative">
       {/* Image */}
       <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b dark:border-slate-800">
          <Link to={`/lot/${lot.id}`}>
             <img src={lot.image || lot.thumbnail} alt={lot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </Link>
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-green-500" /> Lot #{lot.id.substring(0, 8).toUpperCase()}
          </div>
       </div>

       {/* Details */}
       <div className="p-5 flex-1 flex flex-col">
          <Link to={`/lot/${lot.id}`} className="block mb-4 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
             <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-900 dark:text-white">{lot.name}</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">VIN: {lot.id.padEnd(17, '0').substring(0, 17).toUpperCase()}</p>
          </Link>
          
          <div className="mt-auto space-y-4">
             {/* Bidding Info */}
             <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                   <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Current Bid</span>
                   <span className="text-2xl font-display font-bold text-blue-700 dark:text-blue-400">{formatCurrency(lot.currentBid)}</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Time Left</span>
                   <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold", isAlert ? "bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
                      <Clock className="w-3.5 h-3.5" />
                      {timeLeft}
                   </div>
                </div>
             </div>
             
             {/* Action */}
             <Link to={`/lot/${lot.id}`} className="block w-full py-2.5 text-center bg-slate-900 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-600 transition-colors">
                View & Bid
             </Link>
          </div>
       </div>
    </div>
  );
}
