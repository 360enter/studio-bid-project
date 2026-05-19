import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";

// Initialize Firebase Admin (using internal config or env)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (e) {
    console.error("Firebase Admin Init Error (Expected in Dev without keys):", e);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CONSTANTS & CONFIG (Apex 2026 Core)
  const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
  const ADMIN_CREDS = { user: "csapex", pass: "031295$$01kilox" };

  // KV-SIMULATED STATE (Fallbacks if DB missing)
  const lots: Record<string, any> = {
    // ... same as before
    'z06-vete': { 
      id: 'z06-vete',
      name: '2026 Corvette Z06 Carbon',
      currentBid: 142400, 
      floor: 110000, 
      ceiling: 215000, 
      velocity: 'High', 
      status: 'Active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
      adminInvoiceStatus: 'Pending',
      image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2000&auto=format&fit=crop",
      bidHistory: [
        { id: 'b1', user: 'Vault_01', amount: 142400, time: new Date().toISOString() },
        { id: 'b2', user: 'Alpha_Luxe', amount: 141900, time: new Date(Date.now() - 50000).toISOString() }
      ]
    },
    'rx350-lex': { 
      id: 'rx350-lex',
      name: '2026 Lexus RX 350 Luxury',
      currentBid: 72800, 
      floor: 65000, 
      ceiling: 85000, 
      velocity: 'Medium', 
      status: 'Active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours
      adminInvoiceStatus: 'Pending',
      image: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?q=80&w=2000&auto=format&fit=crop",
      bidHistory: []
    },
    'gt3-porsche': { 
      id: 'gt3-porsche',
      name: '2026 Porsche 911 GT3 RS',
      currentBid: 312500, 
      floor: 280000, 
      ceiling: 420000, 
      velocity: 'Static', 
      status: 'Active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      adminInvoiceStatus: 'Pending',
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000&auto=format&fit=crop",
      bidHistory: []
    }
  };

  const allocations: any[] = [
    { id: 'a1', model: "Ferrari SF90", price: "$642,000", user: "@VAULT_01", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=600&auto=format&fit=crop" },
    { id: 'a2', model: "Lexus RX 350", price: "$68,500", user: "@AGENT_SILVA", img: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?q=80&w=600&auto=format&fit=crop" },
    { id: 'a3', model: "Porsche 918", price: "$1,850,000", user: "@INST_ALPHA", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop" },
    { id: 'a4', model: "McLaren P1", price: "$2,100,000", user: "@VAULT_UK", img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=600&auto=format&fit=crop" }
  ];

  const applications: any[] = [];
  const userStatus: Record<string, string> = {}; // email -> status

  // UTILS
  const sendDiscord = async (payload: any) => {
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Internal Notification Error:", e);
    }
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/lots", (req, res) => {
    res.json(lots);
  });

  app.get("/api/allocations", (req, res) => {
    res.json(allocations);
  });

  app.post("/api/bid", async (req, res) => {
    const { lotId, amount, email } = req.body;
    if (!lots[lotId]) return res.status(404).json({ error: "Node not found" });

    lots[lotId].currentBid = amount;
    const bidRec = { 
      id: Math.random().toString(16).slice(2), 
      user: email || "SYSTEM_NODE", 
      amount, 
      time: new Date().toISOString() 
    };
    lots[lotId].bidHistory.unshift(bidRec);

    await sendDiscord({
      embeds: [{
        title: "🚨 APEX LIVE BID - INGRESS CONFIRMED",
        color: 0xD4AF37,
        fields: [
          { name: "Asset", value: lotId, inline: true },
          { name: "Amount", value: `$${amount.toLocaleString()}`, inline: true },
          { name: "Bidder", value: email || "SYSTEM_NODE" }
        ],
        timestamp: new Date().toISOString()
      }]
    });

    res.json({ success: true, newBid: amount });
  });

  app.post("/api/register", async (req, res) => {
    const { name, email, phone, password } = req.body;
    
    // 1. Create Firebase User if possible
    let uid = `user_${Math.random().toString(36).substring(7)}`;
    if (auth) {
      try {
        const user = await auth.createUser({
          email,
          password,
          displayName: name,
          phoneNumber: phone.startsWith('+') ? phone : undefined // Basic check
        });
        uid = user.uid;
      } catch (e: any) {
        return res.status(400).json({ error: e.message });
      }
    }

    const application = { 
      id: Math.random().toString(36).substring(7),
      uid, 
      name, 
      email, 
      phone, 
      timestamp: new Date().toISOString(), 
      status: 'Pending',
      role: 'user'
    };
    
    if (db) {
      await db.collection('users').doc(uid).set(application);
    } else {
      applications.unshift(application);
    }
    
    await sendDiscord({
      embeds: [{
        title: "🛡️ NEW BIDDER REGISTRATION",
        color: 0x000000,
        fields: [
          { name: "Name", value: name, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Phone", value: phone, inline: true }
        ],
        footer: { text: "Manual Verification Required by Admin" }
      }]
    });

    res.json({ success: true });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    // In a real app, the client uses Firebase SDK for login.
    // This is for session check/vetting status.
    if (db) {
       const userDoc = await db.collection('users').where('email', '==', email).get();
       if (userDoc.empty) return res.status(404).json({ error: "User not found" });
       const user = userDoc.docs[0].data();
       if (user.status !== 'Approved') return res.status(401).json({ error: "Institutional access pending approval." });
       return res.json({ success: true, user });
    }
    
    const user = applications.find(a => a.email === email);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.status !== 'Approved') return res.status(401).json({ error: "Approval Pending" });
    res.json({ success: true, user });
  });

  // ADMIN ACTION CENTER (GOD MODE)
  app.post("/api/admin/login", (req, res) => {
    const { user, pass } = req.body;
    if (user === ADMIN_CREDS.user && pass === ADMIN_CREDS.pass) {
      return res.json({ success: true, token: "apex_session_01" });
    }
    res.status(401).json({ error: "Access Denied" });
  });

  app.get("/api/admin/applications", async (req, res) => {
    if (db) {
      const users = await db.collection('users').get();
      return res.json(users.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    res.json(applications);
  });

  app.post("/api/admin/applications/vet", async (req, res) => {
    const { id, status } = req.body;
    if (db) {
      await db.collection('users').doc(id).update({ status });
      return res.json({ success: true });
    }
    const userApp = applications.find(a => a.id === id || a.uid === id);
    if (userApp) {
      userApp.status = status;
      return res.json({ success: true });
    }
    res.status(404).json({ error: "App not found" });
  });

  app.post("/api/admin/send-notification", async (req, res) => {
    const { userId, title, message, type = 'info' } = req.body;
    const notification = {
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };

    if (db) {
      await db.collection('notifications').add(notification);
    }
    // Also log for system record
    console.log(`Notification sent to ${userId}: ${title}`);
    res.json({ success: true });
  });

  app.post("/api/admin/trigger-invoice", async (req, res) => {
    const { lotId } = req.body;
    if (lots[lotId]) {
      lots[lotId].adminInvoiceStatus = 'Sent';
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Lot node missing" });
  });

  // LOT CRUD
  app.post("/api/admin/lots/create", (req, res) => {
    const lot = req.body;
    lots[lot.id] = { ...lot, currentBid: lot.floor, bidHistory: [], adminInvoiceStatus: 'Pending', status: 'Active' };
    res.json({ success: true });
  });

  app.delete("/api/admin/lots/:id", (req, res) => {
    delete lots[req.params.id];
    res.json({ success: true });
  });

  app.post("/api/admin/lots/:lotId", (req, res) => {
    const { lotId } = req.params;
    if (lots[lotId]) {
      lots[lotId] = { ...lots[lotId], ...req.body };
      return res.json({ success: true, lot: lots[lotId] });
    }
    res.status(404).json({ error: "Lot node missing" });
  });

  // ALLOCATION CRUD
  app.post("/api/admin/allocations/create", (req, res) => {
    const allocation = { ...req.body, id: Math.random().toString(36).substring(7) };
    allocations.unshift(allocation);
    res.json({ success: true });
  });

  app.delete("/api/admin/allocations/:id", (req, res) => {
    const idx = allocations.findIndex(a => a.id === req.params.id);
    if (idx > -1) allocations.splice(idx, 1);
    res.json({ success: true });
  });

  // VELOCITY SIMULATOR (KV Mimic)
  const startSimulation = () => {
    setInterval(() => {
      Object.keys(lots).forEach(id => {
        const lot = lots[id];
        if (lot.velocity !== 'Static' && lot.status === 'Active' && lot.currentBid < lot.ceiling) {
          const baseStep = lot.velocity === 'High' ? 800 : 300;
          const step = Math.floor(Math.random() * baseStep) + 100;
          lot.currentBid += step;
          lot.bidHistory.unshift({
            id: `ghost_${Date.now()}`,
            user: `Institutional_Client_${Math.floor(Math.random()*999)}`,
            amount: lot.currentBid,
            time: new Date().toISOString()
          });
        }
      });
    }, 20000); // 20s pulse
  };
  startSimulation();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
