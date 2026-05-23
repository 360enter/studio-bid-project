import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Timer, Gavel, ShieldCheck, Info, History, 
  ChevronRight, ArrowLeft, Share2, Heart,
  Zap, AlertCircle, CheckCircle, Scale, Car, FileText, ArrowUp, Search, X
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";

function maskBidder(rawEmail: string | undefined | null) {
  if (!rawEmail) return "BIDDER";
  if (rawEmail.includes("@")) {
    const [part1, part2] = rawEmail.split("@");
    const maskedPart = part1.length > 2 
      ? part1.slice(0, 2) + "***" + part1.slice(-1) 
      : part1 + "***";
    return `${maskedPart}@${part2}`;
  }
  return rawEmail;
}

export function LotDetails() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isBiddingModalOpen, setIsBiddingModalOpen] = React.useState(false);
  const [bidValue, setBidValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lotData, setLotData] = React.useState<any>(null);
  const [loadError, setLoadError] = React.useState(false);
  
  const [user, setUser] = React.useState<any>(null);
  const [escrowBalance, setEscrowBalance] = React.useState<number>(0);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('apex_user');
    if (savedUser) {
       const parsedUsr = JSON.parse(savedUser);
       setUser(parsedUsr);
       // Fetch accurate escrow wallet balance
       fetch(`/api/escrow/wallet/${parsedUsr.id}`)
         .then(res => res.json())
         .then(data => {
            if (data.success && data.wallet) {
               setEscrowBalance(data.wallet.available_balance || 0);
            }
         }).catch(console.error);
    }
    
    // Realtime Lot data fetching logic
    const fetchLot = async () => {
      try {
        const res = await fetch("/api/lots");
        const data = await res.json();
        if (id && data[id]) {
           setLotData(data[id]);
           setLoadError(false);
        } else {
           setLoadError(true);
        }
      } catch (err) {
         setLoadError(true);
      }
    };
    fetchLot();

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
            if (id && data.lots[id]) setLotData(data.lots[id]);
          } else if (data.type === "lot_update" && data.lotId === id) {
            setLotData(data.lot);
          } else if (data.type === "lot_delete" && data.lotId === id) {
            setLotData(null);
          }
        } catch (err) {}
      };
      socket.onclose = () => { reconnectTimeout = setTimeout(connectWS, 3000); };
    };
    connectWS();
    
    return () => {
      if (socket) { socket.onclose = null; socket.close(); }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [id]);

  const [timeLeft, setTimeLeft] = React.useState({ h: "00", m: "00", s: "00", d: "00" });
  const [isExpired, setIsExpired] = React.useState(false);
  const [isExtendedTimer, setIsExtendedTimer] = React.useState(false);

  React.useEffect(() => {
    if (!lotData?.expiresAt) return;
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(lotData.expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ h: "00", m: "00", s: "00", d: "00" });
        return;
      }
      setIsExpired(false);
      setIsExtendedTimer(diff < 60000);
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
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lotData?.expiresAt]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
         <div className="flex flex-col items-center max-w-sm text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Vehicle Not Found</h2>
            <p className="text-slate-500 mb-6">The vehicle you are looking for does not exist or has been removed from the platform.</p>
            <Link to="/inventory" className="enterprise-button enterprise-button-primary py-2.5 px-6">Return to Inventory</Link>
         </div>
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
         <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading Vehicle Details...</p>
         </div>
      </div>
    );
  }

  const {
      name, image, images = [], id: lotId, currentBid, bids = [],
      year, make, model, category, specifications = {},
      historyLogs = [], conditionInfo = {}, sellerInfo = {}
  } = lotData;
  const allImages = [image, ...images].filter(Boolean);

  const highestBidder = bids.length > 0 ? bids[bids.length - 1].bidder : null;
  const isWinning = user && highestBidder === user.email;
  
  const minBid = currentBid + 100; // Increment of 100
  const canBid = user && (escrowBalance >= (minBid * 0.10)); // Require 10% of bid minimum in escrow

  return (
    <div className="bg-slate-50 pt-6 pb-24 text-slate-800">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
           <Link to="/" className="hover:text-blue-700">Home</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/inventory" className="hover:text-blue-700">Vehicle Inventory</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-slate-900">{name}</span>
        </div>

        {/* Global Page Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8 border-b border-slate-200 pb-6">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    LOT #{lotId.substring(0, 8)}
                 </div>
                 {category && (
                    <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                       {category}
                    </div>
                 )}
                 <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> VERIFIED SELLER
                 </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                 {year} {name}
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-2">VIN: {lotId.padEnd(17, 'X').toUpperCase()} • Odometer: {specifications.mileage || "N/A"} mi • Location: {sellerInfo.location || "N/A"}</p>
           </div>
           
           <div className="flex items-center gap-3">
              <button className="enterprise-button enterprise-button-outline px-4 py-2 text-sm flex gap-2">
                 <Scale className="w-4 h-4" /> Compare
              </button>
              <button className="enterprise-button enterprise-button-outline px-4 py-2 text-sm flex gap-2">
                 <Heart className="w-4 h-4 text-red-500" /> Watchlist
              </button>
              <button className="enterprise-button enterprise-button-outline px-4 py-2 text-sm flex gap-2">
                 <Share2 className="w-4 h-4" /> Share
              </button>
           </div>
        </div>

        {/* Dynamic Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Main Column (Images + Specs) */}
           <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Image Gallery */}
              <div className="enterprise-card bg-white p-2">
                 <div 
                   className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden cursor-pointer group"
                   onClick={() => setIsFullscreen(true)}
                 >
                    <img 
                      src={allImages[currentImageIndex]} 
                      alt={`${name} View ${currentImageIndex + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i > 0 ? i - 1 : allImages.length - 1); }}
                         className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-colors"
                       >
                         <ArrowLeft className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i < allImages.length - 1 ? i + 1 : 0); }}
                         className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-slate-900 hover:bg-white transition-colors"
                       >
                         <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-lg">
                       <Search className="w-4 h-4 inline mr-2 mb-0.5" /> Hover to Zoom
                    </div>
                 </div>
                 
                 {/* Thumbnails */}
                 <div className="flex gap-2 p-2 mt-2 overflow-x-auto no-scrollbar">
                    {allImages.map((img, idx) => (
                       <button 
                         key={idx} 
                         onClick={() => setCurrentImageIndex(idx)}
                         className={cn(
                           "flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all",
                           currentImageIndex === idx ? "border-blue-600 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                         )}
                       >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                       </button>
                    ))}
                 </div>
              </div>

              {/* Detailed Specs Grid */}
              <div className="enterprise-card bg-white p-8">
                 <h2 className="text-xl font-bold border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600"/> Vehicle Data Hub
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-4">
                       <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-2 text-blue-800">Primary Specs</h3>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Odometer</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.mileage || "N/A"} mi (Actual)</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Primary Damage</span>
                          <span className="font-bold text-red-600 text-sm">{conditionInfo.primaryDamage || "Front End"}</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Body Style</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.bodyStyle || "Coupe"}</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Color</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.color || "Black"}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-2 text-blue-800">Drivetrain Details</h3>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Engine</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.engine || "3.5L V6 FI DOHC"}</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Transmission</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.transmission || "Automatic"}</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Drive</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.drivetrain || "All Wheel Drive"}</span>
                       </div>
                       <div className="flex justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-500 font-medium text-sm">Fuel Type</span>
                          <span className="font-bold text-slate-900 text-sm">{specifications.fuel || "Gas"}</span>
                       </div>
                    </div>
                 </div>
              </div>

           </div>

           {/* Right Column (Bidding Terminal) */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Bidding Card */}
              <div className="enterprise-card bg-white p-6 shadow-lg shadow-slate-200/50">
                 
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 opacity-10">
                       <Timer className="w-24 h-24 -mr-4 mt-2" />
                    </div>
                    {isExpired ? (
                      <div className="text-center py-4">
                         <Gavel className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                         <div className="text-xl font-display font-bold text-slate-900 uppercase">Auction Resolved</div>
                         <div className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">Awaiting Final Contract</div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Time Remaining</h4>
                        <div className={cn(
                           "flex justify-between items-center",
                           isExtendedTimer ? "text-red-600 animate-pulse" : "text-slate-900"
                        )}>
                           <div className="flex flex-col items-center">
                              <span className="text-3xl font-display font-bold leading-none">{timeLeft.d}</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest mt-1">Days</span>
                           </div>
                           <span className="text-3xl font-light opacity-50 mb-4">:</span>
                           <div className="flex flex-col items-center">
                              <span className="text-3xl font-display font-bold leading-none">{timeLeft.h}</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest mt-1">Hrs</span>
                           </div>
                           <span className="text-3xl font-light opacity-50 mb-4">:</span>
                           <div className="flex flex-col items-center">
                              <span className="text-3xl font-display font-bold leading-none">{timeLeft.m}</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest mt-1">Min</span>
                           </div>
                           <span className="text-3xl font-light opacity-50 mb-4">:</span>
                           <div className="flex flex-col items-center">
                              <span className="text-3xl font-display font-bold leading-none">{timeLeft.s}</span>
                              <span className="text-[9px] uppercase font-bold tracking-widest mt-1">Sec</span>
                           </div>
                        </div>
                      </>
                    )}
                 </div>

                 <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Bid</span>
                       {isWinning && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                             You are winning!
                          </span>
                       )}
                    </div>
                    <div className="text-5xl font-display font-bold text-blue-700 tracking-tight leading-none mb-2">
                       {formatCurrency(currentBid)}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 pb-4">
                       Bidder: {maskBidder(highestBidder)}
                    </div>
                 </div>

                 {!isExpired && (
                    <div className="space-y-4">
                       {user ? (
                          <>
                             {canBid ? (
                                <button 
                                  onClick={() => setIsBiddingModalOpen(true)}
                                  className="w-full enterprise-button enterprise-button-primary shadow-lg shadow-blue-600/30 font-bold text-lg py-4 flex flex-col items-center justify-center group relative overflow-hidden"
                                >
                                   <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0] transition-transform duration-300" />
                                   <span className="relative z-10 flex items-center gap-2"><ArrowUp className="w-5 h-5"/> Place Maximum Bid</span>
                                   <span className="relative z-10 text-[10px] uppercase tracking-widest font-medium mt-1 text-blue-100">Step Minimum: {formatCurrency(minBid)}</span>
                                </button>
                             ) : (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                   <div className="flex items-start gap-3">
                                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                      <div>
                                         <h4 className="font-bold text-orange-900 text-sm">Deposit Required</h4>
                                         <p className="text-xs text-orange-800 mt-1 pb-3">You must hold a refundable deposit matching 10% of your total desired bidding power.</p>
                                         <Link to="/dashboard" className="text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 underline underline-offset-4">Fund Escrow Wallet →</Link>
                                      </div>
                                   </div>
                                </div>
                             )}
                          </>
                       ) : (
                          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center">
                             <h4 className="font-bold text-slate-800 text-sm mb-2">Sign in to bid</h4>
                             <button onClick={() => window.dispatchEvent(new Event('apex-open-login'))} className="enterprise-button bg-slate-900 text-white w-full py-2.5 shadow-md">Authenticate</button>
                             <div className="mt-3 text-[10px] uppercase font-bold text-slate-500">New user? <button onClick={() => window.dispatchEvent(new Event('apex-open-register'))} className="text-blue-600 underline">Register Now</button></div>
                          </div>
                       )}
                    </div>
                 )}

                 {/* Key Alerts */}
                 <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                       <Zap className="w-4 h-4 text-red-500" />
                       <span className="text-sm font-semibold text-red-800">Salvage Title Verified</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                       <CheckCircle className="w-4 h-4 text-green-600" />
                       <span className="text-sm font-semibold text-green-800">Keys Present</span>
                    </div>
                 </div>

              </div>

              {/* History Block */}
              <div className="enterprise-card bg-white p-6">
                 <h2 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" /> Bid History
                 </h2>
                 <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
                    {bids.length > 0 ? [...bids].reverse().map((bid: any, i: number) => (
                       <div key={bid.id || i} className={cn(
                          "flex justify-between items-center p-3 rounded-lg border",
                          i === 0 ? "bg-blue-50/50 border-blue-100" : "bg-white border-slate-100"
                       )}>
                          <div className="flex flex-col">
                             <span className="text-sm font-mono font-bold text-slate-900">{formatCurrency(bid.amount)}</span>
                             <span className="text-[10px] text-slate-500 uppercase tracking-wider">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600">
                             {maskBidder(bid.bidder)}
                          </div>
                       </div>
                    )) : (
                       <div className="text-center py-6 text-sm text-slate-400 font-medium">No bids received yet.</div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col backdrop-blur-md"
          >
             <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div className="text-white font-bold text-xl">{name}</div>
                <button onClick={() => setIsFullscreen(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                   <AlertCircle className="w-6 h-6 rotate-45" /> 
                </button>
             </div>
             
             <div className="flex-1 relative flex justify-center items-center overflow-hidden p-8">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i > 0 ? i - 1 : allImages.length - 1); }}
                  className="absolute left-8 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ArrowLeft className="w-8 h-8" />
                </button>
                
                <img 
                  src={allImages[currentImageIndex]} 
                  alt=""
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i < allImages.length - 1 ? i + 1 : 0); }}
                  className="absolute right-8 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
             </div>
             
             <div className="p-6 overflow-x-auto whitespace-nowrap flex gap-4 justify-center border-t border-white/10">
                {allImages.map((img, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => setCurrentImageIndex(idx)}
                     className={cn(
                       "flex-shrink-0 w-32 h-20 rounded-md overflow-hidden border-2 transition-all",
                       currentImageIndex === idx ? "border-blue-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                     )}
                   >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                   </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bidding Modal */}
      <AnimatePresence>
        {isBiddingModalOpen && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
           >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                 <div className="bg-slate-900 p-6 text-white relative">
                    <button onClick={() => setIsBiddingModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                       <AlertCircle className="w-5 h-5 rotate-45" />
                    </button>
                    <h3 className="text-xl font-bold mb-1">Place Maximum Auto-Bid</h3>
                    <p className="text-xs text-slate-400 font-medium">LOT #{lotId.substring(0, 8)} • {name}</p>
                 </div>
                 
                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    try {
                      const res = await fetch(`/api/lots/${id}/bid`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount: Number(bidValue), bidder: user.email })
                      });
                      if (res.ok) {
                        setIsBiddingModalOpen(false);
                      } else {
                        alert("Bid submission rejected. Check minimums.");
                      }
                    } catch (err) {}
                    setIsSubmitting(false);
                 }} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center space-y-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">Current Bid</span>
                       <div className="text-3xl font-display font-bold text-blue-700">{formatCurrency(currentBid)}</div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mt-2 pt-2 border-t border-blue-200/50">Min Next Bid: {formatCurrency(minBid)}</span>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Maximum Bid (USD)</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input 
                            type="number" 
                            min={minBid}
                            value={bidValue}
                            onChange={e => setBidValue(e.target.value)}
                            required
                            placeholder={`${minBid}`}
                            className="w-full bg-slate-50 border border-slate-300 pl-8 pr-4 py-3 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                       </div>
                    </div>

                    <ul className="text-xs text-slate-500 font-medium space-y-2 pb-4 border-b border-slate-100">
                       <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-slate-400 flex-shrink-0" /> Proxy bidding will bid the minimum required up to your max.</li>
                       <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-slate-400 flex-shrink-0" /> Total power available: {formatCurrency(user?.deposit_balance * 10)}</li>
                    </ul>

                    <div className="flex gap-4">
                       <button type="button" onClick={() => setIsBiddingModalOpen(false)} className="flex-1 enterprise-button enterprise-button-outline py-3">Cancel</button>
                       <button type="submit" disabled={isSubmitting || Number(bidValue) < minBid} className="flex-1 enterprise-button enterprise-button-primary py-3">
                          {isSubmitting ? "Processing..." : "Confirm Bid"}
                       </button>
                    </div>
                 </form>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
