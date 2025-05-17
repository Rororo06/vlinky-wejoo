
# Deploying to Netlify

This guide will walk you through the process of deploying the Poppi application to Netlify.

## Prerequisites

- A [Netlify](https://www.netlify.com/) account
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click the "Add new site" button and select "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 2: Deploy with Netlify CLI

1. Install Netlify CLI if you haven't already:
   ```
   npm install netlify-cli -g
   ```
2. Login to Netlify:
   ```
   netlify login
   ```
3. Initialize Netlify in your project:
   ```
   netlify init
   ```
4. Follow the prompts to connect to your Netlify account and configure your deployment settings

## Environment Variables

Make sure to set up the following environment variables in your Netlify site settings:

1. Go to Site settings > Build & deploy > Environment
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public key

## Continuous Deployment

Netlify automatically sets up continuous deployment from your connected Git repository. Every push to your main branch will trigger a new deployment.

## Custom Domain

To use a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in Netlify
2. Ensure all environment variables are correctly set
3. Verify that the `netlify.toml` file is in the root of your project
