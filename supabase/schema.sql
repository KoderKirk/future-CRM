-- Run this in the Supabase SQL editor to set up the future-CRM schema.

CREATE TABLE IF NOT EXISTS contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  organization  text DEFAULT '',
  phone         text DEFAULT '',
  email         text DEFAULT '',
  type          text DEFAULT '',
  categories    text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  archived      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'fund',
  description text DEFAULT '',
  status      text NOT NULL DEFAULT 'pipeline',
  archived    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  color       text DEFAULT 'indigo',
  description text DEFAULT '',
  archived    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_columns (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label      text NOT NULL,
  key        text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and allow full access via the anon key (no auth yet).
ALTER TABLE contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON contacts       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON projects       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON categories     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON custom_columns FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS import_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename   text NOT NULL,
  row_count  int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON import_logs FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS project_contacts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, contact_id)
);

ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON project_contacts FOR ALL TO anon USING (true) WITH CHECK (true);
