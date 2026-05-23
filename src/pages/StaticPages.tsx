import React from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, HelpCircle, AlertCircle, FileText, Globe, Shield, Briefcase, TrendingUp, Users, Zap, Truck, Navigation, ChevronRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HeroHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="bg-slate-900 text-white pt-24 pb-16 px-6 relative overflow-hidden">
     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
     <div className="max-w-7xl mx-auto relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">{subtitle}</p>
     </div>
  </div>
);

export function Locations() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Global Facilities" subtitle="Find our auction yards, storage facilities, and operation centers near you." />
      <div className="max-w-7xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { city: "Los Angeles, CA", type: "Main Hub & Storage Yard", address: "1400 E 4th St, Los Angeles, CA 90033" },
              { city: "Dallas, TX", type: "Distribution Center", address: "2400 N Interstate 35E, Carrollton, TX 75006" },
              { city: "Miami, FL", type: "Export Operations", address: "NW 25th St, Miami, FL 33122" },
              { city: "Chicago, IL", type: "Midwest Operations", address: "S Cicero Ave, Chicago, IL 60638" },
              { city: "Newark, NJ", type: "East Coast Hub", address: "Port St, Newark, NJ 07114" },
              { city: "Seattle, WA", type: "Pacific Northwest Yard", address: "E Marginal Way S, Seattle, WA 98108" }
            ].map((loc, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                 <MapPin className="w-8 h-8 text-blue-600 mb-4" />
                 <h3 className="text-xl font-bold text-slate-900 mb-1">{loc.city}</h3>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{loc.type}</div>
                 <p className="text-slate-600 mb-6">{loc.address}</p>
                 <button className="enterprise-button enterprise-button-outline w-full py-2">Get Directions</button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export function HelpCenter() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Help Center" subtitle="Comprehensive guides, troubleshooting, and support for your Bid.Cars experience." />
      <div className="max-w-4xl mx-auto px-6 py-16">
         <div className="space-y-6">
            {[
              { q: "How do I place a bid?", a: "Once your account is approved and you have secured a deposit, simply navigate to any active vehicle lot and use the bidding interface. Make sure you bid exceeds the current price by the minimum increment." },
              { q: "What are the escrow requirements?", a: "Bidders must maintain a 10% deposit in their escrow wallet relative to their maximum desired bid capacity. A $1,000 deposit unlocks $10,000 in bidding power." },
              { q: "How long does verification take?", a: "Account verification is typically completed within 1-2 business days. You will receive an email notification once our compliance team approves your identity documents." },
              { q: "What happens if I win an auction?", a: "You will receive an invoice within 1 hour. Payment must be wire transferred in full within 3 business days. Once funds clear, you will be authorized to arrange shipping or pickup." }
            ].map((item, i) => (
               <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600" /> {item.q}</h3>
                  <p className="text-slate-600 leading-relaxed ml-7">{item.a}</p>
               </div>
            ))}
         </div>
         <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Still need help?</h3>
            <p className="text-blue-700 mb-6">Our support team is available 24/7 to assist you.</p>
            <Link to="/contact" className="enterprise-button enterprise-button-primary shadow-none">Contact Support</Link>
         </div>
      </div>
    </div>
  );
}

