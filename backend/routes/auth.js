import express from "express";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const JWT_SECRET = process.env.JWT_SECRET || "fxacada-secret";

// Update password hash in users table after Supabase password reset
router.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res
      .status(400)
      .json({ success: false, error: "Email and new password required" });
  try {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from("users")
      .update({ password_hash })
      .eq("email", email);
    if (error) {
      console.error("[update-password] DB error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("[update-password] Exception:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Student & admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.warn("[login] Missing email or password");
    return res
      .status(400)
      .json({ success: false, error: "Email and password required" });
  }
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error || !user) {
    console.warn(
      "[login] Invalid credentials for email:",
      email,
      "DB error:",
      error
    );
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }
  // Use bcrypt to compare password
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    console.warn("[login] Password mismatch for email:", email);
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  console.log("[login] Successful login for email:", email);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      tier: user.tier,
    },
  });
});

// Health check
router.get("/health", (req, res) => res.json({ ok: true }));

export default router;
