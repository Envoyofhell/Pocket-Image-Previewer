# Image Previewer

A web application for browsing and previewing images within folders.

## Features

* **Folder-Based Navigation:** Organizes images into folders, allowing for easy browsing.
* **Image Filtering:** Filters images by type and rarity.
* **Customizable Gallery Size:** Adjust the size of the image thumbnails in the gallery.
* **Lightbox Preview:** Opens images in a lightbox overlay for larger viewing.
* **Lightbox Size Control:** Adjust the size of the image within the lightbox using a slider located directly inside the lightbox.
* **Holo Effect:** Applies a subtle holographic effect to the image thumbnails and the lightbox image.
* **Keyboard Navigation:** Provides keyboard shortcuts for navigating the gallery and lightbox.
* **Audio Prompt:** Asks for user click to enable the sound on the image.

## Technologies Used

* HTML
* CSS
* JavaScript
* [Tailwind CSS](https://tailwindcss.com/)
* [Font Awesome](https://fontawesome.com/)
* [Three.js](https://threejs.org/)
* `image_data.js` (for image metadata)
* `background.js` (for Three.js background)
* `audio.js` (for the image's audio)

## Setup Instructions

1.  **Clone the repository:** `git clone <repository_url>`
2.  **Navigate to the project directory:** `cd <project_directory>`
3.  Ensure all the required files are in their respective directories like `index.html`, `image_data.js`, `background.js`, `audio.js` and the `assets/css` directory.
4.  Open `index.html` in your web browser.

## Important Notes

* The application relies on `image_data.js` to provide metadata about the images. Ensure this file is correctly formatted and contains the necessary information.
* The holographic effect is applied using CSS and may require a modern browser for optimal rendering.
* **Recent Changes:** The "Popup Size" slider has been moved from the header controls into the lightbox overlay itself. This allows for scaling the image up and down directly within the lightbox view.

## pnpm Workspace Notes (from 2025-03-12)

When using a pnpm workspace, you only need a single `pnpm-lock.yaml` file in the root of the project. Lock files are not needed in the `client` and `server` folders.

# Forte Card Viewer

A modern, responsive web application for viewing and browsing Pokémon cards with advanced filtering, search, and lightbox functionality.

## Features

- **Card Gallery**: Browse cards with customizable grid sizes and filtering options
- **Advanced Search**: Search by card name, set, artist, and more
- **Lightbox Viewer**: Detailed card view with navigation and sharing
- **Like System**: Like and track your favorite cards
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **SEO Optimized**: SEO-friendly URLs and dynamic sitemaps

## SEO-Friendly URLs

The application now uses SEO-friendly URLs for individual cards in a natural, hierarchical format. URLs are generated based on:

- Set identifier (e.g., "pf1", "misc")
- Card name (lowercase, hyphenated)
- Card number (for uniqueness)

### URL Examples

- `/pf1/bulbasaur-1` - Bulbasaur from PF1 set, number 1
- `/pf1/ivysaur-2` - Ivysaur from PF1 set, number 2
- `/misc/charizard-6` - Charizard from misc set, number 6
- `/pf1/blaziken-forte-15` - Blaziken Forte from PF1 set, number 15

### Benefits

- **Natural URL structure**: `/set/name-number` format is intuitive
- **Better SEO**: Search engines prefer hierarchical URLs
- **User-friendly**: Easy to understand and remember
- **Set organization**: URLs naturally group cards by set
- **Improved rankings**: Better search engine indexing and ranking

## Sitemap Generation

The application includes automatic sitemap generation for better search engine indexing:

### Generate Sitemaps

```bash
# Generate sitemaps only
npm run build:sitemap

# Generate both image data and sitemaps
npm run build:all
```

### Generated Files

- `public/sitemap.xml` - Main sitemap with all card URLs
- `public/sitemap-index.xml` - Index file (if multiple sitemaps)
- `public/sitemap.json` - JSON sitemap for modern search engines
- `public/robots.txt` - Robots file with sitemap references

### Configuration

Update the `SITE_URL` in `generate_sitemap.js` to match your domain:

```javascript
const SITE_URL = 'https://your-domain.com';
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Build Commands

```bash
# Generate image structure data
npm run build:images

# Generate sitemaps
npm run build:sitemap

# Generate both
npm run build:all
```

### File Structure

```
├── js/
│   ├── app.js              # Main application logic
│   ├── url-utils.js        # SEO URL utilities
│   ├── lightbox.js         # Card viewer functionality
│   ├── gallery.js          # Gallery display logic
│   └── ...
├── data/
│   └── cards.json          # Card data (auto-generated)
├── public/                 # Generated sitemaps
├── generate_image_structure.js  # Image data generator
├── generate_sitemap.js     # Sitemap generator
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.