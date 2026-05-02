# 🚀 Deployment Guide

This guide covers how to deploy PlanetCare Teacher Dashboard to production environments.

---

## 📋 Deployment Options

| Platform | Cost | Ease | Scalability | Recommended For |
|----------|------|------|-------------|-----------------|
| Firebase Hosting | Free/Pay-as-you-go | ⭐⭐⭐⭐⭐ | Excellent | MVP, rapid scaling |
| Vercel | Free (hobby) | ⭐⭐⭐⭐⭐ | Excellent | Fast, serverless |
| Netlify | Free (hobby) | ⭐⭐⭐⭐ | Good | Simple, Git-based |
| Self-hosted | Variable | ⭐⭐ | Manual | Full control, complex |

---

## 🔥 Firebase Hosting (Recommended for MVP)

Firebase Hosting is the quickest path to production.

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created (same as your app)

### Steps

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Initialize Firebase Project Locally
```bash
# Navigate to project directory
cd d:\planetcare

# Login to Firebase
firebase login

# Initialize Firebase
firebase init
```

Choose options:
- **Hosting**: Yes
- **Public directory**: `.` (current directory)
- **Single-page app**: No (we serve a single HTML file)

#### 3. Configure `firebase.json`

Replace contents with:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "redirects": [
      {
        "source": "/",
        "destination": "/planetcare_teacher_panel.html",
        "type": 301
      }
    ],
    "headers": [
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.{js,json}",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

#### 4. Deploy
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# View live site
firebase open hosting:site
```

Your app is now live at: `https://<your-firebase-project>.web.app`

#### 5. Custom Domain (Optional)
```bash
# Add custom domain through Firebase Console
# Go to Firebase Console > Hosting > Connect Domain
# Follow DNS setup instructions
```

---

## ✨ Vercel Deployment

Vercel offers free hosting with Git integration.

### Step 1: Push to GitHub

```bash
cd d:\planetcare

# Initialize Git
git init
git add .
git commit -m "Initial commit: PlanetCare MVP"

# Push to GitHub
git remote add origin https://github.com/yourusername/planetcare.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Select your `planetcare` repository
5. Configure:
   - **Framework**: Other (single-page app)
   - **Root Directory**: `.`
   - **Build Command**: (leave empty)
   - **Install Command**: (skip)
6. Click "Deploy"

### Step 3: Deploy
- Vercel automatically deploys on every push to `main` branch
- View at: `https://planetcare.vercel.app` (or custom domain)

### Add Custom Domain
1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your domain (e.g., `planetcare.edu.ph`)
3. Follow DNS configuration

---

## 🎨 Netlify Deployment

Netlify also offers free hosting with Git integration.

### Step 1: Push Code to Git

(Same as Vercel, see above)

### Step 2: Connect to Netlify

1. Visit [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select GitHub
4. Choose `planetcare` repository
5. Configure:
   - **Owner**: Your team
   - **Branch to deploy**: main
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
6. Click "Deploy"

### Step 3: Configure `netlify.toml`

Create file: `netlify.toml`

```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/"
  to = "/planetcare_teacher_panel.html"
  status = 200

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/*.{js,json}"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### Step 4: Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from command line
netlify deploy --prod
```

---

## 🐳 Docker + Self-Hosted

For full control, use Docker to containerize your app.

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

# Serve static files
RUN npm install -g serve

WORKDIR /app

# Copy files
COPY . .

# Expose port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", ".", "-l", "3000"]
```

### Step 2: Create `.dockerignore`

```
node_modules
.git
.env
.firebase
firebase-debug.log
```

### Step 3: Build & Run

```bash
# Build Docker image
docker build -t planetcare:latest .

# Run container
docker run -p 3000:3000 planetcare:latest

# Visit http://localhost:3000
```

### Step 4: Deploy to Cloud Platform

#### AWS EC2
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag planetcare:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/planetcare:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/planetcare:latest

# Deploy via EC2 or ECS
```

#### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/planetcare

# Deploy
gcloud run deploy planetcare --image gcr.io/YOUR_PROJECT_ID/planetcare
```

#### Digital Ocean
```bash
# Push to Docker Hub
docker login
docker tag planetcare yourusername/planetcare:latest
docker push yourusername/planetcare:latest

# Deploy via Docker App or App Platform
```

---

## 🔒 Security & Performance

### Enable HTTPS
- **Firebase Hosting**: Automatic (*.web.app)
- **Vercel**: Automatic (*.vercel.app)
- **Netlify**: Automatic
- **Custom Domain**: Use Let's Encrypt (free SSL)

### Enable Caching

#### Firebase Headers
```json
{
  "headers": [
    {
      "source": "**/*.{js,css,png,jpg,jpeg,svg}",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=604800, immutable" }
      ]
    }
  ]
}
```

#### CDN Configuration
- Cloudflare (free tier): DNS + cache
- AWS CloudFront: Global content distribution
- Bunny CDN: Budget-friendly option

### Content Security Policy

Add to HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https:; 
               script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com/vue@3; 
               style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
               img-src 'self' data: https:;
               connect-src 'self' https://*.firebaseio.com https://*.firebaseapp.com https://www.googleapis.com;">
```

---

## 📊 Environment Variables

For sensitive data, use environment files:

### `.env.local` (local development)
```
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=planetcare-dev
FIREBASE_MESSAGING_SENDER_ID=xxx
```

### `.env.production` (production)
```
FIREBASE_API_KEY=<production-key>
FIREBASE_PROJECT_ID=planetcare-prod
FIREBASE_MESSAGING_SENDER_ID=<production-id>
```

**Note**: For browser-based Firebase apps, keys are usually public. Use Firestore security rules to protect data.

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Deploy to Firebase
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Get Firebase Token

```bash
firebase login:ci
# Copy token to GitHub Secrets > FIREBASE_TOKEN
```

---

## 📈 Monitoring & Analytics

### Firebase Console Monitoring

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select Your Project
3. Monitor:
   - **Firestore**: Reads, writes, deletes, quota usage
   - **Realtime Database**: Bandwidth, storage, connections
   - **Authentication**: Active users, sign-ups
   - **Hosting**: Traffic, bandwidth, requests

### Google Analytics (Optional)

Add tracking to HTML:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Use Sentry for production error monitoring:

```html
<script src="https://browser.sentry-cdn.com/7.<!-- version -->/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: "your-sentry-dsn" });
</script>
```

---

## 🚨 Backup & Recovery

### Firebase Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/backup-$(date +%s)

# Restore from backup
gcloud firestore import gs://your-backup-bucket/backup-timestamp
```

### Version Control Backup

```bash
# Tag releases
git tag -a v1.0 -m "Production release 1.0"
git push origin v1.0

# Rollback to previous version
git checkout v0.9
git push --force origin v0.9:main
```

---

## 🎯 Performance Optimization

### Image Optimization
- Use webp format (smaller files)
- Serve images via CDN
- Lazy load images

### JavaScript Bundling
```bash
npm install -g parcel-bundler
parcel build planetcare_teacher_panel.html
```

### Code Minification
- HTML: Use HTML minifier
- CSS: Tailwind already optimizes
- JS: Use esbuild or webpack

### Database Optimization
```javascript
// Index frequently queried fields
// Add to Firebase Console > Firestore > Indexes
```

---

## ⚠️ Pre-Deployment Checklist

- [ ] Firebase config is correct for production
- [ ] Security rules are properly configured
- [ ] All sensitive keys removed from code
- [ ] HTTPS is enabled
- [ ] Cache headers are set correctly
- [ ] CSP headers are configured
- [ ] Error handling is in place
- [ ] Logging is enabled for debugging
- [ ] Database backups are automated
- [ ] Monitoring is set up
- [ ] Custom domain is configured
- [ ] SSL certificate is valid
- [ ] Firestore quotas reviewed
- [ ] RTDB quotas reviewed
- [ ] CI/CD pipeline is working

---

## 🆘 Troubleshooting Deployments

### Firebase Deployment Failed
```bash
# Clear cache and retry
rm -rf .firebase
firebase deploy --force
```

### CORS Issues
Add headers to `firebase.json`:
```json
{
  "headers": [
    {
      "source": "**",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### High Firestore Costs
- Review security rules (prevent over-reading)
- Implement pagination
- Use error handling (avoid repeated failed reads)
- Consider RTDB for frequently updated data

---

## 📞 Support & Resources

- [Firebase Deployment Docs](https://firebase.google.com/docs/hosting/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)

---

**Last Updated**: April 2026  
**Version**: 1.0
