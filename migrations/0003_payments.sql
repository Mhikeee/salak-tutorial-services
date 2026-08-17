CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('paymongo', 'paypal')),
  provider_payment_id TEXT UNIQUE,
  currency TEXT NOT NULL CHECK (currency IN ('PHP', 'USD')),
  amount INTEGER NOT NULL,
  payment_option TEXT NOT NULL CHECK (payment_option IN ('full', 'deposit')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TEXT NOT NULL,
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS payments_enrollment_id ON payments(enrollment_id, created_at DESC);