export function HowToBuy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="How to Buy" subtitle="A step-by-step guide to acquiring inventory through our global marketplace." />
      <div className="max-w-4xl mx-auto px-6 py-16">
         <div className="relative border-l-2 border-slate-200 ml-4 space-y-12 pb-8">
            {[
              { step: 1, title: "Register & Verify", desc: "Create an account and submit your identification. Dealers should upload their wholesale licenses for tax exemptions." },
              { step: 2, title: "Fund Your Wallet", desc: "Deposit funds into your Bid.Cars escrow wallet. Your bidding power is 10x your deposit amount." },
              { step: 3, title: "Research Inventory", desc: "Browse thousands of vehicles. Review condition reports, VIN decodes, and high-resolution imaging." },
              { step: 4, title: "Place Bids", desc: "Engage in live auctions. Use our dynamic bidding system or set maximum pre-bids to proxy bid automatically." },
              { step: 5, title: "Pay & Transport", desc: "If you win, wire the funds within 3 days. Our logistics partners can handle domestic and international transport from the facility to your driveway." }
            ].map((s) => (
               <div key={s.step} className="relative pl-8">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-4 border-slate-50">
                     {s.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{s.desc}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export function Shipping() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Shipping & Delivery" subtitle="Global logistics, simplified. Get your vehicles delivered securely and efficiently." />
      <div className="max-w-7xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
               <h2 className="text-3xl font-bold text-slate-900 mb-6">Domestic Transport</h2>
               <p className="text-slate-600 mb-8 whitespace-pre-line">
                  Bid.Cars partners with leading freight network operators to ensure seamless domestic shipping across the 48 contiguous states.
                  
                  • Open-carrier transport (Most cost-effective)
                  • Enclosed transport (For high-value assets)
                  • Expedited delivery available
                  
                  Once your vehicle is paid in full, you can instantly request a freight quote directly from your dashboard.
               </p>
               <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">International Export</h2>
               <p className="text-slate-600 whitespace-pre-line">
                  We offer end-to-end export services from major US ports (Miami, Newark, LA) to global destinations.
                  
                  Handling customs clearance, title processing, and RORO/Container shipping logistics so you don't have to.
               </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
               <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Truck className="w-6 h-6 text-blue-600" /> Estimate Shipping</h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination ZIP / Country</label>
                     <input type="text" className="enterprise-input bg-slate-50" placeholder="e.g. 90210" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transport Type</label>
                     <select className="enterprise-input bg-slate-50">
                        <option>Open Carrier (Standard)</option>
                        <option>Enclosed (Premium)</option>
                        <option>Ocean Freight (Export)</option>
                     </select>
                  </div>
                  <button className="enterprise-button enterprise-button-primary w-full py-4 mt-4">Calculate Estimate</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export function ContactUs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Contact Operations" subtitle="Our global command center is ready to assist you." />
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Get in Touch</h2>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                  <div>
                     <div className="font-bold text-slate-900">+1 (800) 555-0199</div>
                     <div className="text-slate-500 text-sm font-medium">Mon-Fri, 8AM - 6PM EST</div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                  <div>
                     <div className="font-bold text-slate-900">support@bid.cars</div>
                     <div className="text-slate-500 text-sm font-medium">24/7 Email Monitoring</div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
                  <div>
                     <div className="font-bold text-slate-900">Live Chat Operations</div>
                     <div className="text-slate-500 text-sm font-medium">Available via secure portal</div>
                  </div>
               </div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold mb-6">Send an Inquiry</h3>
            <form className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                  <input type="text" className="enterprise-input bg-slate-50" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input type="email" className="enterprise-input bg-slate-50" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                  <textarea rows={4} className="enterprise-input bg-slate-50"></textarea>
               </div>
               <button className="enterprise-button enterprise-button-primary w-full py-4 mt-2">Transmit Inquiry</button>
            </form>
         </div>
      </div>
    </div>
  );
}

export function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="About Bid.Cars" subtitle="Pioneering the future of digital automotive liquidations." />
      <div className="max-w-5xl mx-auto px-6 py-16">
         <div className="prose prose-slate max-w-none prose-lg text-slate-600 mb-20">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Our Mission</h2>
            <p>
               Bid.Cars was founded on a simple principle: to bring total transparency and zero-latency execution to the global wholesale vehicle market. By cutting through bureaucratic layers and implementing military-grade verification, we've built the most efficient bidding engine on the web.
            </p>
            <p>
               We bridge the gap between major fleet operators, insurance conglomerates, and independent dealers worldwide.
            </p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="enterprise-card p-8 border-l-[4px] border-blue-600">
               <div className="text-4xl font-display font-bold text-slate-900 mb-2">500k+</div>
               <div className="text-slate-500 font-bold uppercase tracking-wider text-sm">Vehicles Sold</div>
            </div>
            <div className="enterprise-card p-8 border-l-[4px] border-emerald-500">
               <div className="text-4xl font-display font-bold text-slate-900 mb-2">$2.4B</div>
               <div className="text-slate-500 font-bold uppercase tracking-wider text-sm">Escrow Volume</div>
            </div>
            <div className="enterprise-card p-8 border-l-[4px] border-purple-500">
               <div className="text-4xl font-display font-bold text-slate-900 mb-2">140+</div>
               <div className="text-slate-500 font-bold uppercase tracking-wider text-sm">Countries Served</div>
            </div>
         </div>
      </div>
    </div>
  );
}


