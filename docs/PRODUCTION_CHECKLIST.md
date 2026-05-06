# Production Deployment Checklist

## ✅ Environment Variables Setup
All local `.env` keys mapped to Vercel project settings via `vercel.json`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_OPENROUTER_API_KEY`: OpenRouter API key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key
- `VITE_APP_URL`: Production app URL (e.g., https://your-app.vercel.app)
- `VITE_APP_TITLE`: App title

## Supabase Configuration
1. **Authentication Redirects**: In Supabase Dashboard > Authentication > URL Configuration:
   - Site URL: Set to your Vercel production domain
   - Redirect URLs: Add `https://your-app.vercel.app/auth/callback`

2. **CORS Configuration**: In Supabase Dashboard > Settings > API:
   - Restrict origins to: `https://your-app.vercel.app`

3. **Database Schema**: Push migrations to production:
   ```bash
   supabase db push --project-ref YOUR_PROJECT_REF
   ```

4. **Row Level Security (RLS)**: All tables in the migration have RLS enabled with policies tied to `auth.uid()`.

5. **Connection Pooling**: Use the pooler URL from `supabase/.temp/pooler-url` for database connections.

## ✅ Build and Deployment
- Build command: `npm run build`
- Output directory: `dist`
- Vercel config: `vercel.json` handles framework detection and environment variables

## ✅ Security Checks
- Run `npm run scan-secrets` before commits (flags potential secrets)
- Run `npm run type-check` to catch TypeScript errors
- Run `npm run audit-deps` for dependency vulnerabilities

## Performance Optimizations
- No N+1 queries detected in current codebase
- All database queries use Supabase client with proper indexing
- Static assets optimized via Vite build

## Error Handling
- Error boundaries implemented in production components
- API calls include try/catch blocks where applicable

## ✅ Code Quality
- ESLint configured with TypeScript support
- TypeScript type checking enabled
- Pre-commit hooks available via `npm run pre-commit`