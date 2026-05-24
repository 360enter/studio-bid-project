/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Layout } from "@/src/components/Layout";
import { Home } from "@/src/pages/Home";
import { LotDetails } from "@/src/pages/LotDetails";
import { Admin } from "@/src/pages/Admin";
import { Inventory } from "@/src/pages/Inventory";
import { Sell } from "@/src/pages/Sell";
import { Vault } from "@/src/pages/Vault";
import { Locations, HelpCenter, HowToBuy, Shipping, ContactUs, AboutUs, InvestorRelations, Careers, Press, PrivacyPolicy, TermsOfService, CookiePolicy } from "@/src/pages/StaticPages";

function AuthValidator({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isActive = true;
    const validateSession = async () => {
      const userStr = localStorage.getItem('apex_user');
      if (!userStr) {
        if (isActive) setIsValidating(false);
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        if (!user || !user.id) {
          localStorage.removeItem('apex_user');
          window.dispatchEvent(new Event('storage'));
          if (isActive) setIsValidating(false);
          return;
        }

        // Limit validation loading to a 1000ms max timeout fallbacks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log("[ROUTING] Session validation request hit timeout. Terminating loading state.");
          if (isActive) setIsValidating(false);
        }, 1000);

        try {
          const res = await fetch("/api/auth/me", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ id: user.id }),
             signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (res.ok) {
             const data = await res.json();
             if (data.success && data.user) {
                const ustatus = (data.user.status || '').toLowerCase();
                console.log(`[ROUTING] Route access validated for ID: ${data.user.id}, Status: ${ustatus}, Role: ${data.user.role}`);
                
                // Standardize status for local state representations
                localStorage.setItem('apex_user', JSON.stringify({ ...data.user, status: data.user.status }));
                window.dispatchEvent(new Event('storage'));
             }
          } else {
             console.log(`[ROUTING] Invalid status or credentials, session cleared.`);
             localStorage.removeItem('apex_user');
             window.dispatchEvent(new Event('storage'));
             navigate('/');
          }
        } catch (fetchErr: any) {
          if (fetchErr.name === 'AbortError') {
             console.log("[ROUTING] Validation aborted on timeout - fallback to client storage state.");
          } else {
             console.error("[ROUTING] Session validation network query failed:", fetchErr);
          }
        }
      } catch (err) {
        console.error("Session validation failed:", err);
      } finally {
        if (isActive) {
          setIsValidating(false);
        }
      }
    };
    
    validateSession();
    return () => {
      isActive = false;
    };
  }, [navigate]); // Run once on mount!

  if (isValidating) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 select-none font-sans">
         <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse mb-4 shadow-lg shadow-blue-600/30">
           <span className="text-white font-bold text-2xl">B</span>
         </div>
         <div className="text-sm font-semibold tracking-wider font-mono animate-pulse text-blue-500 uppercase">Synchronizing Security Session...</div>
         <span className="text-[10px] text-slate-600 font-mono mt-1 tracking-widest uppercase">Apex Secure Ingress &bull; Bid.Cars</span>
       </div>
    );
  }
  return <>{children}</>;
}

import { CustomerDashboard } from "@/src/pages/CustomerDashboard";

function DashboardRouter() {
  const userStr = localStorage.getItem('apex_user');
  if (!userStr) return <Navigate to="/" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <CustomerDashboard />;
  } catch (e) {
    return <Navigate to="/" replace />;
  }
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('apex_user');
  if (!userStr) return <Navigate to="/" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  } catch (e) {
    return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <Router>
      <AuthValidator>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lot/:id" element={<LotDetails />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <Admin initialTab="overview" />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedAdminRoute>
                <Admin initialTab="vetting" />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/invoices" element={
              <ProtectedAdminRoute>
                <Admin initialTab="escrow" />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedAdminRoute>
                <Admin initialTab="overview" />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedAdminRoute>
                <Admin initialTab="overview" />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/wallets" element={
              <ProtectedAdminRoute>
                <Admin initialTab="escrow" />
              </ProtectedAdminRoute>
            } />
            <Route path="/apex-control-nexus" element={
              <Navigate to="/admin/dashboard" replace />
            } />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/how-to-buy" element={<HowToBuy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/investors" element={<InvestorRelations />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          </Routes>
        </Layout>
      </AuthValidator>
    </Router>
  );
}

