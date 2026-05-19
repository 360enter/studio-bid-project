import React from "react";
import { motion } from "motion/react";
import { Shield, Upload, ArrowRight, CheckCircle } from "lucide-react";

export function Sell() {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    assetType: "",
    modelName: "",
    estimatedValue: "",
    description: "",
    contactEmail: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl text-center space-y-8 md:space-y-12"
        >
          <div className="w-16 md:w-24 h-16 md:h-24 bg-white flex items-center justify-center mx-auto rotate-45">
             <CheckCircle className="w-8 md:w-12 h-8 md:h-12 text-black -rotate-45" />
          </div>
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter italic">Commissioning <br />Logged</h2>
            <p className="text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/30 font-black leading-loose max-w-sm md:max-w-lg mx-auto">
              Your asset disposal request has been routed to the primary institutional node. A coordinator will initialize contact for physical inspection.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto px-12 md:px-20 py-6 md:py-8 border border-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] md:tracking-[0.8em] hover:bg-white hover:text-black transition-all"
          >
            Clear Command
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24 text-white">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        <div className="space-y-10 md:space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Shield className="w-5 md:w-6 h-5 md:h-6 text-emerald-500" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-emerald-500 italic">Disposal_Request</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter italic leading-[0.9] md:leading-[0.85]">Asset <br />Commissioning</h1>
            <p className="text-lg md:text-xl text-white/40 max-w-md leading-relaxed font-light">
              Submit your high-value assets for institutional procurement. Our node network facilitates discreet, high-velocity settlements.
            </p>
          </div>

          <div className="space-y-8 border-l border-white/10 pl-6 md:pl-12">
            {[
              { t: "Verification", d: "Rigorous node-level inspection and providence tracking." },
              { t: "Allocation", d: "Targeted placement within the private institutional fleet." },
              { t: "Settlement", d: "Accelerated liquidity through secure tunnel protocols." }
            ].map((step, i) => (
              <div key={i} className="space-y-2 group">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-emerald-500 transition-colors">Phase 0{i+1}</span>
                 <h4 className="text-xl font-bold uppercase tracking-tighter italic">{step.t}</h4>
                 <p className="text-sm text-white/30">{step.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-16 space-y-10 md:space-y-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 md:p-8">
              <span className="text-[7px] md:text-[8px] font-mono text-white/10 uppercase tracking-[0.4em] md:tracking-[0.5em]">System_v.2026</span>
           </div>
           
           <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter italic">Operational Data Pkt</h3>
           
            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
              <FormInput label="Asset Classification" placeholder="EX: 1972 Ferrari Daytona" />
              <FormInput label="Estimated Floor" placeholder="EX: $1.2M USD" />
              
              <div className="space-y-4">
                 <label className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 ml-1 block">Digital Twin (Images)</label>
                 <div className="border border-white/5 bg-black p-8 md:p-12 text-center space-y-3 md:space-y-4 border-dashed hover:border-white/20 transition-all cursor-pointer">
                    <Upload className="w-6 md:w-8 h-6 md:h-8 text-white/10 mx-auto" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/20 block">Inject Media Array</span>
                 </div>
              </div>

              <FormInput label="Node Identity (Email)" placeholder="institutional@apex.com" type="email" />

              <button className="w-full py-6 md:py-8 bg-white text-black text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center justify-center gap-4 md:gap-6 group hover:bg-emerald-500 transition-all">
                Initialize Commissioning
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-2 transition-transform" />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-3 md:space-y-4">
       <label className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 ml-1 block">{label}</label>
       <input 
         required
         type={type} 
         placeholder={placeholder}
         className="w-full bg-transparent border-b border-white/10 py-3 md:py-4 text-lg md:text-xl font-bold tracking-tighter text-white placeholder:text-white/5 focus:outline-none focus:border-white/60 transition-colors italic"
       />
    </div>
  );
}
