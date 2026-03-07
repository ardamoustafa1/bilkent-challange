import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { teamsRouter } from "./routes/teams.js";
import { judgesRouter } from "./routes/judges.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3001;

const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = corsOrigin
  ? { origin: corsOrigin.split(",").map((s) => s.trim()).filter(Boolean), credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Çok fazla istek. Lütfen biraz bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Çok fazla giriş denemesi. Lütfen bir dakika bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRouter);
app.use("/api/teams", requireAuth, teamsRouter);
app.use("/api/judges", requireAuth, judgesRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ── Serve Frontend Static Files ────────────────────────────────────
// Railway'de backend hem API hem de frontend'i sunacak.
// Frontend build dosyaları: ../frontend/dist
const FRONTEND_DIST = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(FRONTEND_DIST));

// SPA fallback: Bilinmeyen route'ları index.html'e yönlendir
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

// ── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info("server", `🚀 Server http://localhost:${PORT}`);
  logger.info("server", `📁 Frontend: ${FRONTEND_DIST}`);
  logger.info("server", `💾 Data: ${process.env.DATA_DIR || path.join(process.cwd(), "data")}`);
});
