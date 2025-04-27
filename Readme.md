# Forte Card Previewer

An interactive web-based card gallery viewer with advanced features, designed to showcase images organized in folders with real-time likes system.

## Key Features

- **Folder-Based Navigation:** Browse images through tabs for different sets/folders
- **Advanced Filtering:** Filter cards by type, trainer type, creator, and Forte status
- **Interactive Hover Effects:** Holographic card effect with 1-second timeout
- **Real-time Likes System:** Like counts update for all users viewing the same content
- **Responsive Design:** Works on mobile, tablet, and desktop devices
- **Optimized Performance:** Lazy loading and preloading for smooth experience
- **Animated Background:** Three.js particle animations for visual appeal

## New Updates

- **Hover Effect Timeout:** The glitter/holo effect on cards now fades away after 1 second of hover inactivity
- **Real-time Likes System:** Like counts synchronize across all viewers
- **Optimized Build Process:** Tailwind CSS integration for faster development
- **Improved Project Structure:** Better organized files for maintainability
- **Toast Notifications:** User-friendly messages for like limits

## Project Structure

```
project-root/
├── index.html                 # Main HTML file
├── image_data.js              # Generated image structure and config (automatic)
├── src/
│   ├── js/
│   │   ├── main.js            # Main application logic
│   │   ├── realtime-likes.js  # Real-time likes system
│   │   ├── background.js      # Three.js background animation
│   │   └── audio.js           # Audio player functionality
│   └── css/
│       ├── input.css          # Tailwind input CSS
│       └── toast.css          # Toast notification styles
├── assets/
│   └── css/
│       └── theme.css          # Custom theme styles
├── dist/
│   └── output.css             # Generated Tailwind CSS (automatic)
├── resources/                 # Static assets (icons, logos)
├── img/                       # Image storage directory
├── filter_config.json         # Filter configuration
├── generate_image_structure.js # Script to scan images
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Project dependencies
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Generate Image Data:**
   Place your images in the `img` folder, then run:
   ```bash
   npm run build:images
   ```

3. **Build CSS:**
   ```bash
   npm run build:css
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## Likes System

The likes system now updates in real-time across all clients. When a user likes a card:

1. The like count updates immediately in the UI
2. A request is sent to the server to update the database
3. Other users viewing the app receive the updated count
4. If the server is unavailable, likes are stored locally as a fallback

Each user can give up to 10 likes per day.

## Customization

- **Theme:** Modify `assets/css/theme.css` and `tailwind.config.js`
- **Filters:** Edit `filter_config.json` to change available filters
- **Background:** Adjust settings in `src/js/background.js`
- **Like Limits:** Change `MAX_USER_LIKES_PER_DAY` in `src/js/realtime-likes.js`

## API Endpoints

The likes system uses the following API endpoints:

- `POST /api/likes/getAll` - Get all likes and user's liked cards
- `POST /api/likes/update` - Update a like (add or remove)

## Deployment

The project can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the resulting files to your server
3. For Cloudflare Pages, use the included GitHub workflow

## Troubleshooting

- **Images not showing:** Run `npm run build:images` to regenerate image data
- **CSS not updating:** Run `npm run build:css` to rebuild CSS
- **Likes not syncing:** Check that the API endpoints are properly configured

## Credits

- Font Awesome for icons
- Three.js for background animations
- Contributors to the project