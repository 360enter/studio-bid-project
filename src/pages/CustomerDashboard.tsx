import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, CreditCard, ChevronRight, FileText, Bell, Car, History, Navigation, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [wallet, setWallet] = React.useState<any>(null);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Funding form state
  const [showFundForm, setShowFundForm] = React.useState(false);
  const [fundAmount, setFundAmount] = React.useState("");
  const [fundMethod, setFundMethod] = React.useState("Bank Transfer");
  const [fundLoading, setFundLoading] = React.useState(false);

  const [lastNotifTime, setLastNotifTime] = React.useState(new Date().toISOString());
  const [activeInvoice, setActiveInvoice] = React.useState<any>(null);

  React.useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('apex_user');
      if (!userStr) return;
      const u = JSON.parse(userStr);
      setUser(u);

      const res = await fetch(`/api/escrow/wallet/${u.id}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setRequests(data.requests || []);
        setInvoices(data.invoices || []);
        setTransactions(data.transactions || []);
      }
      
      const notifRes = await fetch(`/api/notifications/${u.id}?since=${lastNotifTime}`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success && notifData.notifications.length > 0) {
           notifData.notifications.forEach((n: any) => {
              if ("Notification" in window && Notification.permission === "granted") {
                 new Notification("Apex Escrow", { body: n.message, icon: "/favicon.ico" });
              }
              try {
                 const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
                 audio.play().catch(() => {});
              } catch(e) {}
           });
           setLastNotifTime(new Date().toISOString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || isNaN(Number(fundAmount))) return;
    setFundLoading(true);

    try {
      const res = await fetch("/api/escrow/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          amount: fundAmount,
          payment_method: fundMethod
        })
      });

      if (res.ok) {
        setShowFundForm(false);
        setFundAmount("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFundLoading(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-2">
           <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 truncate">{user?.name || 'User'}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={cn("inline-block w-2 h-2 rounded-full", user?.status === "active" ? "bg-emerald-500" : "bg-orange-500")}></span>
                       <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{user?.status === "active" ? "Verified" : "Pending"}</span>
                    </div>
                 </div>
              </div>
           </div>

           <nav className="space-y-1">
             {[
               { id: 'overview', label: 'Dashboard Home', icon: Shield },
               { id: 'wallet', label: 'Escrow Wallet', icon: CreditCard },
               { id: 'bids', label: 'My Bids', icon: History },
               { id: 'invoices', label: 'Invoices', icon: FileText },
             ].map(item => (
               <button 
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                   activeTab === item.id ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                 )}
               >
                 <item.icon className="w-4 h-4" />
                 {item.label}
               </button>
             ))}
           </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 space-y-6">
           {activeTab === 'overview' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
                      <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Available Balance</div>
                      <div className="text-3xl font-bold text-slate-900">${(wallet?.available_balance || 0).toLocaleString()}</div>
                      <button onClick={() => setActiveTab('wallet')} className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1 hover:underline">Manage Wallet <ChevronRight className="w-3 h-3"/></button>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-600">
                      <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Active Bids</div>
                      <div className="text-3xl font-bold text-slate-900">0</div>
                      <Link to="/" className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1 hover:underline">View Live Auctions <ChevronRight className="w-3 h-3"/></Link>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-purple-600">
                      <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Pending Invoices</div>
                      <div className="text-3xl font-bold text-slate-900">{invoices.filter(i => i.status === 'pending').length}</div>
                      <button onClick={() => setActiveTab('invoices')} className="text-xs font-bold text-purple-600 mt-4 flex items-center gap-1 hover:underline">View Invoices <ChevronRight className="w-3 h-3"/></button>
                   </div>
                </div>

                {user?.status !== 'active' && (
                  <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl flex items-start gap-4">
                    <Clock className="w-6 h-6 text-orange-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-orange-900">Account Pending Verification</h4>
                      <p className="text-orange-800 text-sm mt-1">Your account is currently under review by our administration team. You will be able to place bids once approved and your escrow is funded.</p>
                    </div>
                  </div>
                )}
             </motion.div>
           )}

           {activeTab === 'wallet' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-display font-bold text-slate-900">Escrow Wallet</h2>
                   <button onClick={() => setShowFundForm(true)} className="enterprise-button enterprise-button-primary shadow-sm text-sm py-2 px-5">Fund Escrow Wallet</button>
                </div>

                {showFundForm && (
                  <div className="bg-white p-6 rounded-2xl border border-blue-200 bg-blue-50/30">
                     <h3 className="font-bold text-slate-900 mb-4">Request Funding Invoice</h3>
                     <form onSubmit={handleFund} className="space-y-4 max-w-sm">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Amount (USD)</label>
                           <input type="number" required value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="enterprise-input bg-white" placeholder="10000" min="1000" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Payment Method</label>
                           <select value={fundMethod} onChange={e => setFundMethod(e.target.value)} className="enterprise-input bg-white">
                              <option>Bank Wire Transfer</option>
                              <option>ACH</option>
                              <option>Cryptocurrency</option>
                           </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                           <button type="submit" disabled={fundLoading} className="enterprise-button enterprise-button-primary py-2 px-6 flex-1">
                             {fundLoading ? "Processing..." : "Generate Invoice"}
                           </button>
                           <button type="button" onClick={() => setShowFundForm(false)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                        </div>
                     </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Available to Bid</div>
                      <div className="text-2xl font-bold text-slate-900">${(wallet?.available_balance || 0).toLocaleString()}</div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pending Deposits</div>
                      <div className="text-2xl font-bold text-slate-900">${(wallet?.pending_balance || 0).toLocaleString()}</div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Locked (Active Bids)</div>
                      <div className="text-2xl font-bold text-slate-900">${(wallet?.locked_balance || 0).toLocaleString()}</div>
                   </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                   <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                   </div>
                   {transactions.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No transaction history found.</div>
                   ) : (
                      <div className="divide-y divide-slate-100">
                         {transactions.map((tx: any) => (
                           <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                              <div>
                                 <div className="font-bold text-slate-900 flex items-center gap-2">
                                    {tx.type === 'deposit' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                    <span className="capitalize">{tx.type}</span>
                                 </div>
                                 <div className="text-xs font-medium text-slate-500 mt-0.5">{tx.description}</div>
                              </div>
                              <div className="text-right">
                                 <div className={cn("font-bold", tx.type === 'deposit' ? "text-emerald-600" : "text-slate-900")}>
                                    {tx.type === 'deposit' ? '+' : ''}${tx.amount.toLocaleString()}
                                 </div>
                                 <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">{new Date(tx.created_at).toLocaleDateString()}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                   )}
                </div>
             </motion.div>
           )}

           {activeTab === 'invoices' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900">Invoices</h2>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                   {invoices.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No invoices found.</div>
                   ) : (
                      <div className="divide-y divide-slate-100">
                         {invoices.map((inv: any) => {
                           const isExpired = new Date(inv.expires_at).getTime() < Date.now();
                           const calcStatus = (inv.status === 'pending' && isExpired) ? 'expired' : inv.status;
                           
                           return (
                           <div key={inv.id} className="flex flex-col hover:bg-slate-50 transition-colors">
                            <div className="p-5 px-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                               <div>
                                  <div className="flex items-center gap-3">
                                    <div className="font-bold text-slate-900 font-mono">INV-{inv.id.substring(3, 11).toUpperCase()}</div>
                                    <span className={cn(
                                      "text-[10px] px-2 py-0.5 rounded-[4px] uppercase font-bold tracking-wider",
                                      calcStatus === 'paid' ? "bg-emerald-100 text-emerald-700" :
                                      calcStatus === 'expired' ? "bg-red-100 text-red-700" :
                                      "bg-orange-100 text-orange-700"
                                    )}>
                                      {calcStatus}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium mt-1">
                                     {calcStatus === 'pending' ? (
                                        <span className="text-orange-600 font-bold">Expires: {new Date(inv.expires_at).toLocaleString()}</span>
                                     ) : (
                                        <span>Created: {new Date(inv.created_at).toLocaleDateString()}</span>
                                     )}
                                  </div>
                               </div>
                               <div className="flex items-center gap-6">
                                  <div className="text-right">
                                     <div className="font-bold text-lg text-slate-900">${inv.amount.toLocaleString()}</div>
                                  </div>
                                  <button onClick={() => setActiveInvoice(activeInvoice === inv.id ? null : inv.id)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
                                    {activeInvoice === inv.id ? 'Close' : 'View Details'} <ChevronRight className={cn("w-4 h-4 transition-transform", activeInvoice === inv.id && "rotate-90")}/>
                                  </button>
                               </div>
                            </div>
                            
                            {activeInvoice === inv.id && (
                               <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col pt-4">
                                  {calcStatus === 'expired' ? (
                                     <div className="text-red-600 font-bold text-sm text-center py-4">This invoice has expired. Please submit a new funding request.</div>
                                  ) : calcStatus === 'paid' ? (
                                     <div className="text-emerald-600 font-bold text-sm text-center py-4 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5"/> Payment has been processed and applied to your wallet.</div>
                                  ) : (
                                     <div className="space-y-6">
                                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
                                           <Clock className="w-5 h-5 shrink-0 text-yellow-600" />
                                           <p>Please initiate payment before the expiration timer runs out. Once the transfer is complete, it may take up to 24 hours for our team to verify and clear the funds.</p>
                                        </div>
                                        
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3">
                                           <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Payment Instructions</h3>
                                           {inv.account_type?.includes('Crypto') || inv.crypto_address ? (
                                              <>
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Network</span>
                                                    <span className="font-mono text-slate-900">{inv.crypto_network || 'Ethereum'}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Asset Type</span>
                                                    <span className="font-mono text-slate-900">{inv.account_type}</span>
                                                 </div>
                                                 <div className="flex flex-col gap-1 text-sm mt-3 pt-3 border-t border-slate-100">
                                                    <span className="text-slate-500 font-bold">Deposit Address</span>
                                                    <div className="bg-slate-100 p-2 rounded text-slate-900 font-mono text-xs break-all flex justify-between items-center select-all">
                                                       {inv.crypto_address}
                                                    </div>
                                                 </div>
                                              </>
                                           ) : (
                                              <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Bank Name</span>
                                                    <span className="text-slate-900 font-semibold">{inv.bank_name}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Account Holder</span>
                                                    <span className="text-slate-900">{inv.account_holder}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Account Number</span>
                                                    <span className="font-mono text-slate-900 select-all">{inv.account_number}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-bold">Routing Number</span>
                                                    <span className="font-mono text-slate-900 select-all">{inv.routing_number}</span>
                                                 </div>
                                                 {inv.swift_code && (
                                                   <div className="flex justify-between items-center text-sm">
                                                      <span className="text-slate-500 font-bold">SWIFT Code</span>
                                                      <span className="font-mono text-slate-900 select-all">{inv.swift_code}</span>
                                                   </div>
                                                 )}
                                              </>
                                           )}
                                           <div className="flex justify-between items-center text-sm border-t border-slate-100 mt-2 pt-3">
                                               <span className="text-slate-500 font-bold">Reference / Memo ID</span>
                                               <span className="font-mono text-slate-900 font-bold select-all bg-yellow-100 px-2 py-0.5 rounded text-orange-800">INV-{inv.id.substring(3, 11).toUpperCase()}</span>
                                           </div>
                                        </div>
                                     </div>
                                  )}
                               </div>
                            )}
                           </div>
                         )})}
                      </div>
                   )}
                </div>
             </motion.div>
           )}

        </div>
      </div>
    </div>
  );
}
