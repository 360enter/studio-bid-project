import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Bell, Menu, X, Gavel } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const { pathname } = useLocation();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const checkUser = () => {
      const savedUser = localStorage.getItem('apex_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      else setUser(null);
    };

    const handleOpenLogin = () => setIsLoginModalOpen(true);

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('apex-open-login', handleOpenLogin);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('apex-open-login', handleOpenLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apex_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar - High Density Theme */}
      <header 
        className={cn(
          "h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 bg-[#0A0A0A] border-b transition-all duration-300",
          isScrolled ? "border-white/10 shadow-2xl" : "border-transparent"
        )}
      >
        <div className="flex items-center space-x-4 md:space-x-12">
          <Link to="/" className="flex items-center group">
             <span className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase">APEX<span className="text-white/40">HOLDINGS</span></span>
          </Link>
          <nav className="hidden lg:flex space-x-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
            <Link to="/" className={cn("transition-colors", pathname === '/' ? 'text-white' : 'hover:text-white')}>Market</Link>
            <Link to="/inventory" className={cn("transition-colors", pathname === '/inventory' ? 'text-white' : 'hover:text-white')}>Inventory</Link>
            <Link to="/sell" className={cn("transition-colors", pathname === '/sell' ? 'text-white' : 'hover:text-white')}>Sell Asset</Link>
            <Link to="/vault" className={cn("transition-colors", pathname === '/vault' ? 'text-white' : 'hover:text-white')}>The Vault</Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-[9px] font-mono uppercase tracking-tighter text-white/60">Node Integrity: Nominal</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
               <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-white/40 hover:text-white transition-colors"
               >
                 <Bell className="w-5 h-5" />
                 {notifications.some(n => !n.read) && (
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
                 )}
               </button>
               <button 
                 onClick={handleLogout}
                 className="bg-white/5 border border-white/10 text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
               >
                 Disconnect
               </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-white bg-white/5 border border-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Sign In
              </button>
            </div>
          )}

          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

          {/* Notification Panel */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-20 right-6 md:right-12 w-80 bg-[#0A0A0A] border border-white/10 shadow-2xl p-6 z-[60]"
              >
                <div className="flex justify-between items-center mb-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Inbound Packets</h4>
                   <button onClick={() => setIsNotifOpen(false)} className="text-[8px] uppercase tracking-widest text-white/20">[X]</button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                   {notifications.length > 0 ? notifications.map(n => (
                     <div key={n.id} className="p-4 bg-white/5 border border-white/5 space-y-2 group">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-bold uppercase text-emerald-500 tracking-widest">{n.type}</span>
                          <span className="text-[7px] font-mono text-white/20">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <h5 className="text-xs font-bold uppercase tracking-tight italic">{n.title}</h5>
                        <p className="text-[10px] text-white/40 leading-relaxed">{n.message}</p>
                     </div>
                   )) : (
                     <div className="py-12 text-center text-[9px] uppercase tracking-widest text-white/10 italic">Terminal Silent</div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Trigger */}
          <MobileNav pathname={pathname} user={user} handleLogout={handleLogout} />
        </div>
      </header>

      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* System Footer - High Density Theme */}
      <footer className="py-6 md:h-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 bg-[#050505] text-[9px] text-white/40 tracking-[0.2em] md:tracking-widest uppercase gap-4 text-center md:text-left">
        <div>© 2026 APEX STRATEGIC HOLDINGS • ALL ASSETS SECURED</div>
        <div className="flex items-center space-x-4 md:space-x-6">
          <span className="flex items-center"><div className="w-1 h-1 bg-white/40 rounded-full mr-2"></div> Node: Secure</span>
          <span className="flex items-center"><div className="w-1 h-1 bg-white/40 rounded-full mr-2"></div> Pulse v4.2</span>
        </div>
      </footer>
    </div>
  );
}

function MobileNav({ pathname, user, handleLogout }: { pathname: string, user: any, handleLogout: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col h-full p-8">
              <div className="flex justify-between items-center mb-16">
                <Shield className="w-8 h-8" />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-8">
                {[
                  { name: "Market Live", path: "/" },
                  { name: "Inventory", path: "/inventory" },
                  { name: "Commissioning", path: "/sell" },
                  { name: "The Vault", path: "/vault" }
                ].map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-4xl font-bold uppercase tracking-tighter italic transition-colors",
                      pathname === item.path ? "text-white" : "text-white/20 whitespace-nowrap"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="text-4xl font-bold uppercase tracking-tighter italic text-red-500 text-left"
                  >
                    Disconnect
                  </button>
                )}
              </nav>

              <div className="mt-auto pt-12 border-t border-white/5 space-y-6">
                 {user && (
                   <div className="text-[10px] uppercase tracking-widest text-white/40 font-black">
                     Auth_ID: {user.uid}
                   </div>
                 )}
                <div className="flex items-center bg-white/5 border border-white/10 px-4 py-3 rounded-none justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Sovereign_Active</span>
                  </div>
                </div>
                <div className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black">
                  Apex Strategic Holdings • v4.2.pulse
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("apex_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
        onClose();
      } else {
        setError(data.error || "Access Pulse Invalid");
      }
    } catch (err) {
      setError("System Network Fault");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
      <div className="w-full max-w-md relative">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white/20 hover:text-white text-[9px] uppercase tracking-widest">[X] CLOSE</button>
        <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-12 space-y-10">
          <div className="space-y-4">
             <h3 className="text-3xl font-bold uppercase tracking-tighter italic">Institutional Ingress</h3>
             <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black">Authentication required for ledger access.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 ml-1">Node Identity</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full bg-black border border-white/10 p-4 text-xs font-mono uppercase tracking-widest outline-none focus:border-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 ml-1">Access Pulse</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full bg-black border border-white/10 p-4 text-xs font-mono tracking-widest outline-none focus:border-white/40"
              />
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] uppercase tracking-widest font-black text-center italic">{error}</div>}
            <button 
              disabled={loading}
              className="w-full py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "Establish Link"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
