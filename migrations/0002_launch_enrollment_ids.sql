ALTER TABLE submissions ADD COLUMN enrollment_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS submissions_enrollment_id ON submissions(enrollment_id) WHERE enrollment_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS enrollment_sequences (
  date_key TEXT PRIMARY KEY,
  last_value INTEGER NOT NULL
);
