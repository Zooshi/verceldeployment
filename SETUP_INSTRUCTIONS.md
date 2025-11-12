# Kanban Todo App - Setup Instructions

## Overview
This Next.js app has been transformed into a modern Kanban-style task management system with:
- Dark theme with NVIDIA-style neon green accents
- Drag-and-drop functionality for moving todos between columns (To Do, In Progress, Review, Done)
- Priority status indicators (green/yellow/red)
- Due dates, tags, and additional notes for each todo
- User-specific todos with Supabase authentication
- Mobile-responsive design

## Prerequisites
- A Supabase account and project
- The environment variables already configured in your `.env` file

## Setup Steps

### 1. Run the Database Migration

You need to create the `todos` table in your Supabase database. There are two ways to do this:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Open the migration file: `supabase/migrations/20250112_create_todos_table.sql`
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

#### Option B: Using Supabase CLI
If you have the Supabase CLI installed:
```bash
cd with-supabase-app
supabase db push
```

### 2. Verify the Migration

After running the migration, verify that:
1. The `todos` table was created with all columns
2. Row Level Security (RLS) policies are enabled
3. The indexes were created successfully

You can check this in the Supabase Dashboard under **Table Editor** → **todos**

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Test the Application

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Sign in with your Supabase credentials
3. You'll be redirected to `/protected` which now shows the Kanban board
4. Click the **+** button on any column to add a new todo
5. Click on a todo card to edit its details
6. Drag and drop todos between columns

## Features

### Todo Card Properties
- **Title**: The main text of the todo (required)
- **Description**: Brief description of the task
- **Priority Status**: Green (Low), Yellow (Medium), Red (High)
- **Due Date**: Optional deadline for the task
- **Tags**: Multiple tags for categorization
- **Additional Info**: Extra notes or details

### Kanban Columns
1. **To Do**: Tasks that need to be started
2. **In Progress**: Tasks currently being worked on
3. **Review**: Tasks awaiting review
4. **Done**: Completed tasks

### Mobile Support
- On mobile devices, columns stack vertically
- Touch-friendly drag-and-drop
- Responsive design for all screen sizes

## Troubleshooting

### Migration Fails
- Ensure you have the correct Supabase project selected
- Check that your database URL and credentials are correct
- Verify you have the necessary permissions in Supabase

### Todos Not Appearing
- Check the browser console for errors
- Verify that the migration ran successfully
- Ensure you're logged in with a valid Supabase user

### Drag-and-Drop Not Working
- This feature requires JavaScript to be enabled
- On mobile, use touch gestures to drag
- Ensure you're not in a read-only mode

## Database Schema

The `todos` table structure:
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- title (TEXT, Required)
- description (TEXT)
- additional_info (TEXT)
- status (VARCHAR: 'green' | 'yellow' | 'red')
- column_id (VARCHAR: 'todo' | 'in-progress' | 'review' | 'done')
- position (INTEGER)
- due_date (TIMESTAMP)
- tags (TEXT[])
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Security

- Row Level Security (RLS) is enabled on the `todos` table
- Users can only view, create, update, and delete their own todos
- All operations require authentication

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom NVIDIA-themed colors
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Drag & Drop**: @dnd-kit/core
- **UI Components**: Radix UI primitives

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase project is active and properly configured
3. Ensure all environment variables are set correctly
4. Check the Supabase logs in the dashboard for any database errors
