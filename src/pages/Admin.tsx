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

export function Admin() {
  const [error, setError] = React.useState("");
  const [lots, setLots] = React.useState<any>(null);
  const [allocations, setAllocations] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [escrowRequests, setEscrowRequests] = React.useState<any[]>([]);
  const [escrowWallets, setEscrowWallets] = React.useState<any[]>([]);
  const [escrowInvoices, setEscrowInvoices] = React.useState<any[]>([]);
  const [invoiceAccounts, setInvoiceAccounts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<'overview' | 'assets' | 'vetting' | 'escrow'>('overview');
  
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
    const finalStatus = requestedStatus === 'active' || requestedStatus === 'approved' ? 'active' : 'rejected';
    console.log(`[APPROVAL] frontend app status update requested: ID ${id}, Status: ${finalStatus}`);
    await fetch("/api/admin/applications/vet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: finalStatus })
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
            { id: 'vetting', icon: Users, label: 'Identity Vetting', count: pendingApps.length },
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
                       <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Users className="w-5 h-5"/> Application Queue</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {applications.filter(a => a.status === 'pending').length > 0 ? (
                          applications.filter(a => a.status === 'pending').map(app => (
                             <div key={app.email} className="enterprise-card p-6 border-t-[4px] border-t-purple-500 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                   <div>
                                      <h4 className="font-bold text-slate-900">{app.name}</h4>
                                      <p className="text-xs font-mono text-slate-500 mt-1">{app.email}</p>
                                   </div>
                                   <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase px-2 py-1 rounded">Pending</div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                   <div className="flex justify-between"><span className="text-slate-400 font-semibold">Entity:</span> {app.businessName || 'Individual'}</div>
                                   <div className="flex justify-between"><span className="text-slate-400 font-semibold">Reg Phone:</span> {app.phone}</div>
                                </div>
                                <div className="mt-auto flex gap-3">
                                   <button onClick={() => updateAppStatus(app.id, 'active')} className="flex-1 enterprise-button enterprise-button-primary shadow-none py-2 px-0 text-sm">Approve</button>
                                   <button onClick={() => updateAppStatus(app.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 py-2">Deny</button>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="col-span-full enterprise-card p-12 text-center text-slate-400 font-medium border-dashed border-2 bg-slate-50/50 shadow-none">
                             Application queue is empty.
                          </div>
                       )}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'escrow' && (
                 <motion.div key="escrow" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                       <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><CreditCard className="w-5 h-5"/> Escrow & Funding Management</h3>
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

      </AnimatePresence>
    </div>
  );
}
