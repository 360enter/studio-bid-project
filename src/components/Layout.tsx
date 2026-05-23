import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Bell, User, Search, ChevronDown, LogOut, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const { pathname } = useLocation();

  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem('apex_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('apex_theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const checkUser = async () => {
      const savedUser = localStorage.getItem('apex_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.email) {
           try {
             const res = await fetch('/api/user/profile', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email: parsed.email })
             });
             const data = await res.json();
             if (res.ok && data.user) {
               localStorage.setItem('apex_user', JSON.stringify(data.user));
               setUser(data.user);
             }
           } catch {}
        }
      }
      else setUser(null);
    };

    const handleOpenLogin = () => { setIsRegisterModalOpen(false); setIsLoginModalOpen(true); };
    const handleOpenRegister = () => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true); };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('apex-open-login', handleOpenLogin);
    window.addEventListener('apex-open-register', handleOpenRegister);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('apex-open-login', handleOpenLogin);
      window.removeEventListener('apex-open-register', handleOpenRegister);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apex_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 hidden md:block border-b border-slate-800">
         <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition-colors">How it works</a>
               <a href="#" className="hover:text-white transition-colors">Locations</a>
               <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="flex gap-4 items-center">
               <span className="flex items-center gap-1 cursor-pointer hover:text-white">EN <ChevronDown className="w-3 h-3"/></span>
               <span className="flex items-center gap-1 cursor-pointer hover:text-white">USD <ChevronDown className="w-3 h-3"/></span>
            </div>
         </div>
      </div>

      <header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "glass-panel shadow-sm" : "bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 lg:gap-12 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shadow-md shadow-blue-700/20">
                 <span className="text-white font-display font-bold text-lg leading-none">B</span>
               </div>
               <span className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                  Bid.Cars <span className="font-light text-slate-400 dark:text-slate-500">Pro</span>
               </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-350">
               <Link to="/" className={cn("text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", pathname === '/' && "text-blue-700 dark:text-blue-400 font-bold")}>Auctions</Link>
               <Link to="/inventory" className={cn("text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", pathname === '/inventory' && "text-blue-700 dark:text-blue-400 font-bold")}>Vehicle Finder</Link>
               <Link to="/sell" className={cn("text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", pathname === '/sell' && "text-blue-700 dark:text-blue-400 font-bold")}>Sell Vehicle</Link>
               {user && <Link to="/dashboard" className={cn("text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", pathname.includes('/dashboard') && "text-blue-700 dark:text-blue-400 font-bold")}>Dashboard</Link>}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
             <div className="relative group max-w-sm w-full xl:max-w-md hidden lg:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search Make, Model, Year, or VIN" className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 border focus:border-blue-500 text-slate-900 dark:text-white rounded-lg text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10" />
             </div>

             {/* Theme Toggle Switch */}
             <button
                id="desktop-theme-toggle"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-all duration-200"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
             >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>

             {user ? (
               <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900 rounded-full transition-colors">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                          {user.name ? user.name.substring(0,2).toUpperCase() : 'US'}
                       </div>
                       <div className="hidden xl:flex flex-col items-start px-1 text-left">
                          <span className="text-xs font-bold leading-none text-slate-900 dark:text-white mb-1">{user.name || 'Bidder Profile'}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none font-medium">Balance: ${(user.deposit_balance || 0).toLocaleString()}</span>
                       </div>
                       <ChevronDown className="w-4 h-4 text-slate-400 hidden xl:block" />
                    </button>
                    {isProfileOpen && (
                       <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 text-sm overflow-hidden animate-slide-up">
                          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                             <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                             <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-3 text-slate-700 dark:text-slate-350 font-medium transition-colors">
                               <User className="w-4 h-4 text-slate-400" /> Buyer Dashboard
                             </Link>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-800 py-2">
                             <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 flex items-center gap-3 font-medium transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                             </button>
                          </div>
                       </div>
                    )}
                  </div>
               </div>
             ) : (
               <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <button onClick={() => window.dispatchEvent(new Event('apex-open-login'))} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 px-3 py-2 transition-colors">Sign In</button>
                  <button onClick={() => window.dispatchEvent(new Event('apex-open-register'))} className="enterprise-button enterprise-button-primary py-2 px-5 text-sm">Register Now</button>
               </div>
             )}
          </div>
          
          <MobileNav pathname={pathname} user={user} handleLogout={handleLogout} theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="flex-1 bg-slate-50 dark:bg-slate-950 relative z-0 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800 mt-auto relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent opacity-50"></div>
        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
              <div className="lg:col-span-2">
                 <Link to="/" className="flex items-center gap-2 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                     <span className="text-white font-display font-bold text-lg">B</span>
                   </div>
                   <span className="text-2xl font-display font-bold tracking-tight text-white">Bid.Cars <span className="font-light text-slate-500">Pro</span></span>
                 </Link>
                 <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-8 font-medium">
                   The premier enterprise vehicle marketplace for wholesale, salvage, and clean title vehicles globally. Exclusive access to premium inventory.
                 </p>
                 <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center hover:bg-blue-600 hover:text-white cursor-pointer transition-colors text-xs font-bold shadow-inner border border-slate-700">IN</div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center hover:bg-blue-600 hover:text-white cursor-pointer transition-colors text-xs font-bold shadow-inner border border-slate-700">X</div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex justify-center items-center hover:bg-blue-600 hover:text-white cursor-pointer transition-colors text-xs font-bold shadow-inner border border-slate-700">FB</div>
                 </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide">Marketplace</h4>
                <ul className="space-y-3 text-sm font-medium">
                   <li><Link to="/inventory" className="hover:text-blue-400 transition-colors">Search Vehicles</Link></li>
                   <li><Link to="/" className="hover:text-blue-400 transition-colors">Live Auctions</Link></li>
                   <li><Link to="/sell" className="hover:text-blue-400 transition-colors">Sell a Vehicle</Link></li>
                   <li><Link to="/locations" className="hover:text-blue-400 transition-colors">Locations & Facilities</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide">Support</h4>
                <ul className="space-y-3 text-sm font-medium">
                   <li><Link to="/help" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                   <li><Link to="/how-to-buy" className="hover:text-blue-400 transition-colors">How to Buy</Link></li>
                   <li><Link to="/shipping" className="hover:text-blue-400 transition-colors">Shipping & Delivery</Link></li>
                   <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 tracking-wide">Corporate</h4>
                <ul className="space-y-3 text-sm font-medium">
                   <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                   <li><Link to="/investors" className="hover:text-blue-400 transition-colors">Investor Relations</Link></li>
                   <li><Link to="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                   <li><Link to="/press" className="hover:text-blue-400 transition-colors">Press</Link></li>
                </ul>
              </div>
           </div>
           
           <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
              <div>© 2026 Bid.Cars Pro Enterprise. All rights reserved.</div>
              <div className="flex gap-6">
                 <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                 <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                 <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
           </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
    </div>
  );
}