export function InvestorRelations() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Investor Relations" subtitle="Financial performance, corporate governance, and quarterly metrics." />
      <div className="max-w-5xl mx-auto px-6 py-16">
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
               <div>
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">NASDAQ: BIDC</div>
                  <div className="text-4xl font-display font-bold">$142.50</div>
               </div>
               <div className="text-right">
                  <div className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp className="w-5 h-5"/> +4.2%</div>
                  <div className="text-slate-400 text-sm">Market Close</div>
               </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Latest Earnings Report</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex justify-between items-center">
                     <div>
                        <div className="font-bold text-slate-900">Q3 2025 Financial Results</div>
                        <div className="text-sm text-slate-500">Released Oct 15, 2025</div>
                     </div>
                     <button className="text-blue-600 font-bold hover:underline">Download PDF</button>
                  </div>
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Upcoming Events</h3>
                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="w-16 text-center bg-blue-50 text-blue-700 rounded-lg p-2 font-bold leading-tight">
                           <div className="text-xs uppercase">Nov</div>
                           <div className="text-xl">12</div>
                        </div>
                        <div>
                           <div className="font-bold text-slate-900">Annual Shareholder Meeting</div>
                           <div className="text-sm text-slate-500">Virtual Webcast</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export function Careers() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Careers" subtitle="Join the team building the world's most advanced automotive trading network." />
      <div className="max-w-5xl mx-auto px-6 py-16">
         <h2 className="text-3xl font-bold text-slate-900 mb-8">Open Positions</h2>
         <div className="space-y-4">
            {[
               { title: "Senior Rust Engineer", team: "Core Infrastructure", location: "Remote / US" },
               { title: "Product Designer", team: "User Experience", location: "New York, NY" },
               { title: "Escrow Compliance Analyst", team: "Finance", location: "London, UK" },
               { title: "Logistics Coordinator", team: "Operations", location: "Miami, FL" }
            ].map((job, i) => (
               <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center hover:border-blue-300 transition-colors cursor-pointer group">
                  <div>
                     <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                     <div className="flex gap-4 text-sm text-slate-500 mt-2 font-medium">
                        <span>{job.team}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors hidden md:block" />
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export function Press() {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeroHeader title="Press & Media" subtitle="Latest news, announcements, and media assets." />
      <div className="max-w-5xl mx-auto px-6 py-16">
         <h2 className="text-2xl font-bold text-slate-900 mb-8">Recent Press Releases</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
               { date: "Oct 01, 2025", title: "Bid.Cars Surpasses $2 Billion in Lifetime Escrow Volume" },
               { date: "Aug 15, 2025", title: "New AI-Driven Valuation Model Deploying Across Network" },
               { date: "Jul 04, 2025", title: "Expansion into European Markets Accelerates with London Hub" },
               { date: "May 20, 2025", title: "Bid.Cars Launches Institutional Fleet Dispersal Protocol" }
            ].map((news, i) => (
               <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-bold text-slate-400 mb-2">{news.date}</div>
                  <h3 className="text-lg font-bold text-slate-900">{news.title}</h3>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

const LegalDoc = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-4xl mx-auto px-6 py-16">
       <h1 className="text-4xl font-display font-bold text-slate-900 mb-8 tracking-tight">{title}</h1>
       <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
          {children}
       </div>
    </div>
  </div>
);

export function PrivacyPolicy() {
  return (
    <LegalDoc title="Privacy Policy">
       <p className="font-bold text-slate-500 mb-8">Last Updated: January 1, 2026</p>
       <h3>1. Data Collection & Escrow Ledger</h3>
       <p>We collect essential identity verification data to prevent fraud on the auction block. Your financial data, specifically escrow deposit histories, are logged securely and are never sold to external marketing networks.</p>
       <h3>2. Information Usage</h3>
       <p>We utilize network analytics strictly to optimize auction execution latency and to secure routing protocols against adversarial actors. Identity traces are maintained in compliance with global KYC/AML mandates.</p>
       <h3>3. Data Retention</h3>
       <p>Sovereign data nodes are maintained securely. You may request account deletion, subject to regulatory waiting periods for financial transactions.</p>
    </LegalDoc>
  );
}

export function TermsOfService() {
  return (
    <LegalDoc title="Terms of Service">
       <p className="font-bold text-slate-500 mb-8">Last Updated: January 1, 2026</p>
       <h3>1. Bid Execution Liability</h3>
       <p>A bid submitted through our digital infrastructure is a legally binding contract. Failure to remit funds for a won lot within 72 hours results in immediate forfeiture of your escrow deposit and permanent account banishment.</p>
       <h3>2. As-Is Vehicle Stipulation</h3>
       <p>All assets are sold "AS IS, WHERE IS" with all faults. Asset imagery and inspection reports are provided as a courtesy without guarantee. The buyer assumes all risk associated with condition.</p>
       <h3>3. Escrow Maintenance</h3>
       <p>Users must maintain sufficient escrow balances to authorize bid submissions. The platform reserves the right to halt authorizations if suspicious volumetric trading patterns are detected.</p>
    </LegalDoc>
  );
}

export function CookiePolicy() {
   return (
     <LegalDoc title="Cookie Policy">
        <p className="font-bold text-slate-500 mb-8">Last Updated: January 1, 2026</p>
        <h3>Session Synchronization</h3>
        <p>Bid.Cars utilizes localized browser caching and session cookies strictly for maintaining synchronized state between your client terminal and our bidding servers. We do not engage in cross-site tracking or behavioral monitoring outside of our ecosystem.</p>
     </LegalDoc>
   );
 }
