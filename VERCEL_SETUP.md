# Vercel Deployment Setup Guide

## Required Environment Variables

You need to add these environment variables in your Vercel project settings:

### 1. Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_pooling_url
DIRECT_URL=your_direct_database_url
```

### 2. Stripe (Required)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Email - Resend (Optional but recommended)
```
RESEND_API_KEY=your_resend_api_key
```

### 4. Rate Limiting - Upstash Redis (Optional)
```
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 5. Application URL
```
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select Production, Preview, and Development
5. Click **Save**
6. Redeploy your application

## Common Issues

### Internal Server Error 500
This usually means missing environment variables. Check that ALL required variables are set in Vercel.

### Database Connection Errors
- Make sure `DATABASE_URL` and `DIRECT_URL` are correctly set
- Verify your Supabase database is accessible
- Check that your database password doesn't contain special characters that need URL encoding

### Stripe Webhook Errors
- The `STRIPE_WEBHOOK_SECRET` is different for Vercel than local development
- Get the production webhook secret from Stripe Dashboard → Developers → Webhooks

## Redeploying After Adding Variables

After adding all environment variables:
```bash
git commit -am "Add environment variables"
git push origin main
```

Or trigger a redeploy from Vercel dashboard → Deployments → Redeploy