import { createPortal } from "react-dom";

function MobileNav({ pathname, user, handleLogout, theme, setTheme }: any) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="ml-auto w-[85%] max-w-sm h-full bg-white dark:bg-slate-950 border-l dark:border-slate-900 shadow-2xl flex flex-col transition-colors duration-300"
              >
                 <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-900">
                    <span className="font-display font-bold text-slate-900 dark:text-white text-lg">Menu</span>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-5 h-5"/></button>
                 </div>
                 <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
                    {/* Theme Toggler inside Mobile Menu */}
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                       <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Theme Preference</span>
                       <button
                         id="mobile-theme-toggle"
                         onClick={() => setTheme((prev: string) => prev === 'light' ? 'dark' : 'light')}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
                       >
                          {theme === 'light' ? (
                             <>
                               <Moon className="w-3.5 h-3.5 text-slate-500"/> Dark Mode
                             </>
                          ) : (
                             <>
                               <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
                             </>
                          )}
                       </button>
                    </div>

                    <div className="flex flex-col gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                       <Link to="/" onClick={() => setIsOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 active:bg-slate-100 transition-colors">Auctions</Link>
                       <Link to="/inventory" onClick={() => setIsOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 active:bg-slate-100 transition-colors">Vehicle Finder</Link>
                       <Link to="/sell" onClick={() => setIsOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 active:bg-slate-100 transition-colors">Sell Vehicle</Link>
                    </div>
                    
                    {user ? (
                       <div className="mt-auto space-y-3">
                          <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full py-3.5 bg-slate-100 dark:bg-slate-900 text-center rounded-xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
                             My Dashboard
                          </Link>
                          <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full py-3.5 text-red-650 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 rounded-xl transition-colors">
                             Sign Out
                          </button>
                       </div>
                    ) : (
                       <div className="mt-auto space-y-3">
                          <button onClick={() => { window.dispatchEvent(new Event('apex-open-login')); setIsOpen(false);}} className="w-full py-3.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-center rounded-xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 transition-colors">
                             Sign In
                          </button>
                          <button onClick={() => { window.dispatchEvent(new Event('apex-open-register')); setIsOpen(false);}} className="w-full py-3.5 text-white bg-blue-700 hover:bg-blue-800 font-bold rounded-xl shadow-md shadow-blue-700/20 transition-colors">
                             Register Now
                          </button>
                       </div>
                    )}
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [statusText, setStatusText] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatusText("Verifying account...");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
         setStatusText("Success! Redirecting...");
         localStorage.setItem("apex_user", JSON.stringify(data.user));
         window.dispatchEvent(new Event('storage'));
         setTimeout(() => {
           onClose();
           if (data.user.role === 'admin') {
             window.location.href = '/apex-control-nexus';
           } else {
             window.location.href = '/dashboard';
           }
         }, 800);
      } else {
         if (data.error === "Your account is awaiting approval.") {
           setError("Your account is awaiting admin approval");
         } else if (data.error === "Your application has been rejected.") {
           setError("Your account has been rejected");
         } else {
           setError(data.error);
         }
         setStatusText("");
      }
    } catch {
       setError("System Network Fault");
       setStatusText("");
    } finally {
       setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-xl">
       <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          
          <div className="flex flex-col items-center mb-6">
             <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/20 mb-4">
               <span className="text-white font-display font-bold text-2xl">B</span>
             </div>
             <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to Bid.Cars</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Enter your details to access live bidding</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="name@company.com" />
             </div>
             <div className="space-y-1">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                   <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Forgot?</button>
                </div>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="••••••••" />
             </div>
             
             {error && <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-400 text-sm font-semibold rounded-lg text-center">{error}</div>}
             
             <button disabled={loading} className="w-full enterprise-button enterprise-button-primary disabled:opacity-50 mt-2 py-3.5 shadow-md">
                {statusText || "Sign In"}
             </button>
             
             <div className="text-center pt-2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Not registered? </span>
                <button type="button" onClick={() => { onClose(); window.dispatchEvent(new Event('apex-open-register')) }} className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline">Create Account</button>
             </div>
          </form>
       </motion.div>
    </motion.div>
  );
}

