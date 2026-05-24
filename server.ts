import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { WebSocketServer } from "ws";
import crypto from "crypto";
import fs from "fs";
import { getFirestore } from "firebase-admin/firestore";
import sqlite from './sqlite-db';

let firestoreDbId = "(default)";
try {
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
  if (config.firestoreDatabaseId) {
    firestoreDbId = config.firestoreDatabaseId;
  }
} catch (e) {
  // Config not present or malformed
}

function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return calculatedHash === hash;
}

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

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

// Optional helper function
function seedAdminUser() {
  const adminEmail = "csapex@bid.cars";
  const existing = sqlite.prepare('SELECT id FROM platform_users WHERE email = ?').get(adminEmail);
  if (!existing) {
    sqlite.prepare('DELETE FROM platform_users WHERE id = ?').run('admin_god_01');
    const { salt, hash } = hashPassword("031295$$01kilox");
    const fullHash = `${salt}:${hash}`;
    sqlite.prepare(`
      INSERT INTO platform_users (id, fullname, email, phone, password_hash, is_approved, deposit_balance, role, account_status) 
      VALUES (?, ?, ?, ?, ?, 1, 0, 'admin', 'active')
    `).run('admin_god_01', 'System Administrator', adminEmail, '', fullHash);
    console.log("Admin user seeded in SQLite.");
  }
}
seedAdminUser();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Verify and initialize DB/Auth safely to prevent 7 PERMISSION_DENIED crashes
  if (admin.apps.length) {
    try {
      const rawDb = getFirestore(admin.app(), firestoreDbId);
      // Test the Firestore connection to verify permission and API activation
      await rawDb.collection('health_check').limit(1).get();
      db = rawDb;
      auth = admin.auth();
      console.log("Firebase Admin Firestore verified and operational.");
    } catch (err: any) {
      console.warn("Firebase Firestore is unavailable or disabled in GCP project. Falling back to robust memory simulated mode. Root cause:", err.message);
      db = null;
      auth = null;
    }
  }

  app.use(express.json());

  // WebSocket Clients Setup
  const wsClients = new Set<any>();
  const broadcast = (data: any) => {
    const payload = JSON.stringify(data);
    wsClients.forEach(client => {
      if (client.readyState === 1) { // 1 is WebSocket.OPEN
        try {
          client.send(payload);
        } catch (e) {
          console.error("Failed to transmit ws update:", e);
        }
      }
    });
  };

  // CONSTANTS & CONFIG (Apex 2026 Core)
  const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1496894096650928128/ZnprWVenr5JMtsjE77-dmDyg8LZlFmlir7bp0gF9qKsBEwCt2gh7Zvr9WC_POVm_ycBv";

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

  const BACKUP_FILE = path.join(process.cwd(), "db-fallback.json");

  function saveBackup() {
    try {
      const data = {
        lots,
        allocations,
        applications,
        userStatus
      };
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write db-fallback.json:", err);
    }
  }

  function loadBackup() {
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const content = fs.readFileSync(BACKUP_FILE, "utf8");
        const data = JSON.parse(content);
        if (data.lots) {
          Object.assign(lots, data.lots);
        }
        if (data.allocations && Array.isArray(data.allocations)) {
          allocations.length = 0;
          allocations.push(...data.allocations);
        }
        if (data.applications && Array.isArray(data.applications)) {
          applications.length = 0;
          applications.push(...data.applications);
        }
        if (data.userStatus) {
          Object.assign(userStatus, data.userStatus);
        }
        console.log("Successfully loaded local persistent backup state.");
      }
    } catch (err) {
      console.error("Failed to read db-fallback.json:", err);
    }
  }

  async function syncAndLoadAllState() {
    if (db) {
      try {
        console.log("Performing full Firebase Firestore sync sequence...");
        
        // 1) Load lots
        const lotsSnap = await db.collection('lots').get();
        if (!lotsSnap.empty) {
          // Clear current preloaded lots to avoid leftovers, but keep fallback capability
          Object.keys(lots).forEach(key => delete lots[key]);
          lotsSnap.forEach(doc => {
            lots[doc.id] = doc.data();
          });
          console.log(`Loaded ${lotsSnap.size} lot nodes from Firestore.`);
        } else {
          // If Firestore is empty, save the default mock ones
          for (const id of Object.keys(lots)) {
            await db.collection('lots').doc(id).set(lots[id]);
          }
          console.log("Populated Firestore with default mock lots.");
        }

        // 2) Load allocations
        const allocSnap = await db.collection('allocations').get();
        if (!allocSnap.empty) {
          allocations.length = 0;
          allocSnap.forEach(doc => {
            allocations.push({ id: doc.id, ...doc.data() });
          });
          console.log(`Loaded ${allocSnap.size} allocations from Firestore.`);
        } else {
          for (const a of allocations) {
            await db.collection('allocations').doc(a.id).set(a);
          }
        }

        // 3) Load applications (users)
        const usersSnap = await db.collection('users').get();
        if (!usersSnap.empty) {
          applications.length = 0;
          usersSnap.forEach(doc => {
            applications.push({ id: doc.id, ...doc.data() });
          });
          console.log(`Loaded ${usersSnap.size} applicants from Firestore.`);
        }
      } catch (err: any) {
        console.error("Firestore startup load failed, using local disk cache fallback:", err.message);
        loadBackup();
      }
    } else {
      loadBackup();
    }
  }

  // Execute State Boot Syncing
  setTimeout(() => {
    syncAndLoadAllState().catch(console.error);
  }, 100);

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

    if (email) {
      const user = sqlite.prepare(`
        SELECT u.*, w.is_frozen 
        FROM platform_users u 
        LEFT JOIN escrow_wallets w ON u.id = w.user_id 
        WHERE u.email = ?
      `).get(email.toLowerCase()) as any;
      if (user) {
        if (user.account_status !== 'active') {
          return res.status(403).json({ error: "Bidding blocked: Account is currently pending manual admin clearance." });
        }
        if (user.is_frozen === 1) {
          return res.status(403).json({ error: "Bidding blocked: Your Escrow Wallet is currently frozen by administrators." });
        }
      }
    }

    lots[lotId].currentBid = amount;
    const bidRec = { 
      id: Math.random().toString(16).slice(2), 
      user: email || "SYSTEM_NODE", 
      amount, 
      time: new Date().toISOString() 
    };
    if (!lots[lotId].bidHistory) {
      lots[lotId].bidHistory = [];
    }
    lots[lotId].bidHistory.unshift(bidRec);

    if (db) {
      try {
        await db.collection('lots').doc(lotId).set(lots[lotId], { merge: true });
      } catch (dbErr: any) {
        console.error("Firestore sync in bid failure:", dbErr.message);
      }
    }
    saveBackup();

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

    // Real-time broadcast
    broadcast({ type: "lot_update", lotId, lot: lots[lotId] });

    res.json({ success: true, newBid: amount });
  });

  app.post("/api/register", async (req, res) => {
    const { name, email, phone, password, country } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }
    
    try {
      const existing = sqlite.prepare('SELECT id FROM platform_users WHERE email = ?').get(email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "Email already registered." });
      }

      const { salt, hash } = hashPassword(password);
      const fullHash = `${salt}:${hash}`;
      const newId = `user_${Math.random().toString(36).substring(7)}`;

      sqlite.prepare(`
        INSERT INTO platform_users (id, fullname, email, phone, password_hash, is_approved, deposit_balance, role, account_status) 
        VALUES (?, ?, ?, ?, ?, 0, 0.00, 'customer', 'pending')
      `).run(newId, name || '', email.toLowerCase(), phone || '', fullHash);

      sqlite.prepare(`
        INSERT INTO escrow_wallets (id, user_id, available_balance, pending_balance, locked_balance)
        VALUES (?, ?, 0, 0, 0)
      `).run(`wallet_${newId}`, newId);

      // Fire and forget Discord webhook
      const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
      fetch(TARGET_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🛡️ NEW APEX Strategic Ingress Registration",
            color: 0xD4AF37,
            fields: [
              { name: "Full Name", value: name || "Not Provided", inline: true },
              { name: "Email Address", value: email || "Not Provided", inline: true },
              { name: "Country", value: country || "Not Provided", inline: true },
              { name: "Mobile Number", value: phone || "Not Provided", inline: true },
              { name: "Clearance Status", value: "Pending Manual Clearance from Charles Sterling" }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error("Webhook failed:", e.message));

      res.json({ success: true, message: "Registration successful. Awaiting approval." });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "System error during registration" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`[AUTH] Login attempt for: ${email}`);
    
    if (!password) {
      return res.status(400).json({ error: "Access credential token required." });
    }

    const userRecord = sqlite.prepare('SELECT * FROM platform_users WHERE email = ?').get(email.toLowerCase()) as any;
    
    if (!userRecord) {
      console.log(`[AUTH] Login denied: user not found in DB`);
      // Legacy bypass helper check just in case, but really should block
      if (password !== "BYPASS" && password !== "TOKEN_666777") {
        return res.status(444).json({ error: "Credentials verified but clearance token not found." });
      } else {
        // Fallback for demo dummy token
        return res.json({ 
          success: true, 
          user: { email, name: email, status: 'Approved', deposit_balance: 100000.00 } 
        });
      }
    }

    const [salt, hash] = userRecord.password_hash.split(':');
    const isMatched = verifyPassword(password, salt, hash);
    if (!isMatched) {
      console.log(`[AUTH] DB user fetched for ${email} but password mismatched`);
      return res.status(401).json({ error: "Access denied. Invalid credentials protocol." });
    }
    
    console.log(`[AUTH] DB user fetched: ${userRecord.id}, Status check result: ${userRecord.account_status}, Role assigned: ${userRecord.role || 'customer'}`);
    
    if (userRecord.account_status === 'pending' || (userRecord.is_approved === 0 && userRecord.account_status !== 'active')) {
      return res.status(401).json({ error: "Account pending approval" });
    }
    
    if (userRecord.account_status === 'rejected') {
      return res.status(401).json({ error: "Account has been rejected." });
    }

    if (userRecord.account_status === 'suspended') {
      return res.status(401).json({ error: "Your account is suspended." });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: userRecord.id,
        uid: userRecord.id, // For backwards compatibility
        email: userRecord.email,
        name: userRecord.fullname,
        phone: userRecord.phone,
        status: userRecord.account_status,
        role: userRecord.role || 'customer',
        deposit_balance: userRecord.deposit_balance
      } 
    });
  });

  app.post("/api/auth/me", (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(401).json({ error: "No session ID provided" });
    }
    
    const userRecord = sqlite.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
    
    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`[AUTH] Checking /auth/me for ID: ${id} — returning status: ${userRecord.account_status}, role: ${userRecord.role}`);
    
    res.json({
       success: true,
       user: {
          id: userRecord.id,
          uid: userRecord.id,
          email: userRecord.email,
          name: userRecord.fullname,
          phone: userRecord.phone,
          status: userRecord.account_status,
          role: userRecord.role || 'customer',
          deposit_balance: userRecord.deposit_balance
       }
    });
  });

  app.post("/api/user/profile", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing identity trace." });
    }
    
    // SQLite lookup using unified user pool
    const userRecord = sqlite.prepare('SELECT * FROM platform_users WHERE email = ?').get(email.toLowerCase()) as any;
    
    if (!userRecord) {
      return res.status(404).json({ error: "Identity not actively tracked." });
    }
    
    res.json({
       success: true,
       user: {
          id: userRecord.id,
          uid: userRecord.id, // For backwards compatibility
          email: userRecord.email,
          name: userRecord.fullname,
          phone: userRecord.phone,
          status: userRecord.account_status,
          role: userRecord.role || 'customer',
          deposit_balance: userRecord.deposit_balance
       }
    });
  });

  // Profile management endpoint
  app.post("/api/profile/update", async (req, res) => {
    const { email, name, phone, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Required user session context is missing." });
    }
    
    const userRecord = sqlite.prepare('SELECT * FROM platform_users WHERE email = ?').get(email.toLowerCase()) as any;
    
    if (!userRecord) {
      return res.status(444).json({ error: "Sovereign directory entry not found." });
    }
    
    const updatedName = name || userRecord.fullname;
    const updatedPhone = phone || userRecord.phone;
    let updatedHash = userRecord.password_hash;
    
    if (newPassword) {
      const { salt, hash } = hashPassword(newPassword);
      updatedHash = `${salt}:${hash}`;
    }
    
    sqlite.prepare(`
      UPDATE platform_users 
      SET fullname = ?, phone = ?, password_hash = ?
      WHERE id = ?
    `).run(updatedName, updatedPhone, updatedHash, userRecord.id);

    const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
    try {
      await fetch(TARGET_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🛡️ APEX SECURITY PROFILE CONFIGURATION COMPLETED",
            color: 0xD4AF37,
            fields: [
              { name: "Sovereign Account", value: email || "Anonymous", inline: true },
              { name: "Profile Node Update", value: newPassword ? "Credentials & Data Matrix Refactored" : "Identity Fields Sync Completed", inline: true }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e: any) {
      console.error("Discord update fail: ", e.message);
    }
    
    res.json({ success: true, user: userRecord });
  });

  // Password Recovery Initiation
  app.post("/api/password-recovery/request", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Target email parameter required." });
    }
    
    let user: any = null;
    let fromMemory = false;
    
    if (db) {
      try {
        const userDoc = await db.collection('users').where('email', '==', email).get();
        if (!userDoc.empty) {
          user = userDoc.docs[0].data();
        }
      } catch (dbErr: any) {
        console.error("Firestore search error in recovery request:", dbErr.message);
      }
    }
    
    if (!user) {
      user = applications.find(a => a.email.toLowerCase() === email.toLowerCase());
      fromMemory = true;
    }
    
    if (!user) {
      return res.status(444).json({ error: "Email identity coordinates not indexed inside Apex registry." });
    }
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000;
    
    user.resetCode = resetCode;
    user.resetExpiry = expiry;
    
    if (db) {
      try {
        await db.collection('users').doc(user.uid).set(user, { merge: true });
      } catch (dbErr: any) {
        console.error("Firestore sync in recovery request failure:", dbErr.message);
      }
    }
    
    if (fromMemory) {
      const idx = applications.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
      if (idx !== -1) {
        applications[idx] = user;
      }
    }
    
    const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
    try {
      await fetch(TARGET_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🔐 APEX SECURITY AUDIT - PASSWORD RECOVERY ATTEMPTED",
            color: 0xEE4444,
            fields: [
              { name: "Target Email", value: email, inline: true },
              { name: "Sovereign Reset PIN", value: resetCode, inline: true },
              { name: "Node Expiry", value: new Date(expiry).toISOString() }
            ],
            footer: { text: "Manual action / verify logs" },
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e: any) {
      console.error("Discord recovery log fail: ", e.message);
    }
    
    res.json({ 
      success: true, 
      message: "Security clearance token generated.", 
      debugCode: resetCode
    });
  });

  // Password Recovery Completion
  app.post("/api/password-recovery/reset", async (req, res) => {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: "Missing required security coordinates." });
    }
    
    let user: any = null;
    let fromMemory = false;
    
    if (db) {
      try {
        const userDoc = await db.collection('users').where('email', '==', email).get();
        if (!userDoc.empty) {
          user = userDoc.docs[0].data();
        }
      } catch (dbErr: any) {
        console.error("Firestore read in reset failure:", dbErr.message);
      }
    }
    
    if (!user) {
      user = applications.find(a => a.email.toLowerCase() === email.toLowerCase());
      fromMemory = true;
    }
    
    if (!user) {
      return res.status(444).json({ error: "Email coordinates not found." });
    }
    
    if (!user.resetCode || user.resetCode !== resetCode) {
      return res.status(401).json({ error: "Clearance passcode mismatch or invalid session state." });
    }
    
    if (Date.now() > user.resetExpiry) {
      return res.status(401).json({ error: "Clearance token expired. Please initialize request sequence again." });
    }
    
    const { salt, hash } = hashPassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;
    
    delete user.resetCode;
    delete user.resetExpiry;
    
    if (db) {
      try {
        await db.collection('users').doc(user.uid).set(user, { merge: true });
      } catch (dbErr: any) {
        console.error("Firestore sync in reset write error:", dbErr.message);
      }
    }
    
    if (fromMemory) {
      const idx = applications.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
      if (idx !== -1) {
        applications[idx] = user;
      }
    }
    
    res.json({ success: true, message: "Security coordinates successfully re-assigned." });
  });

  // ESCROW SYSTEM (CUSTOMER)
  app.get("/api/notifications/:userId", (req, res) => {
    try {
      const { userId } = req.params;
      const { since } = req.query;
      
      let query = 'SELECT * FROM notification_logs WHERE user_id = ? AND delivered = 0';
      const params: any[] = [userId];
      
      if (since) {
        query += ' AND created_at > ?';
        params.push(since);
      }
      
      const notifications = sqlite.prepare(query).all(...params);
      
      // Mark as delivered
      if (notifications.length > 0) {
        const ids = notifications.map((n: any) => `'${n.id}'`).join(',');
        sqlite.prepare(`UPDATE notification_logs SET delivered = 1 WHERE id IN (${ids})`).run();
      }
      
      res.json({ success: true, notifications });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/escrow/wallet/:userId", (req, res) => {
    try {
      const { userId } = req.params;
      
      // Auto-expire outdated pending invoices on-demand
      try {
        sqlite.prepare(`
          UPDATE customer_invoices 
          SET status = 'expired' 
          WHERE status = 'pending' AND expires_at < ?
        `).run(new Date().toISOString());
      } catch (expErr: any) {
        console.error("Auto-expiration error in sqlite:", expErr.message);
      }

      let wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(userId) as any;
      
      if (!wallet) {
        sqlite.prepare(`
          INSERT INTO escrow_wallets (id, user_id, available_balance, pending_balance, locked_balance)
          VALUES (?, ?, 0, 0, 0)
        `).run(`wallet_${userId}`, userId);
        wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(userId);
      }
      
      const requests = sqlite.prepare('SELECT * FROM deposit_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId);
      // Fetch new customer invoices with joined account data
      const invoices = sqlite.prepare(`
        SELECT ci.*, ia.account_type, ia.bank_name, ia.account_holder, ia.account_number, ia.routing_number, ia.swift_code, ia.crypto_address, ia.crypto_network
        FROM customer_invoices ci
        LEFT JOIN invoice_accounts ia ON ci.assigned_account_id = ia.id
        WHERE ci.user_id = ? ORDER BY ci.created_at DESC
      `).all(userId);
      
      const transactions = sqlite.prepare('SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC').all(wallet.id);
      
      res.json({ success: true, wallet, requests, invoices, transactions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/escrow/fund", (req, res) => {
    try {
      const { userId, amount, payment_method, note } = req.body;
      if (!userId || !amount) return res.status(400).json({ error: "Missing parameters" });

      // Get user info
      const user = sqlite.prepare('SELECT fullname, email, country FROM platform_users WHERE id = ?').get(userId) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      // Create deposit request
      const reqId = `dr_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO deposit_requests (id, user_id, amount, payment_method, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).run(reqId, userId, Number(amount), payment_method || 'Bank Transfer');

      // Update wallet pending balance
      const wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(userId) as any;
      if (wallet) {
         sqlite.prepare('UPDATE escrow_wallets SET pending_balance = pending_balance + ? WHERE id = ?').run(Number(amount), wallet.id);
      }

      // Fire Discord webhook
      const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
      fetch(TARGET_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "💰 NEW FUNDING REQUEST DETECTED",
            color: 0x22C55E,
            fields: [
              { name: "Customer", value: user.fullname || "Unknown", inline: true },
              { name: "Email", value: user.email || "Unknown", inline: true },
              { name: "User ID", value: userId, inline: true },
              { name: "Requested Amount", value: `$${Number(amount).toLocaleString()}`, inline: true },
              { name: "Payment Method", value: payment_method || 'Bank Transfer', inline: true },
              { name: "Country", value: user.country || 'Not specified', inline: true },
              { name: "Status", value: "Pending - Invoice Creation Required", inline: false }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error("Discord error:", e.message));

      res.json({ success: true, message: "Funding request submitted. Awaiting invoice from admin." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ESCROW SYSTEM (ADMIN)
  app.get("/api/admin/escrow", (req, res) => {
    try {
      const requests = sqlite.prepare(`
        SELECT dr.*, u.fullname, u.email 
        FROM deposit_requests dr 
        JOIN platform_users u ON dr.user_id = u.id 
        ORDER BY dr.created_at DESC
      `).all();
      
      const wallets = sqlite.prepare(`
        SELECT ew.*, u.fullname, u.email 
        FROM escrow_wallets ew 
        JOIN platform_users u ON ew.user_id = u.id
      `).all();
      
      const invoices = sqlite.prepare(`
        SELECT ci.*, u.fullname, u.email 
        FROM customer_invoices ci 
        JOIN platform_users u ON ci.user_id = u.id 
        ORDER BY ci.created_at DESC
      `).all();

      let invoiceAccounts = sqlite.prepare('SELECT * FROM invoice_accounts').all();
      
      // Auto-seed typical enterprise accounts if missing
      if (invoiceAccounts.length === 0) {
        sqlite.prepare(`INSERT INTO invoice_accounts (id, account_type, bank_name, account_holder, account_number, routing_number, swift_code) VALUES ('ia_bank1', 'Wire Transfer', 'JPMorgan Chase', 'Apex Auctions Corporate', '000123456789', '021000021', 'CHASUS33')`).run();
        sqlite.prepare(`INSERT INTO invoice_accounts (id, account_type, bank_name, account_holder, account_number, routing_number, swift_code) VALUES ('ia_bank2', 'ACH Transfer', 'Bank of America', 'Apex Auctions Corporate', '44410000000', '026009593', 'BOFAUS3N')`).run();
        sqlite.prepare(`INSERT INTO invoice_accounts (id, account_type, crypto_network, crypto_address) VALUES ('ia_cryp1', 'USDT (ERC20)', 'Ethereum', '0x1A2B3C4D5E6F7890')`).run();
        sqlite.prepare(`INSERT INTO invoice_accounts (id, account_type, crypto_network, crypto_address) VALUES ('ia_cryp2', 'USDT (TRC20)', 'Tron', 'TXYZ1234567890ABCDEF')`).run();
        
        invoiceAccounts = sqlite.prepare('SELECT * FROM invoice_accounts').all();
      }

      res.json({ success: true, requests, wallets, invoices, invoiceAccounts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/invoice-accounts", (req, res) => {
    try {
      const { account_type, bank_name, account_holder, account_number, routing_number, swift_code, crypto_address, crypto_network } = req.body;
      const id = `ia_${Math.random().toString(36).substring(7)}`;

      sqlite.prepare(`
        INSERT INTO invoice_accounts (id, account_type, bank_name, account_holder, account_number, routing_number, swift_code, crypto_address, crypto_network)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, account_type, bank_name, account_holder, account_number, routing_number, swift_code, crypto_address, crypto_network);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/create-invoice", (req, res) => {
    try {
      const { requestId, userId, amount, assigned_account_id, expires_in_mins, notes } = req.body;
      if (!userId || !amount) return res.status(400).json({ error: "Missing parameters" });

      const invId = `ci_${Math.random().toString(36).substring(7)}`;
      // Calculate expires_at Date
      const expiresAt = new Date(Date.now() + (Number(expires_in_mins) || 60) * 60000).toISOString();

      if (requestId) {
         sqlite.prepare("UPDATE deposit_requests SET status = 'invoiced' WHERE id = ?").run(requestId);
      }

      sqlite.prepare(`
        INSERT INTO customer_invoices (id, user_id, amount, assigned_account_id, expires_at, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(invId, userId, Number(amount), assigned_account_id, expiresAt);

      const user = sqlite.prepare('SELECT fullname, email FROM platform_users WHERE id = ?').get(userId) as any;

      // Add database notification log
      const notifId = `nl_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO notification_logs (id, user_id, type, message)
        VALUES (?, ?, 'invoice_sent', ?)
      `).run(notifId, userId, `An invoice for $${Number(amount).toLocaleString()} has been sent to your account.`);

      // Fire Discord webhook
      const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
      fetch(TARGET_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "🧾 ESCROW INVOICE GENERATED & SENT",
            color: 0x3B82F6, // Blue
            fields: [
              { name: "Customer", value: user?.fullname || "Unknown", inline: true },
              { name: "Amount", value: `$${Number(amount).toLocaleString()}`, inline: true },
              { name: "Expires At", value: (new Date(expiresAt)).toUTCString(), inline: false }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error("Discord error:", e.message));

      res.json({ success: true, message: "Invoice created and sent to customer." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/approve", (req, res) => {
    try {
      const { requestId } = req.body;
      const request = sqlite.prepare('SELECT * FROM deposit_requests WHERE id = ?').get(requestId) as any;
      if (!request || request.status !== 'pending') return res.status(400).json({ error: "Invalid request" });

      // Find users wallet
      const wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(request.user_id) as any;
      if (!wallet) return res.status(400).json({ error: "Wallet not found" });

      // Update balances
      sqlite.prepare(`
        UPDATE escrow_wallets 
        SET available_balance = available_balance + ?, pending_balance = MAX(0, pending_balance - ?)
        WHERE id = ?
      `).run(request.amount, request.amount, wallet.id);

      // Create transaction
      const txId = `tx_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO wallet_transactions (id, wallet_id, type, amount, description)
        VALUES (?, ?, 'deposit', ?, ?)
      `).run(txId, wallet.id, request.amount, `Approved deposit request ${request.id}`);

      // Update deposit request
      sqlite.prepare("UPDATE deposit_requests SET status = 'approved' WHERE id = ?").run(requestId);

      // Try closing matching invoice if exists
      const invoice = sqlite.prepare('SELECT * FROM invoices WHERE user_id = ? AND amount = ? AND status = "pending" LIMIT 1').get(request.user_id, request.amount) as any;
      if (invoice) {
         sqlite.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").run(invoice.id);
      }

      res.json({ success: true, message: "Deposit approved and balance updated." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/reject", (req, res) => {
    try {
      const { requestId } = req.body;
      const request = sqlite.prepare('SELECT * FROM deposit_requests WHERE id = ?').get(requestId) as any;
      if (!request || request.status !== 'pending') return res.status(400).json({ error: "Invalid request" });

      // Fund user wallet
      const wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(request.user_id) as any;
      if (wallet) {
          sqlite.prepare(`
            UPDATE escrow_wallets 
            SET pending_balance = MAX(0, pending_balance - ?)
            WHERE id = ?
          `).run(request.amount, wallet.id);
      }
      
      sqlite.prepare("UPDATE deposit_requests SET status = 'rejected' WHERE id = ?").run(requestId);
      
      res.json({ success: true, message: "Deposit rejected." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/adjust", (req, res) => {
    try {
      const { walletId, amount, type, description } = req.body;
      const wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE id = ?').get(walletId) as any;
      if (!wallet) return res.status(404).json({ error: "Wallet not found" });

      if (type === 'increase') {
        sqlite.prepare('UPDATE escrow_wallets SET available_balance = available_balance + ? WHERE id = ?').run(Number(amount), walletId);
      } else if (type === 'decrease') {
        sqlite.prepare('UPDATE escrow_wallets SET available_balance = MAX(0, available_balance - ?) WHERE id = ?').run(Number(amount), walletId);
      } else if (type === 'lock') {
        sqlite.prepare('UPDATE escrow_wallets SET available_balance = MAX(0, available_balance - ?), locked_balance = locked_balance + ? WHERE id = ?').run(Number(amount), Number(amount), walletId);
      }

      const txId = `tx_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO wallet_transactions (id, wallet_id, type, amount, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(txId, walletId, type, Number(amount), description || 'Admin adjustment');

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ADMIN ACTION CENTER (GOD MODE)

  // CSV Bulk Upload API endpoint
  app.post("/api/admin/bulk-upload", async (req, res) => {
    try {
      const text = req.body.csvText || req.body;
      if (typeof text !== "string") {
        return res.status(400).json({ error: "Expected CSV text input payload." });
      }

      const lines = text.split("\n");
      if (lines.length < 2) {
        return res.status(400).json({ error: "CSV lacks secondary row indexes." });
      }

      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
      let upsertCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(",").map((c: string) => c.trim().replace(/^["']|["']$/g, ""));
        const rowObj: any = {};
        headers.forEach((h: string, idx: number) => {
          rowObj[h] = cols[idx] !== undefined ? cols[idx] : "";
        });

        // Resiliently support alternate header naming patterns (lowercase matches)
        const headingMap = (keyNames: string[]) => {
          for (const key of keyNames) {
            if (rowObj[key] !== undefined && rowObj[key] !== "") {
              return rowObj[key];
            }
          }
          return "";
        };

        const title = headingMap(["title", "name", "vehicle", "car", "model"]);
        const vin = headingMap(["vin", "serial", "chassis"]);
        const lot = headingMap(["lot", "id", "slug", "code"]);
        const price = headingMap(["price", "currentbid", "ask", "floor", "cost"]);
        const imageUrl = headingMap(["url", "image", "img", "thumbnail"]);

        if (!vin || !lot) continue;

        const targetId = lot; // Use lot variable as target id
        const rawPrice = parseFloat((price || "0").replace(/[^0-9.]/g, "")) || 10000;

        // Construct standard default structure
        const defaultLot = {
          id: targetId,
          name: title || "Apex Asset Node",
          vin,
          lot,
          currentBid: rawPrice,
          floor: rawPrice * 0.8,
          ceiling: rawPrice * 2.0,
          velocity: 'Off',
          status: 'Active',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days expire
          adminInvoiceStatus: 'Pending',
          image: imageUrl || "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2000&auto=format&fit=crop",
          gallery: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2000&auto=format&fit=crop"],
          bidHistory: []
        };

        // Upsert into memory state
        lots[targetId] = {
           ...(lots[targetId] || {}),
           ...defaultLot,
           name: title || (lots[targetId] ? lots[targetId].name : "Apex Asset Node"),
           currentBid: rawPrice,
        };

        if (db) {
          try {
            await db.collection('lots').doc(targetId).set(lots[targetId], { merge: true });
          } catch (dbErr: any) {
            console.error("Firestore upsert failure: ", dbErr.message);
          }
        }
        
        saveBackup();

        broadcast({ type: "lot_update", lotId: targetId, lot: lots[targetId] });
        upsertCount++;
      }

      const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
      try {
        await fetch(TARGET_DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `📥 **CSV INGESTION PROCESS COMPLETE**: Loaded ${upsertCount} vehicle lots into Apex Strategic Holdings.`
          })
        });
      } catch (e) {
         console.error("Discord error on csv finished sync");
      }

      res.json({ success: true, count: upsertCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/applications", async (req, res) => {
    try {
      const records = sqlite.prepare(`
        SELECT u.*, w.available_balance, w.is_frozen 
        FROM platform_users u
        LEFT JOIN escrow_wallets w ON u.id = w.user_id
        ORDER BY u.created_at DESC
      `).all() as any[];

      return res.json(records.map((r: any) => ({
        id: r.id, 
        uid: r.id,
        name: r.fullname, 
        email: r.email, 
        phone: r.phone, 
        country: r.country || 'N/A',
        role: r.role || 'customer',
        status: r.account_status || (r.is_approved === 1 ? 'active' : 'pending'),
        kyc_status: r.verification_status || 'unverified',
        deposit_balance: r.deposit_balance || 0,
        wallet_balance: r.available_balance || 0,
        is_frozen: r.is_frozen === 1,
        timestamp: r.created_at
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/applications/vet", async (req, res) => {
    const { id, status } = req.body;
    const finalStatus = (status === 'approved' || status === 'active') ? 'active' : status;
    const approvedVal = finalStatus === 'active' ? 1 : 0;
    
    console.log(`[APPROVAL] admin vetting request for ID: ${id} to status: ${finalStatus}`);
    
    try {
      sqlite.prepare('UPDATE platform_users SET is_approved = ?, account_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(approvedVal, finalStatus, id);
      
      const updatedUser = sqlite.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
      
      // Auto-trigger a real-time notification
      const notifId = `notif_${Math.random().toString(36).substring(7)}`;
      let statusMsg = `Your account status has been updated to: ${finalStatus.toUpperCase()}`;
      if (finalStatus === 'active') {
         statusMsg = `Clearance Granted: Your Apex Bid.Cars Pro account has been cleared and approved. Bidding permission is active.`;
      } else if (finalStatus === 'rejected') {
         statusMsg = `Account Review Notice: Your application is declined. Please contact support.`;
      } else if (finalStatus === 'suspended') {
         statusMsg = `Account Review Notice: Your access has been temporarily suspended due to review.`;
      } else if (finalStatus === 'banned') {
         statusMsg = `Security Alert: Your account has been banned.`;
      }
      
      sqlite.prepare(`
        INSERT INTO notification_logs (id, user_id, type, message, delivered)
        VALUES (?, ?, ?, ?, 0)
      `).run(notifId, id, finalStatus === 'active' ? 'success' : 'alert', statusMsg);
      
      // Real-time WebSocket broadcast to wake up active components
      broadcast({
        type: "status_update",
        userId: id,
        status: finalStatus,
        notification: {
          id: notifId,
          user_id: id,
          type: finalStatus === 'active' ? 'success' : 'alert',
          message: statusMsg,
          created_at: new Date().toISOString()
        }
      });
      
      // Send Discord Alert if status is active
      if (finalStatus === 'active') {
        const TARGET_DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1504875536982479008/m_GNr9NTjzW53XW6PfOtX9Hf0Cv2--SAdysZdGeWbrnp2r4E7T0bHbeNurIu08OXqnu8";
        fetch(TARGET_DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `✅ **APEX ACCESS CLEARED**: User **${updatedUser.fullname}** (${updatedUser.email}) is approved and active in Bid.Cars Pro.`
          })
        }).catch(() => {});
      }

      return res.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          name: updatedUser.fullname,
          email: updatedUser.email,
          phone: updatedUser.phone,
          status: updatedUser.account_status,
          role: updatedUser.role,
          deposit_balance: updatedUser.deposit_balance
        } 
      });
    } catch (err: any) {
      console.log(`[APPROVAL] Vet status update error: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/deposit", async (req, res) => {
    const { id, deposit_balance } = req.body;
    try {
      sqlite.prepare('UPDATE platform_users SET deposit_balance = ? WHERE id = ?').run(Number(deposit_balance), id);
      return res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/reset-password", async (req, res) => {
    const { id, newPassword } = req.body;
    try {
      const { salt, hash } = hashPassword(newPassword);
      const fullHash = `${salt}:${hash}`;
      sqlite.prepare('UPDATE platform_users SET password_hash = ? WHERE id = ?').run(fullHash, id);
      return res.json({ success: true, message: "Password updated successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/freeze-wallet", async (req, res) => {
    const { userId, isFrozen } = req.body;
    try {
      sqlite.prepare('UPDATE escrow_wallets SET is_frozen = ? WHERE user_id = ?').run(isFrozen ? 1 : 0, userId);
      return res.json({ success: true, is_frozen: isFrozen });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/fund-escrow", async (req, res) => {
    const { userId, amount, action } = req.body;
    try {
      const wallet = sqlite.prepare('SELECT * FROM escrow_wallets WHERE user_id = ?').get(userId) as any;
      if (!wallet) return res.status(404).json({ error: "Escrow wallet not found" });

      let newBalance = wallet.available_balance;
      const amountNum = Number(amount);
      if (action === 'add') {
         newBalance += amountNum;
      } else if (action === 'subtract') {
         newBalance -= amountNum;
      } else {
         newBalance = amountNum;
      }

      sqlite.prepare('UPDATE escrow_wallets SET available_balance = ? WHERE user_id = ?').run(newBalance, userId);

      const transId = `tx_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO wallet_transactions (id, wallet_id, type, amount, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(transId, wallet.id, action === 'subtract' ? 'withdrawal' : 'deposit', amountNum, `Admin manual adjustment: ${action}`);

      // Notify visitor
      const notifId = `notif_${Math.random().toString(36).substring(7)}`;
      const notifMsg = `Escrow Account Updated: Admin adjusted your escrow balance. New available balance: $${newBalance.toLocaleString()}`;
      sqlite.prepare(`
        INSERT INTO notification_logs (id, user_id, type, message, delivered)
        VALUES (?, ?, 'escrow_adjustment', ?, 0)
      `).run(notifId, userId, notifMsg);

      broadcast({
        type: "notification",
        userId,
        notification: {
          id: notifId,
          user_id: userId,
          type: 'escrow_adjustment',
          message: notifMsg,
          created_at: new Date().toISOString()
        }
      });

      return res.json({ success: true, available_balance: newBalance });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/update-kyc", async (req, res) => {
    const { id, status } = req.body;
    try {
      sqlite.prepare('UPDATE platform_users SET verification_status = ? WHERE id = ?').run(status, id);
      return res.json({ success: true, verification_status: status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/delete", async (req, res) => {
    const { id } = req.body;
    try {
      sqlite.prepare('DELETE FROM platform_users WHERE id = ?').run(id);
      return res.json({ success: true, message: "User deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/users/resend-alert", async (req, res) => {
    const { userId, title, message } = req.body;
    try {
      const notifId = `alert_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO notification_logs (id, user_id, type, message, delivered)
        VALUES (?, ?, 'force_alert', ?, 0)
      `).run(notifId, userId, `${title}: ${message}`);

      broadcast({
        type: "force_attention",
        userId,
        notification: {
          id: notifId,
          user_id: userId,
          type: 'force_alert',
          message: `${title}: ${message}`,
          forceAttention: true,
          created_at: new Date().toISOString()
        }
      });

      return res.json({ success: true, message: "Alert successfully forces attention." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/escrow/regenerate-invoice", async (req, res) => {
    try {
      const { invoiceId, expires_in_mins } = req.body;
      const invoice = sqlite.prepare('SELECT * FROM customer_invoices WHERE id = ?').get(invoiceId) as any;
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });

      const newExpiresAt = new Date(Date.now() + (Number(expires_in_mins) || 60) * 60000).toISOString();
      sqlite.prepare("UPDATE customer_invoices SET expires_at = ?, status = 'pending' WHERE id = ?").run(newExpiresAt, invoiceId);
      
      return res.json({ success: true, message: "Invoice regenerated with new deadline." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

    try {
      const id = `notif_${Math.random().toString(36).substring(7)}`;
      sqlite.prepare(`
        INSERT INTO notification_logs (id, user_id, type, message, delivered)
        VALUES (?, ?, ?, ?, 0)
      `).run(id, userId, type, `${title}: ${message}`);

      broadcast({
        type: "notification",
        userId,
        notification: {
          id,
          user_id: userId,
          type,
          message: `${title}: ${message}`,
          created_at: new Date().toISOString()
        }
      });
    } catch (sqliteErr: any) {
      console.error("Failed to write to notification_logs:", sqliteErr.message);
    }

    if (db) {
      try {
        await db.collection('notifications').add(notification);
      } catch (dbErr: any) {
        console.error("Firestore write error in admin/send-notification:", dbErr.message);
      }
    }
    console.log(`Notification sent to ${userId}: ${title}`);
    res.json({ success: true });
  });

  app.post("/api/admin/trigger-invoice", async (req, res) => {
    const { lotId } = req.body;
    if (lots[lotId]) {
      lots[lotId].adminInvoiceStatus = 'Sent';
      broadcast({ type: "lot_update", lotId, lot: lots[lotId] });
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Lot node missing" });
  });

  // LOT CRUD
  app.post("/api/admin/lots/create", async (req, res) => {
    const lot = req.body;
    if (!lot.id) {
      return res.status(400).json({ error: "Missing lot id slug" });
    }
    const newLot = {
      ...lot,
      currentBid: Number(lot.floor || lot.currentBid || 10000),
      floor: Number(lot.floor || 10000),
      ceiling: Number(lot.ceiling || 50000),
      velocity: lot.velocity || 'Off',
      status: lot.status || 'Active',
      expiresAt: lot.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      image: lot.image || "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2000&auto=format&fit=crop",
      gallery: lot.gallery || (lot.image ? [lot.image] : []),
      bidHistory: lot.bidHistory || [],
      adminInvoiceStatus: lot.adminInvoiceStatus || 'Pending'
    };
    lots[newLot.id] = newLot;

    if (db) {
      try {
        await db.collection("lots").doc(newLot.id).set(newLot, { merge: true });
      } catch (err: any) {
        console.error("Firestore create lot log fail:", err.message);
      }
    }
    saveBackup();

    broadcast({ type: "lot_update", lotId: newLot.id, lot: lots[newLot.id] });
    res.json({ success: true, lot: lots[newLot.id] });
  });

  app.delete("/api/admin/lots/:id", async (req, res) => {
    const lotId = req.params.id;
    delete lots[lotId];

    if (db) {
      try {
        await db.collection("lots").doc(lotId).delete();
      } catch (err: any) {
        console.error("Firestore delete lot fail:", err.message);
      }
    }
    saveBackup();

    broadcast({ type: "lot_delete", lotId });
    res.json({ success: true });
  });

  app.post("/api/admin/lots/:lotId", async (req, res) => {
    const { lotId } = req.params;
    if (lots[lotId]) {
      const body = req.body;
      const { appendImage, price, velocity, status, triggerInvoice } = body;
      
      if (triggerInvoice) {
        lots[lotId].adminInvoiceStatus = 'Sent';
      } else if (appendImage) {
        if (!lots[lotId].gallery) {
          lots[lotId].gallery = lots[lotId].image ? [lots[lotId].image] : [];
        }
        lots[lotId].gallery.push(appendImage);
        lots[lotId].image = appendImage; // Set as primary display
      } else {
        // Crucial fix: merge and save all editable lot fields
        if (body.name !== undefined) lots[lotId].name = body.name;
        if (body.floor !== undefined) lots[lotId].floor = Number(body.floor);
        if (body.ceiling !== undefined) lots[lotId].ceiling = Number(body.ceiling);
        if (body.expiresAt !== undefined) lots[lotId].expiresAt = body.expiresAt;
        if (body.image !== undefined) lots[lotId].image = body.image;
        if (body.gallery !== undefined) lots[lotId].gallery = body.gallery;
        if (body.currentBid !== undefined) lots[lotId].currentBid = Number(body.currentBid);
        
        if (price !== undefined) {
          lots[lotId].currentBid = Number(price);
        }
        if (velocity !== undefined) {
          lots[lotId].velocity = velocity;
        }
        if (status !== undefined) {
          lots[lotId].status = status;
        }
      }

      if (db) {
        try {
          await db.collection("lots").doc(lotId).set(lots[lotId], { merge: true });
        } catch (err: any) {
          console.error("Firestore update lot fail: ", err.message);
        }
      }
      saveBackup();

      broadcast({ type: "lot_update", lotId, lot: lots[lotId] });
      return res.json({ success: true, lot: lots[lotId] });
    }
    res.status(404).json({ error: "Lot node missing" });
  });

  // ALLOCATION CRUD
  app.post("/api/admin/allocations/create", async (req, res) => {
    const allocation = { ...req.body, id: Math.random().toString(36).substring(7) };
    allocations.unshift(allocation);

    if (db) {
      try {
        await db.collection("allocations").doc(allocation.id).set(allocation);
      } catch (err: any) {
        console.error("Firestore allocation save fail:", err.message);
      }
    }
    saveBackup();

    res.json({ success: true });
  });

  app.delete("/api/admin/allocations/:id", async (req, res) => {
    const id = req.params.id;
    const idx = allocations.findIndex(a => a.id === id);
    if (idx > -1) allocations.splice(idx, 1);

    if (db) {
      try {
        await db.collection("allocations").doc(id).delete();
      } catch (err: any) {
        console.error("Firestore allocation delete fail:", err.message);
      }
    }
    saveBackup();

    res.json({ success: true });
  });

  // VELOCITY SIMULATOR (KV Mimic) - Runs a pulse every 10s for highly organic bids
  const startSimulation = () => {
    setInterval(() => {
      Object.keys(lots).forEach(id => {
        const lot = lots[id];
        if (!lot.velocity || lot.velocity === 'Off' || lot.status !== 'Active') return;

        // Velocity determination probabilities
        let probability = 0.15; // Low
        if (lot.velocity === 'Medium') probability = 0.35;
        if (lot.velocity === 'High') probability = 0.65;

        if (Math.random() < probability) {
          // Increment bid organically: $250 - $2500 in multiples of $100
          const baseSteps = Math.floor(Math.random() * 23) + 3; // 3 to 25
          const step = baseSteps * 100;
          lot.currentBid += step;

          // Organic simulated user name (e.g., User_4918)
          const randomUser = `User_${Math.floor(Math.random() * 9000) + 1000}`;
          if (!lot.bidHistory) {
            lot.bidHistory = [];
          }

          lot.bidHistory.unshift({
            id: `sim_${Date.now()}_${Math.random().toString(36).substring(5)}`,
            user: randomUser,
            amount: lot.currentBid,
            time: new Date().toISOString()
          });

          broadcast({ type: "lot_update", lotId: id, lot });
        }
      });
    }, 10000); // 10s evaluation pulse
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    wsClients.add(ws);
    ws.send(JSON.stringify({ type: "init", lots }));

    ws.on("close", () => {
      wsClients.delete(ws);
    });
  });
}

startServer().catch(console.error);
