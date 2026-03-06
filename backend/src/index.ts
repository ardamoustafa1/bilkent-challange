import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth.js";
import { teamsRouter } from "./routes/teams.js";
import { judgesRouter } from "./routes/judges.js";
import { requireAuth } from "./middleware/auth.js";

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

app.listen(PORT, () => {
  console.log(`Backend API http://localhost:${PORT}`);
});
