import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// Debug: Log env variables to verify loading
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "[set]" : "[not set]"
);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

import userAdminRoute from "./routes/user-admin.js";
import uploadRoute from "./routes/upload.js";
import authRoutes from "./routes/auth.js";
import registerRoute from "./routes/register.js";
import userRoutes from "./routes/users.js";
import paymentRoutes from "./routes/payments.js";
import ftmoRoutes from "./routes/ftmo.js";
import adminRoutes from "./routes/admin.js";

app.use("/user-admin", userAdminRoute);
app.use("/upload", uploadRoute);
app.get("/", (req, res) => res.json({ ok: true, message: "FX Academy API" }));
app.use("/auth", authRoutes);
app.use("/auth/register", registerRoute);
app.use("/users", userRoutes);
app.use("/payments", paymentRoutes);
app.use("/ftmo", ftmoRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FX Academy API running on http://localhost:${PORT}`);
});