export function RegisterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [fullname, setFullname] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [country, setCountry] = React.useState("");
  
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
       setError("Passwords do not match");
       return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullname, phone, password, country })
      });
      const data = await res.json();

      if (data.success) {
         setSuccess(data.message || "Registration successful. Awaiting approval.");
         // Clear form
         setFullname("");
         setEmail("");
         setPhone("");
         setPassword("");
         setConfirmPassword("");
         setCountry("");
         
         setTimeout(() => { 
            onClose(); 
            window.dispatchEvent(new Event('apex-open-login'));
         }, 3000);
      } else {
         setError(data.error || "Registration failed");
      }
    } catch (err) {
       setError("System Network Fault. Please try again.");
    } finally {
       setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-xl">
       <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          
          <div className="flex flex-col items-center mb-6">
             <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/20 mb-4">
               <span className="text-white font-display font-bold text-2xl">B</span>
             </div>
             <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create an Account</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Register to start bidding</p>
          </div>

          {!success ? (
             <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                   <input required type="text" value={fullname} onChange={e => setFullname(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                   <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="name@company.com" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                   <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Country</label>
                   <input required type="text" value={country} onChange={e => setCountry(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="United States" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                   <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
                   <input required minLength={8} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="enterprise-input bg-slate-50 dark:bg-slate-950" placeholder="••••••••" />
                </div>
                
                {error && <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-400 text-sm font-semibold rounded-lg text-center">{error}</div>}
                
                <button disabled={loading} className="w-full enterprise-button enterprise-button-primary disabled:opacity-50 mt-2 py-3.5 shadow-md">
                  {loading ? "Creating account..." : "Register Now"}
                </button>
                
                <div className="text-center pt-2">
                   <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Already registered? </span>
                   <button type="button" onClick={() => { onClose(); window.dispatchEvent(new Event('apex-open-login')) }} className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline">Sign In</button>
                </div>
             </form>
          ) : (
             <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Registration successful</h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{success}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Redirecting to login...</p>
             </div>
          )}
       </motion.div>
    </motion.div>
  );
}
