# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Postcraft (Chapiko Inc.) is a SaaS platform for training "Citizen Data Scientists" - featuring LMS, AI content generation, and community features. Built with Next.js 13 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Common Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Clean .next folder and build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 13.5.8 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI components (in `components/ui/`)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini API for SNS post generation
- **Animation**: Framer Motion

### Key Directories
- `app/` - Next.js App Router pages
- `app/admin/` - Admin dashboard (requires Pro plan or admin_users entry)
- `pages/api/` - API routes (legacy pattern, uses JWT auth)
- `components/ui/` - Shadcn/UI components (48+ components)
- `lib/` - Core utilities, contexts, and type definitions
- `supabase/migrations/` - Database schema migrations

### Authentication & Authorization

Auth is handled via Supabase with a custom `AuthProvider` context (`lib/auth-context.tsx`).

```typescript
// Usage in components
const { user, profile, plan, canAccess, isPro, isEnterprise } = useAuth()

// Check feature access
if (canAccess('canCreateCourses')) { ... }
```

Three-tier plan system defined in `lib/plans.ts`:
- **free**: Limited access, 10 AI generations/month
- **pro**: Full content access, LMS features, 100 AI generations/month
- **enterprise**: Unlimited everything

### API Routes

API routes require JWT authentication:
```typescript
const authHeader = req.headers.authorization
const token = authHeader.replace('Bearer ', '')
const { data: { user } } = await supabase.auth.getUser(token)
```

### Database Types

- `lib/supabase.ts` - Supabase client, `Profile` and `Content` types
- `lib/lms-types.ts` - LMS types: `Course`, `Lesson`, `Quiz`, `Organization`, etc.

### Key Features
- **LMS**: Courses, Lessons, Quizzes with progress tracking
- **Organizations**: Multi-tenant support with roles (owner, admin, instructor, member)
- **AI Generation**: SNS post generation via `/api/generate` (Gemini API)
- **Blog**: Markdown-based blog system with categories

## Environment Variables

Required in production (Hostinger):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_GEMINI_API_KEY (or GEMINI_API_KEY)
```

## Deployment

- Hosted on Hostinger Cloud with GitHub auto-deploy
- CDN caching: Use "Development Mode" ON during development to avoid cache issues
- After code changes, may need to clear CDN cache in Hostinger dashboard

## Supabase Configuration

When changing domains, update in Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: Production domain
- **Redirect URLs**: Add all domains with `/**` wildcard
