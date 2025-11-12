-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  additional_info TEXT,
  status VARCHAR(10) NOT NULL CHECK (status IN ('green', 'yellow', 'red')),
  column_id VARCHAR(20) NOT NULL CHECK (column_id IN ('todo', 'in-progress', 'review', 'done')),
  position INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);

-- Create index on column_id and position for ordering
CREATE INDEX IF NOT EXISTS todos_column_position_idx ON public.todos(column_id, position);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own todos
CREATE POLICY "Users can view own todos"
  ON public.todos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own todos
CREATE POLICY "Users can insert own todos"
  ON public.todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own todos
CREATE POLICY "Users can update own todos"
  ON public.todos
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own todos
CREATE POLICY "Users can delete own todos"
  ON public.todos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
