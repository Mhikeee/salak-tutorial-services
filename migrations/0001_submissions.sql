CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('inquiries', 'bookings', 'enrollments', 'payment-references')),
  email TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  handled_at TEXT
);

CREATE INDEX IF NOT EXISTS submissions_kind_created_at ON submissions(kind, created_at DESC);
