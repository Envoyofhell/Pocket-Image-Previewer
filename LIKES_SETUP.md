# Forte Card Likes System Setup

This guide will help you set up the card likes system with Cloudflare D1 database integration for both your main Forte branch and Forte-Master preview branch.

## Prerequisites

- Cloudflare account with Pages and D1 access
- Wrangler CLI installed (`npm install -g wrangler`)
- Your project connected to Cloudflare Pages

## Step 1: Create D1 Databases

### For Production (Forte branch):
```bash
wrangler d1 create forte-card-likes
```

### For Preview (Forte-Master branch):
```bash
wrangler d1 create forte-card-likes-preview
```

Save the database IDs that are returned from these commands.

## Step 2: Update wrangler.toml

Replace the placeholder database IDs in `wrangler.toml` with the actual IDs from Step 1:

```toml
[[d1_databases]]
binding = "CARD_LIKES_DB"
database_name = "forte-card-likes"
database_id = "your-actual-database-id-here"

[env.preview]
[[env.preview.d1_databases]]
binding = "CARD_LIKES_DB"
database_name = "forte-card-likes-preview"
database_id = "your-actual-preview-database-id-here"
```

## Step 3: Initialize Database Tables

### For Production:
```bash
wrangler d1 execute forte-card-likes --file=setup-database.sql
```

### For Preview:
```bash
wrangler d1 execute forte-card-likes-preview --file=setup-database.sql
```

## Step 4: Configure Cloudflare Pages

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to Settings > Functions
4. Add the D1 database binding:
   - Variable name: `CARD_LIKES_DB`
   - D1 database: Select your created database

For preview deployments, make sure to configure the preview environment with the preview database.

## Step 5: Deploy

Push your changes to trigger a deployment. The likes system should now be active with:

- ❤️ Like buttons on gallery cards
- ❤️ Like buttons in the lightbox
- 🔒 User session-based like tracking
- 📊 Like count persistence across sessions
- 🚫 Daily like limits (10 likes per user per day)
- 🔄 Automatic fallback to localStorage if database is unavailable

## Features

### User Experience
- Users can like/unlike cards by clicking the heart button
- Like counts are displayed next to the heart icon
- Users are limited to 10 likes per day to prevent spam
- Each user can only like each card once
- Likes persist across browser sessions

### Technical Features
- Session-based user identification using browser fingerprinting
- Cloudflare D1 database for persistent storage
- Automatic fallback to localStorage if database is unavailable
- Real-time UI updates when likes are toggled
- CORS-enabled API endpoints for cross-origin requests

### API Endpoints

The system creates these API endpoints:
- `POST /api/likes/getAll` - Get all like data for initialization
- `POST /api/likes/update` - Add or remove a like

### Database Schema

```sql
CREATE TABLE card_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    card_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, card_path)
);
```

## Troubleshooting

### Database Connection Issues
- Check that the database binding is correctly configured in Cloudflare Pages
- Verify the database IDs in `wrangler.toml` match your actual databases
- The system will automatically fall back to localStorage if the database is unavailable

### Like Buttons Not Appearing
- Ensure `db-likes.js` is loaded before other scripts in `index.html`
- Check browser console for JavaScript errors
- Verify CSS styles are loading correctly

### Likes Not Persisting
- Check Cloudflare Pages Functions logs for API errors
- Verify D1 database permissions and bindings
- Test the API endpoints directly using browser dev tools

## Testing

You can test the system by:
1. Opening the card gallery
2. Clicking heart buttons on cards
3. Opening cards in lightbox and testing like buttons there
4. Refreshing the page to verify persistence
5. Clearing likes via Settings panel

## Support

If you encounter issues:
1. Check Cloudflare Pages Functions logs
2. Check browser console for errors
3. Verify database setup and bindings
4. Test API endpoints manually 