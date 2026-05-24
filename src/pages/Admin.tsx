import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, Users, Inbox, CheckCircle, AlertCircle, LogOut, 
  Plus, Trash2, Link as LinkIcon, MessageSquare, 
  Car, Activity, Home, Database, CreditCard, ChevronRight,
  TrendingUp, DownloadCloud
} from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function Admin({ initialTab = 'overview' }: { initialTab?: 'overview' | 'assets' | 'vetting' | 'escrow' }) {
  const [error, setError] = React.useState("");
  const [lots, setLots] = React.useState<any>(null);
  const [allocations, setAllocations] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [escrowRequests, setEscrowRequests] = React.useState<any[]>([]);
  const [escrowWallets, setEscrowWallets] = React.useState<any[]>([]);
  const [escrowInvoices, setEscrowInvoices] = React.useState<any[]>([]);
  const [invoiceAccounts, setInvoiceAccounts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<'overview' | 'assets' | 'vetting' | 'escrow'>(initialTab);
  
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  const [userFilter, setUserFilter] = React.useState<'all' | 'pending' | 'active' | 'rejected' | 'suspended_banned'>('all');
  const [resetPasswordTarget, setResetPasswordTarget] = React.useState<any>(null);
  const [fundTarget, setFundTarget] = React.useState<any>(null);
  
  const [messageTarget, setMessageTarget] = React.useState<any>(null);
  const [invoiceRequest, setInvoiceRequest] = React.useState<any>(null);
  const [msgContent, setMsgContent] = React.useState({ title: '', message: '', type: 'info' });

  const [editingLot, setEditingLot] = React.useState<any>(null);
  const [newLot, setNewLot] = React.useState<any>(null);
  const [csvStatus, setCsvStatus] = React.useState("");
  const [uploadingCsv, setUploadingCsv] = React.useState(false);

  React.useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCsvUpload = async (file: File) => {
    setUploadingCsv(true);
    setCsvStatus("Processing imports...");
    try {
      const text = await file.text();
      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text })
      });
      const data = await res.json();
      if (res.ok) {
        setCsvStatus(`Successfully imported ${data.count} vehicles.`);
        fetchDashboard();
      } else {
        setCsvStatus(`Import failed: ${data.error}`);
      }
    } catch (e: any) {
      setCsvStatus(`System Error: ${e.message}`);
    } finally {
      setUploadingCsv(false);
      setTimeout(() => setCsvStatus(""), 6000);
    }
  };

  const fetchDashboard = async () => {
    try {
      const [lotsRes, appsRes, allocRes, escrowRes] = await Promise.all([
        fetch("/api/lots"),
        fetch("/api/admin/applications"),
        fetch("/api/allocations"),
        fetch("/api/admin/escrow")
      ]);
      setLots(await lotsRes.json());
      setApplications(await appsRes.json());
      setAllocations(await allocRes.json());
      
      const escrowData = await escrowRes.json();
      if (escrowData.success) {
         setEscrowRequests(escrowData.requests);
         setEscrowWallets(escrowData.wallets);
         setEscrowInvoices(escrowData.invoices);
         setInvoiceAccounts(escrowData.invoiceAccounts || []);
      }
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const saveLot = async (lot: any, isNew = false) => {
    const url = isNew ? "/api/admin/lots/create" : `/api/admin/lots/${lot.id}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lot)
    });
    setEditingLot(null);
    setNewLot(null);
    fetchDashboard();
  };

  const deleteLot = async (lotId: string) => {
    if (!window.confirm(`Permanently delete lot ${lotId}?`)) return;
    await fetch(`/api/admin/lots/${lotId}`, { method: "DELETE" });
    fetchDashboard();
  };

  const updateAppStatus = async (id: string, requestedStatus: string) => {
    console.log(`[APPROVAL] frontend app status update requested: ID ${id}, Status: ${requestedStatus}`);
    await fetch("/api/admin/applications/vet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: requestedStatus })
    });
    fetchDashboard();
  };

  const updateDeposit = async (id: string, amount: number) => {
     await fetch("/api/admin/users/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deposit_balance: amount })
     });
     setMsgContent(prev => ({...prev, title: 'Deposit Updated', message: `Set to ${amount}`, type: 'success'}));
     setMessageTarget(id);
     fetchDashboard();
  };

  const lotArray = lots ? Object.values(lots) : [];
  const pendingApps = applications.filter(a => a.status === 'pending');
  const totalVolume = lotArray.reduce((acc: number, cur: any) => acc + (Number(cur.currentBid) || 0), 0) as number;

  const mockChartData = [
     { name: 'Mon', bids: 4000, users: 240 },
     { name: 'Tue', bids: 3000, users: 139 },
     { name: 'Wed', bids: 2000, users: 980 },
     { name: 'Thu', bids: 2780, users: 390 },
     { name: 'Fri', bids: 1890, users: 480 },
     { name: 'Sat', bids: 2390, users: 380 },
     { name: 'Sun', bids: 3490, users: 430 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[100vh]">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
               <span className="text-white font-display font-bold text-lg">B</span>
             </div>
             <span className="text-xl font-display font-bold tracking-tight text-white">Bid.Cars <span className="font-light text-slate-500">Admin</span></span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'assets', icon: Database, label: 'Vehicles & Lots', count: lotArray.length },
            { id: 'vetting', icon: Users, label: 'User Management', count: pendingApps.length },
            { id: 'escrow', icon: CreditCard, label: 'Escrow Wallets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all font-semibold text-sm",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" /> {tab.label}
              </div>
              {tab.count !== undefined && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                )}>{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => window.location.reload()} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-semibold text-sm">
             <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden text-slate-900">
         <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
            <div>
               <h1 className="text-xl font-bold capitalize flex items-center gap-2">
                  <Home className="w-5 h-5 text-slate-400" /> / {activeTab} Control
               </h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Systems Online
               </div>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
               
               {activeTab === 'overview' && (
                 <motion.div key="overview" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="enterprise-card p-6 border-l-[4px] border-l-blue-600 flex flex-col justify-between h-36">
                          <div className="text-slate-500 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                             <Database className="w-4 h-4" /> Active Lots
                          </div>
                          <div className="text-4xl font-display font-bold text-slate-900">{lotArray.length}</div>
                       </div>
                       <div className="enterprise-card p-6 border-l-[4px] border-l-emerald-500 flex flex-col justify-between h-36">
                          <div className="text-slate-500 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                             <TrendingUp className="w-4 h-4" /> Current Volume
                          </div>
                          <div className="text-4xl font-display font-bold text-emerald-600">{formatCurrency(totalVolume)}</div>
                       </div>
                       <div className="enterprise-card p-6 border-l-[4px] border-l-purple-500 flex flex-col justify-between h-36">
                          <div className="text-slate-500 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                             <Users className="w-4 h-4" /> Pending Vetting
                          </div>
                          <div className="text-4xl font-display font-bold text-purple-600">{pendingApps.length}</div>
                       </div>
                    </div>

                    <div className="enterprise-card p-6 h-96">
                       <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-slate-400" /> Platform Activity Network
                       </h3>
                       <ResponsiveContainer width="100%" height="80%">
                          <LineChart data={mockChartData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                             <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                             <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                             />
                             <Line type="monotone" dataKey="bids" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>

                 </motion.div>
               )}

               {activeTab === 'assets' && (
                 <motion.div key="assets" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Car className="w-5 h-5"/> Vehicle Inventory</h3>
                       <div className="flex gap-3">
                          <label className="enterprise-button border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer overflow-hidden py-2 px-4 shadow-none">
                             <input type="file" accept=".csv" className="hidden" onChange={e => {
                                if (e.target.files?.[0]) handleCsvUpload(e.target.files[0]);
                             }} />
                             <div className="flex items-center gap-2">
                                <DownloadCloud className="w-4 h-4" />
                                {uploadingCsv ? "UPLOADING..." : "Bulk CSV Upload"}
                             </div>
                          </label>
                          <button onClick={() => setNewLot({ id: `LT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, name: '', image: '', currentBid: 0, bidCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), specifications: {}, conditionInfo: {}, sellerInfo: {} })} className="enterprise-button enterprise-button-primary py-2 px-4 shadow-none">
                             <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                          </button>
                       </div>
                    </div>
                    
                    {csvStatus && (
                       <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold">
                          {csvStatus}
                       </div>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                             <tr>
                                <th className="p-4">Lot Node</th>
                                <th className="p-4">Title / Name</th>
                                <th className="p-4">Current Value</th>
                                <th className="p-4">Time Left</th>
                                <th className="p-4 text-center">Settings</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {lotArray.length > 0 ? (
                                lotArray.map((lot: any) => (
                                  <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors group">
                                     <td className="p-4 font-mono font-bold text-slate-700">{lot.id}</td>
                                     <td className="p-4 font-semibold text-slate-900">{lot.name}</td>
                                     <td className="p-4 text-emerald-600 font-bold">{formatCurrency(lot.currentBid)}</td>
                                     <td className="p-4 text-slate-500 font-mono text-xs">
                                        {new Date(lot.expiresAt).getTime() < Date.now() ? <span className="text-red-500">EXPIRED</span> : new Date(lot.expiresAt).toLocaleString()}
                                     </td>
                                     <td className="p-4">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button onClick={() => setEditingLot(lot)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"><LinkIcon className="w-4 h-4"/></button>
                                           <button onClick={() => deleteLot(lot.id)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                     </td>
                                  </tr>
                                ))
                             ) : (
                                <tr>
                                   <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No active vehicles found in registry.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'vetting' && (
                 <motion.div key="vetting" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                       <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Users className="w-5 h-5"/> Users & Clearance Directory</h3>
                    </div>
                    
                    
                     <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm border-collapse font-sans">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                 <tr>
                                    <th className="p-4">Applicant / Client Details</th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4">Vetting Status</th>
                                    <th className="p-4">KYC State</th>
                                    <th className="p-4">Wallet Balance</th>
                                    <th className="p-4 text-center">Admin Controls Hierarchy</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                 {(() => {
                                    const filtered = applications.filter((app) => {
                                       if (userFilter === 'pending') return app.status === 'pending';
                                       if (userFilter === 'active') return app.status === 'active';
                                       if (userFilter === 'rejected') return app.status === 'rejected';
                                       if (userFilter === 'suspended_banned') return app.status === 'suspended' || app.status === 'banned';
                                       return true;
                                    });

                                    if (filtered.length === 0) {
                                       return (
                                          <tr>
                                             <td colSpan={6} className="p-12 text-center text-slate-400 font-medium font-sans animate-pulse">
                                                No users match the selected directory filter.
                                             </td>
                                          </tr>
                                       );
                                    }

                                    return filtered.map((app) => (
                                       <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="p-4 text-left">
                                             <div className="font-bold text-slate-900 text-sm">{app.name}</div>
                                             <div className="text-slate-400 font-mono mt-0.5">{app.email}</div>
                                             <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 font-sans">
                                                <span>🌍 {app.country || 'USA'}</span>
                                                <span className="text-slate-300">&bull;</span>
                                                <span>📅 Joined {app.timestamp ? new Date(app.timestamp).toLocaleDateString() : 'N/A'}</span>
                                             </div>
                                          </td>
                                          <td className="p-4 font-mono text-left">
                                             <div>{app.phone || 'N/A'}</div>
                                             <div className="text-[10px] text-slate-400 mt-0.5">UID: {app.id}</div>
                                          </td>
                                          <td className="p-4 text-left">
                                             <div className="mb-2">
                                                <span className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider " + (
                                                   app.status === 'active' ? "bg-emerald-100 text-emerald-800" :
                                                   app.status === 'pending' ? "bg-amber-100 text-amber-800" :
                                                   app.status === 'suspended' ? "bg-orange-100 text-orange-850 text-orange-800" :
                                                   app.status === 'banned' ? "bg-red-900 text-red-50" :
                                                   "bg-red-100 text-red-800"
                                                )}>
                                                   {app.status}
                                                </span>
                                             </div>
                                             
                                             <select 
                                               value={app.status || 'pending'}
                                               onChange={(e) => updateAppStatus(app.id, e.target.value)}
                                               className="border border-slate-200 p-1 rounded bg-white text-[10px] font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                                             >
                                                <option value="pending">Pending Review</option>
                                                <option value="active">Active Approved</option>
                                                <option value="rejected">Rejected Access</option>
                                                <option value="suspended">Suspended Access</option>
                                                <option value="banned">Full Ban Status</option>
                                             </select>
                                          </td>
                                          <td className="p-4 text-left">
                                             <div className="mb-2">
                                                <span className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase " + (
                                                   app.kyc_status === 'verified' ? "bg-blue-100 text-blue-800" :
                                                   app.kyc_status === 'pending_verification' ? "bg-yellow-105 bg-yellow-100 text-yellow-850 text-yellow-800" :
                                                   app.kyc_status === 'rejected' ? "bg-red-105 bg-red-100 text-red-805 text-red-800" :
                                                   "bg-slate-105 bg-slate-105 bg-slate-100 text-slate-600"
                                                )}>
                                                   {app.kyc_status || 'unverified'}
                                                </span>
                                             </div>
                                             
                                             <select 
                                               value={app.kyc_status || 'unverified'}
                                               onChange={async (e) => {
                                                  await fetch("/api/admin/users/update-kyc", {
                                                     method: "POST",
                                                     headers: {"Content-Type": "application/json"},
                                                     body: JSON.stringify({ id: app.id, status: e.target.value })
                                                  });
                                                  fetchDashboard();
                                               }}
                                               className="border border-slate-200 p-1 rounded bg-white text-[10px] font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                                             >
                                                <option value="unverified">Unverified</option>
                                                <option value="pending_verification">Pending Check</option>
                                                <option value="verified">Verified Profile</option>
                                                <option value="rejected">Declined Profile</option>
                                             </select>
                                          </td>
                                          <td className="p-4 text-left">
                                             <div className="font-bold text-slate-900 text-sm">
                                                ${(app.wallet_balance || 0).toLocaleString()}
                                             </div>
                                             <div className="flex items-center gap-1.5 mt-1.5">
                                                {app.is_frozen ? (
                                                   <span className="bg-red-50 text-red-750 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                      ❄️ WALLET FROZEN
                                                   </span>
                                                ) : (
                                                   <span className="bg-emerald-50 text-emerald-705 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                      🟢 Wallet Active
                                                   </span>
                                                )}
                                             </div>

                                             <div className="flex gap-1.5 mt-2">
                                                <button 
                                                  onClick={() => setFundTarget(app)}
                                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]"
                                                >Fund / Adjust</button>
                                                
                                                <button 
                                                  onClick={async () => {
                                                     await fetch("/api/admin/users/freeze-wallet", {
                                                        method: "POST",
                                                        headers: {"Content-Type": "application/json"},
                                                        body: JSON.stringify({ userId: app.id, isFrozen: !app.is_frozen })
                                                     });
                                                     fetchDashboard();
                                                  }}
                                                  className={"px-1.5 py-0.5 rounded text-[10px] font-bold " + (
                                                     app.is_frozen 
                                                       ? "bg-emerald-50 text-emerald-750 text-emerald-700 hover:bg-emerald-100" 
                                                       : "bg-red-50 text-red-750 text-red-700 hover:bg-red-100"
                                                  )}
                                                >
                                                   {app.is_frozen ? "Unfreeze" : "Freeze"}
                                                </button>
                                             </div>
                                          </td>
                                          <td className="p-4 text-center">
                                             <div className="flex flex-wrap gap-1.5 justify-center">
                                                <button 
                                                   onClick={() => setMessageTarget(app)}
                                                   className="bg-blue-50 text-blue-600 hover:bg-blue-105 hover:bg-blue-100 px-2 py-1 rounded text-[10px] font-bold"
                                                >
                                                   💬 Message
                                                </button>
                                                
                                                <button 
                                                   onClick={async () => {
                                                      const title = "Urgent Security Attention Required";
                                                      const message = "Please contact Apex Support Desk immediately regarding escrow balance compliance checks.";
                                                      await fetch("/api/admin/users/resend-alert", {
                                                         method: "POST",
                                                         headers: {"Content-Type": "application/json"},
                                                         body: JSON.stringify({ userId: app.id, title, message })
                                                      });
                                                      alert("Force alert and system sound ping sent to visitor dashboard!");
                                                   }}
                                                   className="bg-amber-50 text-amber-605 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded text-[10px] font-bold"
                                                   title="Resend attention-grabbing alert popup sound to visitor dashboard"
                                                >
                                                   📢 Force Alert
                                                </button>

                                                <button 
                                                   onClick={() => setResetPasswordTarget(app)}
                                                   className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded text-[10px] font-bold"
                                                >
                                                   🔑 Reset Pass
                                                </button>

                                                <button 
                                                   onClick={() => setInvoiceRequest({ id: '', user_id: app.id, amount: 1000, fullname: app.name, email: app.email })}
                                                   className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-1 rounded text-[10px] font-bold"
                                                >
                                                   🧾 Invoice
                                                </button>

                                                <button 
                                                   onClick={async () => {
                                                      if (!window.confirm("Are you absolutely sure you want to permanently delete user " + app.name + "? This will purge their wallets.")) return;
                                                      await fetch("/api/admin/users/delete", {
                                                         method: "POST",
                                                         headers: {"Content-Type": "application/json"},
                                                         body: JSON.stringify({ id: app.id })
                                                      });
                                                      fetchDashboard();
                                                   }}
                                                   className="bg-red-50 text-red-650 text-red-600 hover:bg-red-105 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold"
                                                >
                                                   🗑️ Delete
                                                </button>
                                             </div>
                                          </td>
                                       </tr>
                                    ));
                                 })()}
                              </tbody>
                           </table>
                        </div>
                     </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Funding Requests */}
                       <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                             <h4 className="font-bold text-slate-800 flex items-center gap-2">Funding Requests</h4>
                             <span className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase rounded px-2 py-0.5">{escrowRequests.filter(r => r.status === 'pending').length} Pending</span>
                          </div>
                          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                             {escrowRequests.filter(r => r.status === 'pending').length > 0 ? (
                                escrowRequests.filter(r => r.status === 'pending').map(req => (
                                  <div key={req.id} className="p-4 px-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                                     <div>
                                        <div className="font-bold text-slate-900">{req.fullname || req.email}</div>
                                        <div className="text-xs font-medium text-slate-500 mt-1">{req.payment_method} &middot; {new Date(req.created_at).toLocaleDateString()}</div>
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <div className="text-emerald-600 font-bold text-lg">${req.amount.toLocaleString()}</div>
                                        <div className="flex gap-2">
                                           <button 
                                              onClick={() => setInvoiceRequest(req)}
                                              className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100"
                                           >Create Invoice</button>
                                           <button 
                                              onClick={async () => {
                                                await fetch("/api/admin/escrow/reject", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ requestId: req.id }) });
                                                fetchDashboard();
                                              }}
                                              className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-100"
                                           >Reject</button>
                                        </div>
                                     </div>
                                  </div>
                                ))
                             ) : (
                                <div className="p-8 text-center text-slate-500 text-sm">No pending requests.</div>
                             )}
                          </div>
                       </div>

                       {/* Pending Invoices */}
                       <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                             <h4 className="font-bold text-slate-800 flex items-center gap-2">Invoices Awaiting Payment</h4>
                          </div>
                          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                             {escrowInvoices.filter(i => i.status === 'pending').length > 0 ? (
                                escrowInvoices.filter(i => i.status === 'pending').map(inv => (
                                  <div key={inv.id} className="p-4 px-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                                     <div>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                           {inv.fullname || inv.email}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">{inv.invoice_number}</div>
                                     </div>
                                     <div className="text-right">
                                        <div className="font-bold text-lg">${inv.amount.toLocaleString()}</div>
                                     </div>
                                  </div>
                                ))
                             ) : (
                                <div className="p-8 text-center text-slate-500 text-sm">No pending invoices.</div>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                       <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                          <h4 className="font-bold text-slate-800">Master Wallet Ledger</h4>
                       </div>
                       <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                             <tr>
                                <th className="p-4">Customer Identity</th>
                                <th className="p-4">Available (Unlocked)</th>
                                <th className="p-4">Locked (Bids)</th>
                                <th className="p-4">Pending</th>
                                <th className="p-4">Modify</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {escrowWallets.length > 0 ? (
                                escrowWallets.map(w => (
                                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                     <td className="p-4">
                                        <div className="font-bold text-slate-900">{w.fullname}</div>
                                        <div className="text-xs font-mono text-slate-500">{w.email}</div>
                                     </td>
                                     <td className="p-4 font-bold text-emerald-600">${w.available_balance.toLocaleString()}</td>
                                     <td className="p-4 font-bold text-slate-600">${w.locked_balance.toLocaleString()}</td>
                                     <td className="p-4 font-bold text-slate-600">${w.pending_balance.toLocaleString()}</td>
                                     <td className="p-4 flex gap-2">
                                        <button onClick={async () => {
                                           await fetch("/api/admin/escrow/adjust", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ walletId: w.id, amount: 10000, type: 'increase' }) });
                                           fetchDashboard();
                                        }} className="px-2 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded hover:bg-slate-200">+10k</button>
                                        <button onClick={async () => {
                                           await fetch("/api/admin/escrow/adjust", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ walletId: w.id, amount: 100000, type: 'increase' }) });
                                           fetchDashboard();
                                        }} className="px-2 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded hover:bg-slate-200">+100k</button>
                                     </td>
                                  </tr>
                                ))
                             ) : (
                                <tr>
                                   <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No wallets provisioned yet.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
               )}

            </AnimatePresence>
         </div>
      </main>

      {/* Editor Modal for Lots */}
      <AnimatePresence>
        {(editingLot || newLot) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-xl text-slate-900">{editingLot ? `Edit Node [${editingLot.id}]` : 'Provision New Vehicle'}</h3>
                 <button onClick={() => {setEditingLot(null); setNewLot(null)}} className="text-slate-400 hover:text-slate-700"><LogOut className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {(editingLot || newLot) && (() => {
                  const lot = editingLot || newLot;
                  const setLot = editingLot ? setEditingLot : setNewLot;
                  return (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Title / Name</label>
                        <input type="text" className="enterprise-input" value={lot.name} onChange={e => setLot({...lot, name: e.target.value})} placeholder="e.g. 2021 BMW M4 Comp" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Primary Image URL</label>
                        <input type="text" className="enterprise-input" value={lot.image || ''} onChange={e => setLot({...lot, image: e.target.value})} placeholder="https://..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Current Bid Base</label>
                        <input type="number" className="enterprise-input" value={lot.currentBid} onChange={e => setLot({...lot, currentBid: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expiration Runtime</label>
                        <input type="datetime-local" className="enterprise-input" value={lot.expiresAt ? new Date(lot.expiresAt).toISOString().slice(0,16) : ''} onChange={e => setLot({...lot, expiresAt: new Date(e.target.value).toISOString()})} />
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                 <button onClick={() => {setEditingLot(null); setNewLot(null)}} className="flex-1 enterprise-button enterprise-button-outline py-2">Cancel</button>
                 <button onClick={() => saveLot(editingLot || newLot, !!newLot)} className="flex-1 enterprise-button enterprise-button-primary py-2">Save Registry Node</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {invoiceRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-xl text-slate-900">Create Invoice</h3>
                 <button onClick={() => setInvoiceRequest(null)} className="text-slate-400 hover:text-slate-700"><LogOut className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                 <form id="create-invoice-form" onSubmit={async (e: any) => {
                    e.preventDefault();
                    await fetch("/api/admin/escrow/create-invoice", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                         requestId: invoiceRequest.id,
                         userId: invoiceRequest.user_id,
                         amount: invoiceRequest.amount,
                         assigned_account_id: e.target.assigned_account_id.value,
                         expires_in_mins: e.target.expires_in_mins.value,
                         notes: e.target.notes.value
                      })
                    });
                    setInvoiceRequest(null);
                    fetchDashboard();
                 }}>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Requested Amount</label>
                        <input type="text" className="enterprise-input bg-slate-100" value={`$${(invoiceRequest.amount || 0).toLocaleString()}`} readOnly />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Assign Payment Account</label>
                        <select name="assigned_account_id" className="enterprise-input" required>
                           <option value="">Select Account...</option>
                           {invoiceAccounts.map((acc: any) => (
                             <option key={acc.id} value={acc.id}>{acc.bank_name || acc.crypto_network} - {acc.account_type}</option>
                           ))}
                        </select>
                        {invoiceAccounts.length === 0 && <div className="text-red-500 text-xs mt-1">No accounts added yet. Add via DB.</div>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expiration Timer (Minutes)</label>
                        <select name="expires_in_mins" className="enterprise-input" defaultValue="60">
                           <option value="5">5 Minutes</option>
                           <option value="15">15 Minutes</option>
                           <option value="30">30 Minutes</option>
                           <option value="60">1 Hour</option>
                           <option value="1440">24 Hours</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Custom Notes</label>
                        <textarea name="notes" className="enterprise-input" placeholder="Optional notes..."></textarea>
                      </div>
                    </div>
                 </form>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                 <button onClick={() => setInvoiceRequest(null)} className="flex-1 enterprise-button enterprise-button-outline py-2">Cancel</button>
                 <button type="submit" form="create-invoice-form" className="flex-1 enterprise-button enterprise-button-primary py-2 bg-blue-600 hover:bg-blue-700 hover:border-blue-600">Send Invoice →</button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {messageTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col font-sans">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Message Visitor Desk</h3>
                 <button onClick={() => setMessageTarget(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
              </div>
              <div className="p-6 space-y-4 text-left">
                 <div className="bg-slate-50 p-3 rounded-lg text-xs border border-slate-100">
                    <div className="font-bold text-slate-700">Recipient: {messageTarget.name}</div>
                    <div className="font-mono text-slate-500">{messageTarget.email}</div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Message Title</label>
                    <input id="msg-title" type="text" className="enterprise-input text-xs" placeholder="e.g. Clearance Notification" defaultValue="Secure Portal Alert" />
                  </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Message Details</label>
                    <textarea id="msg-message" rows={4} className="enterprise-input text-xs" placeholder="Type your secure visitor notice or instructions..."></textarea>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Alert Color Preset</label>
                    <select id="msg-type" className="enterprise-input text-xs">
                       <option value="info">Info Accent (Blue)</option>
                       <option value="success">Success Clearance (Green)</option>
                       <option value="warning">Review Urgency (Orange)</option>
                       <option value="alert">Security Action (Red)</option>
                    </select>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                 <button onClick={() => setMessageTarget(null)} className="flex-1 border border-slate-200 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 bg-white">Cancel</button>
                 <button onClick={async () => {
                    const title = (document.getElementById("msg-title") as HTMLInputElement).value;
                    const message = (document.getElementById("msg-message") as HTMLTextAreaElement).value;
                    const type = (document.getElementById("msg-type") as HTMLSelectElement).value;
                    if (!message) { alert("Message content required"); return; }
                    
                    await fetch("/api/admin/send-notification", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ userId: messageTarget.id, title, message, type })
                    });
                    
                    setMessageTarget(null);
                    alert("Secure bulletin broadcasted real-time to active user panel and logged to visitor DB log!");
                 }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-2 font-mono">Broadcast Real-time</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {resetPasswordTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col font-sans text-left">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Admin Password Recovery Bypass</h3>
                 <button onClick={() => setResetPasswordTarget(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="bg-red-50 text-red-800 p-3 rounded-lg text-xs leading-relaxed border border-red-200">
                    🔒 Security Bypass protocol is active. This directly assigns a new security hash override in SQLite.
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Recipient Account</label>
                    <div className="font-bold text-slate-800">{resetPasswordTarget.name}</div>
                    <div className="text-slate-505 text-xs font-mono">{resetPasswordTarget.email}</div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">New Override Password Token</label>
                    <input id="new-override-pass" type="text" className="enterprise-input font-mono text-xs" placeholder="Enter custom pass..." defaultValue="ApexSecure2026!" />
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                 <button onClick={() => setResetPasswordTarget(null)} className="flex-1 border border-slate-200 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 bg-white">Cancel</button>
                 <button onClick={async () => {
                    const newPassword = (document.getElementById("new-override-pass") as HTMLInputElement).value;
                    if (!newPassword) { alert("New password required"); return; }
                    await fetch("/api/admin/users/reset-password", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ id: resetPasswordTarget.id, newPassword })
                    });
                    setResetPasswordTarget(null);
                    alert("SQLite credentials updated! User can now sign in with this credential immediately.");
                 }} className="flex-1 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold py-2 font-mono">Apply Hash Override</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {fundTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col font-sans text-left">
              <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Escrow Balance Adjustment</h3>
                 <button onClick={() => setFundTarget(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs leading-relaxed border border-emerald-100 flex items-center justify-between">
                    <div>
                       <span className="font-semibold block text-slate-600">Active escrow wallet config:</span>
                       <span className="font-mono text-slate-505 uppercase">{fundTarget.name || fundTarget.email}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] text-slate-400 block font-bold uppercase">Balance</span>
                       <span className="font-bold text-sm text-emerald-600">${(fundTarget.wallet_balance || 0).toLocaleString()}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Adjustment Direction</label>
                    <select id="fund-action" className="enterprise-input text-xs font-bold">
                       <option value="add">Add/Credit (+)</option>
                       <option value="subtract">Subtract/Debit (-)</option>
                       <option value="set">Overriding absolute balance (=)</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Adjustment Amount ($)</label>
                    <input id="fund-amount" type="number" className="enterprise-input text-sm font-bold" placeholder="e.g. 50000" defaultValue="10000" />
                 </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
                 <button onClick={() => setFundTarget(null)} className="flex-1 border border-slate-200 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 bg-white">Cancel</button>
                 <button onClick={async () => {
                    const action = (document.getElementById("fund-action") as HTMLSelectElement).value;
                    const amount = Number((document.getElementById("fund-amount") as HTMLInputElement).value);
                    if (isNaN(amount) || amount <= 0) { alert("Enter valid, positive amount."); return; }
                    
                    await fetch("/api/admin/users/fund-escrow", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ userId: fundTarget.id, amount, action })
                    });
                    
                    setFundTarget(null);
                    fetchDashboard();
                    alert("Manual funding adjustment verified, logged in ledgers, and applied!");
                 }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold py-2 font-mono">Apply Ledger Entry</button>
              </div>
            </motion.div>
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  );
}
