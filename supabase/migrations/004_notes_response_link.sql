ALTER TABLE notes ADD COLUMN response_id UUID REFERENCES responses(id) ON DELETE SET NULL;
CREATE INDEX notes_response_idx ON notes (response_id) WHERE response_id IS NOT NULL;
