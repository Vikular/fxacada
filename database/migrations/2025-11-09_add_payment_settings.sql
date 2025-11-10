-- ============================================
-- MIGRATION: Add payment_settings table with placeholders
-- Run this after the main schema. Safe to run multiple times.
-- ============================================

CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL,              -- bank | paypal | crypto
  chain TEXT,                        -- e.g., BTC | ETH | USDT-ERC20 | USDT-TRC20 (for crypto)
  label TEXT,                        -- Display label for UI
  address TEXT NOT NULL,             -- Wallet address or account detail
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_settings_method ON payment_settings(method);
CREATE INDEX IF NOT EXISTS idx_payment_settings_chain ON payment_settings(chain);

-- Upsert placeholders (safe to re-run)
INSERT INTO payment_settings (method, chain, label, address, is_active)
VALUES 
  ('bank', NULL, 'Bank Transfer Details', 'TO_BE_SET - Bank Name\nAccount Name: TO_BE_SET\nAccount Number: TO_BE_SET\nSWIFT/BIC: TO_BE_SET', true),
  ('paypal', NULL, 'PayPal Email', 'TO_BE_SET@example.com', true),
  ('crypto', 'BTC', 'Bitcoin (BTC)', 'TO_BE_SET_BTC_ADDRESS', false),
  ('crypto', 'ETH', 'Ethereum (ETH)', 'TO_BE_SET_ETH_ADDRESS', false),
  ('crypto', 'USDT-ERC20', 'USDT (ERC20)', 'TO_BE_SET_USDT_ERC20', false),
  ('crypto', 'USDT-TRC20', 'USDT (TRC20)', 'TO_BE_SET_USDT_TRC20', false)
ON CONFLICT DO NOTHING;
