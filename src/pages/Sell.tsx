import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Star, Zap, UploadCloud, ChevronRight, CheckCircle, Calculator } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Sell() {
  const [step, setStep] = React.useState(1);
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 pt-10">
       <div className="max-w-[1600px] mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
             <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Flame className="w-4 h-4" /> Dealer & Marketplace Wholesale
             </div>
             <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Turn your inventory into <span className="text-blue-700">capital, faster.</span>
             </h1>
             <p className="text-lg font-medium text-slate-500">
                Bid.Cars exposes your vehicles to over 500,000 verified buyers globally. Sell clean title, salvage, and fleet vehicles securely.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
             <div className="enterprise-card p-10 text-center hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                   <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-4">Instant Valuation</h3>
                <p className="text-slate-500 font-medium">Get a real-time data-driven projection of your vehicle's auction value based on historical datasets.</p>
             </div>
             <div className="enterprise-card p-10 text-center hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                   <UploadCloud className="w-8 h-8" />
                 </div>
                 <h3 className="font-bold text-xl mb-4">Seamless Listing</h3>
                 <p className="text-slate-500 font-medium">Scan your VIN, upload images, and algorithms instantly generate high-conversion vehicle listings.</p>
             </div>
             <div className="enterprise-card p-10 text-center hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                   <Star className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl mb-4">Premium Bidders</h3>
                <p className="text-slate-500 font-medium">Bidders must hold escrow deposits. You are protected from non-paying buyers, with fast title transfers.</p>
             </div>
          </div>

          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-10 shadow-xl shadow-slate-200/50">
             <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                <Calculator className="w-6 h-6 text-blue-600" /> Start Estimator
             </h2>
             
             <div className="flex justify-between items-center mb-10 relative">
                <div className="absolute left-0 right-0 h-1 bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
                {[1, 2, 3].map(i => (
                   <div key={i} className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center relative z-10 font-bold transition-colors",
                      step >= i ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-200 text-slate-400"
                   )}>
                      {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                   </div>
                ))}
             </div>

             <div className="space-y-6">
                {step === 1 && (
                   <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Vehicle VIN</label>
                      <input type="text" placeholder="17 Digit VIN Code..." className="enterprise-input py-4 text-center font-mono text-lg uppercase tracking-widest bg-slate-50 border-slate-200" />
                      <button onClick={() => setStep(2)} className="enterprise-button enterprise-button-primary w-full mt-6 py-4 text-base">Decode Details</button>
                   </motion.div>
                )}
                {step === 2 && (
                   <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}}>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
                         <div className="text-sm font-bold text-green-700 bg-green-100 uppercase tracking-wider inline-block px-3 py-1 rounded mb-4">VIN Decoded</div>
                         <h3 className="text-xl font-bold text-slate-900 mb-1">2023 Mercedes-Benz S-Class S 580</h3>
                         <p className="text-sm font-semibold text-slate-500">4.0L V8 DI DOHC 32V / AWD / Automatic</p>
                      </div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Odometer / Mileage</label>
                      <input type="number" placeholder="Actual Mileage..." className="enterprise-input py-4 text-center font-mono text-lg tracking-widest bg-slate-50 border-slate-200" />
                      <div className="flex gap-4 mt-6">
                         <button onClick={() => setStep(1)} className="flex-1 enterprise-button enterprise-button-outline py-4">Back</button>
                         <button onClick={() => setStep(3)} className="flex-[2] enterprise-button enterprise-button-primary py-4 text-base">Get Estimate</button>
                      </div>
                   </motion.div>
                )}
                {step === 3 && (
                   <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="text-center">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Projected Auction Value</h3>
                      <div className="text-6xl font-display font-bold text-blue-700 tracking-tight leading-none mb-6">
                         $64,500 - $72,000
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-8 max-w-md mx-auto">
                         Based on recent nationwide auction block data for similar vehicles.
                      </p>
                      <button className="enterprise-button enterprise-button-primary w-full max-w-md mx-auto py-4 text-base shadow-xl shadow-blue-600/30">
                         Create Official Listing
                      </button>
                   </motion.div>
                )}
             </div>

          </div>

       </div>
    </div>
  );
}
