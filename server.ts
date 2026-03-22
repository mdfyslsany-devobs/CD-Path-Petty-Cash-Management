import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple local storage file path
const EXPENSES_FILE = path.join(process.cwd(), "expenses.json");

// Initialize Firebase if config exists
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
  const app = initializeApp(config);
  db = getFirestore(app, config.firestoreDatabaseId);
  console.log("Firebase initialized on backend");
} catch (error) {
  console.log("Firebase not initialized or config missing:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GET /api/expenses - Get all expenses from local file
  app.get("/api/expenses", async (req, res) => {
    try {
      let expenses = [];
      try {
        const data = await fs.readFile(EXPENSES_FILE, "utf-8");
        expenses = JSON.parse(data);
      } catch (err) {
        // If file doesn't exist, return empty array
        expenses = [];
      }
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to read expenses" });
    }
  });

  // POST /api/expenses - Save expense locally and to Firebase
  app.post("/api/expenses", async (req, res) => {
    const newExpense = req.body;
    
    try {
      // 1. Save locally to expenses.json
      let expenses = [];
      try {
        const data = await fs.readFile(EXPENSES_FILE, "utf-8");
        expenses = JSON.parse(data);
      } catch (err) {
        // File might not exist yet
      }
      
      expenses.push({ ...newExpense, id: Date.now().toString(), createdAt: Date.now() });
      await fs.writeFile(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
      console.log("Saved expense locally");

      // 2. Sync to Firebase if available
      if (db) {
        try {
          await addDoc(collection(db, "expenses"), newExpense);
          console.log("Synced expense to Firebase");
        } catch (firebaseError) {
          console.error("Firebase sync failed (offline or error):", firebaseError);
          // We still return success because it was saved locally
        }
      }

      res.json({ message: "Expense saved successfully", expense: newExpense });
    } catch (error) {
      console.error("Failed to save expense:", error);
      res.status(500).json({ error: "Failed to save expense" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
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

startServer();
