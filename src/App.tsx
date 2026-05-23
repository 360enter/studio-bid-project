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
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const userStr = localStorage.getItem('apex_user');
      if (!userStr) {
        setIsValidating(false);
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        const res = await fetch("/api/auth/me", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ id: user.id })
        });
        
        if (res.ok) {
           const data = await res.json();
           console.log(`[ROUTING] Route access attempt by ID: ${data.user.id}, Role check result: ${data.user.role}, Status: ${data.user.status}`);
           
           if (data.user.status !== 'active') {
             console.log(`[ROUTING] Invalid status detected (${data.user.status}), logging out.`);
             localStorage.removeItem('apex_user');
             window.dispatchEvent(new Event('storage'));
             navigate('/');
           } else {
             // Sync latest data
             localStorage.setItem('apex_user', JSON.stringify(data.user));
             window.dispatchEvent(new Event('storage'));
           }
        } else {
           // Invalid session entirely
           console.log(`[ROUTING] Invalid session, logging out.`);
           localStorage.removeItem('apex_user');
           window.dispatchEvent(new Event('storage'));
           navigate('/');
        }
      } catch (err) {
        console.error("Session validation failed");
      } finally {
        setIsValidating(false);
      }
    };
    
    validateSession();
  }, [navigate, location.pathname]);

  if (isValidating) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading session...</div>;
  return <>{children}</>;
}

import { CustomerDashboard } from "@/src/pages/CustomerDashboard";

function DashboardRouter() {
  const userStr = localStorage.getItem('apex_user');
  if (!userStr) return <Navigate to="/" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      return <Navigate to="/apex-control-nexus" replace />;
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
            <Route path="/apex-control-nexus" element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
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

