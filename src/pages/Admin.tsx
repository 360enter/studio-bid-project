import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Users, Inbox, CheckCircle, AlertCircle, LogOut, Plus, Trash2, Link as LinkIcon, MessageSquare } from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [credentials, setCredentials] = React.useState({ user: "", pass: "" });
  const [error, setError] = React.useState("");
  const [lots, setLots] = React.useState<any>(null);
  const [allocations, setAllocations] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'assets' | 'vetting' | 'social'>('assets');
  const [messageTarget, setMessageTarget] = React.useState<any>(null);
  const [msgContent, setMsgContent] = React.useState({ title: '', message: '', type: 'info' });

  const [editingLot, setEditingLot] = React.useState<any>(null);
  const [newLot, setNewLot] = React.useState<any>(null);
  const [newAllocation, setNewAllocation] = React.useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchDashboard();
      } else {
        setError("ACCESS_DENIED: Invalid Node Credentials");
      }
    } catch (e) {
      setError("SERVER_ERROR: Authentication Engine Offline");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const [lotsRes, appsRes, allocRes] = await Promise.all([
        fetch("/api/lots"),
        fetch("/api/admin/applications"),
        fetch("/api/allocations")
      ]);
      setLots(await lotsRes.json());
      setApplications(await appsRes.json());
      setAllocations(await allocRes.json());
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const triggerInvoice = async (lotId: string) => {
    await fetch("/api/admin/trigger-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotId })
    });
    fetchDashboard();
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

  const deleteLot = async (id: string) => {
    if (!confirm("Permanently de-allocate node?")) return;
    await fetch(`/api/admin/lots/${id}`, { method: "DELETE" });
    fetchDashboard();
  };

  const vetUser = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/applications/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        if (status === 'Approved') {
           await fetch("/api/admin/send-notification", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ 
               userId: id, 
               title: 'Access Granted', 
               message: 'Your institutional clearance has been approved. You are now authorized to participate in the primary market.',
               type: 'success'
             })
           });
        }
        fetchDashboard();
      }
    } catch (e) {
      console.error("Vet error", e);
    }
  };

  const sendDirectMessage = async () => {
    if (!messageTarget) return;
    try {
      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: messageTarget.id || messageTarget.uid, 
          ...msgContent 
        })
      });
      if (res.ok) {
        setMessageTarget(null);
        setMsgContent({ title: '', message: '', type: 'info' });
      }
    } catch (e) {
      console.error("Send message error", e);
    }
  };

  const manageAllocation = async (data: any, isNew = true) => {
    const url = isNew ? "/api/admin/allocations/create" : `/api/admin/allocations/${data.id}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setNewAllocation(null);
    fetchDashboard();
  };

  const deleteAllocation = async (id: string) => {
    await fetch(`/api/admin/allocations/${id}`, { method: "DELETE" });
    fetchDashboard();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8 md:space-y-12"
        >
          <div className="text-center space-y-4 md:space-y-6">
             <div className="w-12 md:w-16 h-12 md:h-16 bg-white flex items-center justify-center mx-auto rounded-none shadow-2xl">
               <Shield className="w-6 md:w-8 h-6 md:h-8 text-black" />
             </div>
             <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.4em] italic">Apex_Command</h1>
             <p className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-[0.4em] md:tracking-[0.5em] font-black">Institutional Operational Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 bg-[#0A0A0A] p-8 md:p-12 border border-white/5">
            <AdminInput label="Command ID" value={credentials.user} onChange={(v:any) => setCredentials({...credentials, user: v})} />
            <AdminInput label="Access Pulse" value={credentials.pass} onChange={(v:any) => setCredentials({...credentials, pass: v})} isPassword />
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button disabled={loading} className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] transition-all hover:bg-neutral-200">
              Initialize Command Center
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="h-16 md:h-20 border-b border-white/10 px-6 md:px-12 flex items-center justify-between bg-[#0A0A0A] fixed top-0 left-0 right-0 z-[100]">
        <div className="flex items-center gap-6 md:gap-12 overflow-x-auto no-scrollbar">
           <Link to="/" className="flex items-center gap-3 md:gap-4 shrink-0">
             <Shield className="w-5 md:w-6 h-5 md:h-6 text-white" />
             <span className="hidden sm:inline text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white italic">Apex God Mode</span>
           </Link>
           <div className="hidden sm:block h-6 w-[1px] bg-white/10" />
           <div className="flex gap-6 md:gap-8 shrink-0">
              {['Assets', 'Vetting', 'Social'].map((t: any) => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t.toLowerCase() as any)}
                  className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-colors", activeTab === t.toLowerCase() ? "text-white" : "text-white/20 hover:text-white")}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/20 hover:text-white transition-colors shrink-0">
          <span className="hidden sm:inline">TERMINATE_SESSION</span> <LogOut className="w-4 h-4" />
        </button>
      </nav>

      <main className="pt-24 md:pt-32 p-6 md:p-12 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {activeTab === 'assets' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-white/10 pb-12 gap-8">
                <div className="space-y-4">
                  <h2 className="text-[10px] uppercase font-black tracking-[0.6em] text-white/20">Operational Fleet</h2>
                  <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none">Asset Management</h3>
                </div>
                <button 
                  onClick={() => setNewLot({ id: '', name: '', floor: 0, ceiling: 0, velocity: 'Medium', image: '', expiresAt: new Date(Date.now() + 86400000).toISOString() })}
                  className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-400"
                >
                  [+] Deploy New Lot Node
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots && Object.values(lots).map((l: any) => (
                  <div key={l.id} className="p-8 border border-white/10 bg-[#0A0A0A] space-y-8 group hover:border-white/40 transition-all">
                    <div className="aspect-video bg-black/40 overflow-hidden relative border border-white/5">
                      <img src={l.image} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute top-4 left-4 flex gap-2">
                         <span className={cn("px-3 py-1 text-[8px] font-black uppercase tracking-widest", l.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500')}>{l.status}</span>
                         <span className="px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-black uppercase text-white/40 uppercase tracking-widest">Vel: {l.velocity}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] font-mono text-white/20">{l.id}</span>
                       <h4 className="text-xl font-bold uppercase tracking-tighter leading-none truncate">{l.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                          <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Current Ask</span>
                          <span className="text-lg font-mono font-bold tracking-tighter text-emerald-500">{formatCurrency(l.currentBid)}</span>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/5 rounded-sm">
                          <span className="text-[8px] uppercase tracking-widest text-white/20 block mb-1">Target Ceiling</span>
                          <span className="text-lg font-mono font-bold tracking-tighter text-white/60">${(l.ceiling/1000).toFixed(1)}k</span>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                       <button onClick={() => setEditingLot(l)} className="flex-1 py-3 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">Edit Node</button>
                       <button 
                         onClick={async () => {
                           await fetch(`/api/admin/lots/${l.id}`, {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ status: 'Sold', adminInvoiceStatus: 'Sent' })
                           });
                           fetchDashboard();
                         }}
                         className="flex-1 py-3 bg-white text-black text-[8px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-colors"
                       >
                         Settle & Invoice
                       </button>
                       <button onClick={() => deleteLot(l.id)} className="px-4 py-3 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-colors">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vetting' && (
            <div className="space-y-8 md:space-y-12">
               <div className="space-y-4 border-b border-white/10 pb-8 md:pb-12 text-center md:text-left">
                  <h2 className="text-[10px] uppercase font-black tracking-[0.4em] md:tracking-[0.6em] text-white/20">Protocol Authorization</h2>
                  <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none">Bidder Vetting</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="hidden lg:grid grid-cols-5 p-6 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/20 bg-[#0A0A0A]">
                     <span>Node Alias</span>
                     <span>Identity Pulse</span>
                     <span>Request Time</span>
                     <span>Status</span>
                     <span>Actions</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:gap-0 lg:bg-[#0A0A0A] lg:border lg:border-white/10">
                    {applications.map((app: any) => (
                      <div key={app.id} className="flex flex-col lg:grid lg:grid-cols-5 gap-6 lg:gap-0 p-6 md:p-8 bg-[#0A0A0A] border lg:border-0 border-white/10 hover:bg-white/[0.02] items-center text-center lg:text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 lg:text-white shrink-0">{app.name}</span>
                        <div className="flex flex-col text-[10px] font-mono text-white/40 break-all px-4 lg:px-0">
                          <span>{app.email}</span>
                          <span className="opacity-40">{app.phone}</span>
                        </div>
                        <span className="text-[9px] md:text-[10px] font-mono text-white/20 uppercase tracking-tighter">{new Date(app.timestamp).toLocaleString()}</span>
                        <div className="py-2 lg:py-0">
                          <span className={cn("px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] md:tracking-widest", app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : app.status === 'Denied' ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-white/30')}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 w-full lg:w-auto mt-2 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-0 border-white/5">
                           <button onClick={() => setMessageTarget(app)} className="p-3 border border-white/10 text-white/40 hover:text-white transition-colors">
                              <MessageSquare className="w-4 h-4" />
                           </button>
                           <button onClick={() => vetUser(app.id, 'Approved')} className="flex-1 lg:flex-none px-6 py-3 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">Grant Access</button>
                           <button onClick={() => vetUser(app.id, 'Denied')} className="flex-1 lg:flex-none px-6 py-3 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors">Deny</button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'social' && (
             <div className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-white/10 pb-8 md:pb-12 gap-6 text-center md:text-left">
                  <div className="space-y-4">
                    <h2 className="text-[10px] uppercase font-black tracking-[0.6em] text-white/20">Social Proof Ledger</h2>
                    <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none">History Log</h3>
                  </div>
                  <button onClick={() => setNewAllocation({ model: '', price: '', user: '', img: '' })} className="w-full md:w-auto px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200">
                    [+] Log Settlement
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {allocations.map((a: any) => (
                   <div key={a.id} className="relative group aspect-[9/16] bg-[#0A0A0A] border border-white/10 overflow-hidden">
                      <img src={a.img} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black space-y-4">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">{a.price}</span>
                            <h5 className="text-lg font-bold uppercase tracking-tighter italic">{a.model}</h5>
                         </div>
                         <button onClick={() => deleteAllocation(a.id)} className="w-full py-3 bg-red-900/20 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Delete Entry</button>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

        </div>

        <AnimatePresence>
          {messageTarget && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
               <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 p-12 space-y-12 shadow-2xl relative">
                  <button onClick={() => setMessageTarget(null)} className="absolute top-8 right-8 text-[9px] text-white/20 hover:text-white uppercase tracking-widest">[X]</button>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold uppercase tracking-tighter italic">Transmit Packet</h3>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">Target Node: {messageTarget.email}</p>
                  </div>
                  
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 ml-2">Packet Header</label>
                        <input value={msgContent.title} onChange={e => setMsgContent({...msgContent, title: e.target.value})} className="w-full bg-black border border-white/10 p-5 text-xs font-mono uppercase tracking-widest focus:border-emerald-500 transition-all outline-none text-white" placeholder="TRANSMISSION_SUBJECT" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/20 ml-2">Internal Payload</label>
                        <textarea value={msgContent.message} onChange={e => setMsgContent({...msgContent, message: e.target.value})} className="w-full h-40 bg-black border border-white/10 p-6 text-xs font-mono uppercase tracking-widest focus:border-emerald-500 transition-all outline-none resize-none text-white" placeholder="ENCRYPT_DATA_HERE..." />
                     </div>
                     <div className="flex flex-wrap gap-3">
                        {['info', 'success', 'warning', 'alert'].map(type => (
                          <button key={type} onClick={() => setMsgContent({...msgContent, type})} className={cn("px-5 py-2.5 text-[8px] font-black uppercase tracking-widest border transition-all", msgContent.type === type ? "bg-white text-black border-white" : "border-white/10 text-white/20 hover:text-white hover:border-white/40")}>{type}</button>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                     <button onClick={sendDirectMessage} className="flex-[2] py-6 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-emerald-400 transition-all">Establish Transmission</button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {(editingLot || newLot) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl overflow-y-auto p-4 md:p-12 pb-24"
          >
            <div className="min-h-full flex items-center justify-center">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A0A0A] border border-white/10 p-8 md:p-16 w-full max-w-2xl space-y-10 md:space-y-12">
                 <div className="flex justify-between items-start gap-4">
                    <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter italic leading-none">{newLot ? 'Deploy New Node' : 'Edit Lot Node'}</h3>
                    <button onClick={() => { setEditingLot(null); setNewLot(null); }} className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1 shrink-0">[X] EXIT</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <AdminInput label="Asset ID (Slug)" value={newLot?.id || editingLot?.id} onChange={(v:any) => newLot ? setNewLot({...newLot, id: v}) : setEditingLot({...editingLot, id: v})} />
                    <AdminInput label="Asset Name" value={newLot?.name || editingLot?.name} onChange={(v:any) => newLot ? setNewLot({...newLot, name: v}) : setEditingLot({...editingLot, name: v})} />
                    <AdminInput label="Start/Floor Price ($)" value={newLot?.floor || editingLot?.floor} onChange={(v:any) => newLot ? setNewLot({...newLot, floor: Number(v)}) : setEditingLot({...editingLot, floor: Number(v)})} />
                    <AdminInput label="Target Ceiling ($)" value={newLot?.ceiling || editingLot?.ceiling} onChange={(v:any) => newLot ? setNewLot({...newLot, ceiling: Number(v)}) : setEditingLot({...editingLot, ceiling: Number(v)})} />
                    <div className="space-y-3">
                      <label className="text-[8px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20">Velocity Level</label>
                      <select value={newLot?.velocity || editingLot?.velocity} onChange={(e) => newLot ? setNewLot({...newLot, velocity: e.target.value}) : setEditingLot({...editingLot, velocity: e.target.value})} className="w-full bg-black border border-white/10 p-4 text-[10px] md:text-xs font-mono uppercase text-white outline-none">
                         <option value="Static">Static</option>
                         <option value="Low">Low Pulse</option>
                         <option value="Medium">Medium Flow</option>
                         <option value="High">High Velocity</option>
                      </select>
                    </div>
                    <AdminInput label="Node Expiry (ISO Date)" value={newLot?.expiresAt || editingLot?.expiresAt} onChange={(v:any) => newLot ? setNewLot({...newLot, expiresAt: v}) : setEditingLot({...editingLot, expiresAt: v})} />
                    <div className="md:col-span-2">
                      <AdminInput label="Asset Image URL" value={newLot?.image || editingLot?.image} onChange={(v:any) => newLot ? setNewLot({...newLot, image: v}) : setEditingLot({...editingLot, image: v})} />
                    </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                   <button onClick={() => { setEditingLot(null); setNewLot(null); }} className="order-2 sm:order-1 flex-1 py-6 md:py-8 border border-white/10 text-white/20 text-[10px] font-black uppercase tracking-[0.6em] hover:bg-red-600 hover:text-white transition-all">
                      Abort Protocol
                   </button>
                   <button onClick={() => saveLot(newLot || editingLot, !!newLot)} className="order-1 sm:order-2 flex-[2] py-6 md:py-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-neutral-200">
                      Update Ledger
                   </button>
                 </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {newAllocation && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl overflow-y-auto p-4 pb-24"
          >
             <div className="min-h-full flex items-center justify-center">
               <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A0A0A] border border-white/10 p-8 md:p-16 w-full max-w-md space-y-10 md:space-y-12">
                 <div className="flex justify-between items-start">
                    <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter italic">Log Settlement</h3>
                    <button onClick={() => setNewAllocation(null)} className="text-[9px] font-black text-white/20 uppercase tracking-widest">[X] CLOSE</button>
                 </div>
                 <div className="space-y-6">
                    <AdminInput label="Asset Plate" value={newAllocation.model} onChange={(v:any) => setNewAllocation({...newAllocation, model: v})} />
                    <AdminInput label="Settlement Price" value={newAllocation.price} onChange={(v:any) => setNewAllocation({...newAllocation, price: v})} />
                    <AdminInput label="Winning Node" value={newAllocation.user} onChange={(v:any) => setNewAllocation({...newAllocation, user: v})} />
                    <AdminInput label="Media URL" value={newAllocation.img} onChange={(v:any) => setNewAllocation({...newAllocation, img: v})} />
                 </div>
                 <button onClick={() => manageAllocation(newAllocation)} className="w-full py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-neutral-200">
                    Register Historical Record
                 </button>
               </motion.div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminInput({ label, value, onChange, isPassword }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 ml-1 block">{label}</label>
      <input 
        type={isPassword ? "password" : "text"} 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 p-5 font-mono text-xs text-white focus:border-emerald-500/40 outline-none transition-colors uppercase"
      />
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="p-8 border border-white/10 bg-[#0A0A0A] flex items-center gap-8 group hover:border-white/30 transition-colors cursor-default">
      <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-white text-white group-hover:text-black transition-all">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 block mb-1">{label}</span>
        <span className="text-3xl font-bold font-mono tracking-tighter text-white">{value}</span>
      </div>
    </div>
  );
}
