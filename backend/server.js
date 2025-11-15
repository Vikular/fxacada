const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
console.log("DEBUG SUPABASE_URL:", process.env.SUPABASE_URL);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const userAdminRoute = require("./routes/user-admin.js").default;
const uploadRoute = require("./routes/upload.js").default;
const authRoutes = require("./routes/auth.js").default;
const registerRoute = require("./routes/register.js").default;
const userRoutes = require("./routes/users.js").default;
const paymentRoutes = require("./routes/payments.js").default;
const ftmoRoutes = require("./routes/ftmo.js").default;
const adminRoutes = require("./routes/admin.js").default;

// Health check endpoint
app.get("/auth/health", (req, res) => {
  res.json({ status: "ok" });
});

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
