/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Layout } from "@/src/components/Layout";
import { Home } from "@/src/pages/Home";
import { LotDetails } from "@/src/pages/LotDetails";
import { Admin } from "@/src/pages/Admin";
import { Inventory } from "@/src/pages/Inventory";
import { Sell } from "@/src/pages/Sell";
import { Vault } from "@/src/pages/Vault";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lot/:id" element={<LotDetails />} />
          <Route path="/apex-control-nexus" element={<Admin />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/vault" element={<Vault />} />
        </Routes>
      </Layout>
    </Router>
  );
}

