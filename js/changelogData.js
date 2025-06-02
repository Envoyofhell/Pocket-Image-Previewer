// js/changelogData.js

console.log('[ChangelogData] Script execution started.');

/**
 * Changelog data for the Forte Card Previewer.
 */
const changelogData = [
  {
    version: "2.6",
    date: "2025-01-16",
    title: "Type System Overhaul & Database Integration",
    isOpen: true,
    changes: [
      {
        title: "Type System & Visual Enhancements",
        items: [
          "**Type Icon System:**",
          "ADDED: Comprehensive type mapping system with support for single-letter abbreviations (G, R, W, L, P, F, D, M, N, Y, C).",
          "ADDED: Type icons for weakness, resistance, retreat costs, and attack energy costs with automatic parsing.",
          "ADDED: Support for various text formats: 'Fire x2', 'R x2', 'C,C', 'Water x1. Neutral x1', 'fighting 2', 'Fairy ×2'.",
          "ADDED: Dedicated `js/type-mapping.js` module with comprehensive type mappings and parsing functions.",
          "IMPROVED: Enhanced type display with icons alongside text in colored badges throughout the application.",
          "**Dynamic Type-Based Styling:**",
          "ADDED: Type-based gradient colors for attack and ability boxes matching Pokemon's primary type.",
          "ADDED: Type-based coloring for Pokemon names in both lightbox details and header banner.",
          "IMPROVED: Enhanced type color palette with brighter, more vibrant colors for better visibility (especially Water, Dark, Metal types).",
        ],
      },
      {
        title: "Attack & Ability System Redesign",
        items: [
          "**Visual Overhaul:**",
          "REDESIGNED: Complete attack and ability display with modern card-like boxes, gradients, and improved typography.",
          "ADDED: Energy cost icons directly next to attack names with proper parsing and display.",
          "IMPROVED: Better organization with separate attack/ability boxes, enhanced spacing, and responsive design.",
          "ADDED: Custom scrollbars for attack/ability containers in lightbox.",
          "**Forte Integration:**",
          "ADDED: Forte icon detection for attacks/abilities containing 'you cannot use more than 1 forte attack in a game' text.",
          "ADDED: Ability icon replacement with Forte icon for Forte abilities, attack Forte icons positioned on the right.",
          "ADDED: Separate Forte.png (colored) and ForteBw.png (black & white) icons for different contexts.",
          "IMPROVED: Forte stage indicator with table-like layout showing stage text in purple with larger Forte icon.",
          "**Data Handling:**",
          "FIXED: Attack and ability damage display - no longer shows 'NA' or 'N/A', displays nothing when damage is missing.",
          "IMPROVED: Cleaner ability type display with icon support and proper positioning.",
        ],
      },
      {
        title: "Database & Like System Integration",
        items: [
          "**Like Functionality:**",
          "ADDED: Complete like system with persistent storage using localStorage.",
          "ADDED: Like buttons on gallery thumbnails and lightbox with real-time count updates.",
          "ADDED: 'Most Liked' sorting option with proper like count integration.",
          "IMPROVED: Like button styling with heart icons, hover effects, and count badges.",
          "FIXED: Like state synchronization between gallery and lightbox views.",
          "**Data Management:**",
          "IMPROVED: Enhanced card data structure with better forte status detection and metadata handling.",
          "ADDED: Debug logging for forte filter functionality to improve card categorization.",
        ],
      },
      {
        title: "Lightbox & UI Enhancements",
        items: [
          "**Lightbox Improvements:**",
          "IMPROVED: Enhanced card detail display with better type integration and visual hierarchy.",
          "ADDED: 'Forte' text indicator in lightbox header for forte cards (e.g., 'Hoopa Forte').",
          "IMPROVED: Copy/share functionality now copies page URL with card ID instead of image file path.",
          "FIXED: Image loading and display improvements with better error handling.",
          "**User Interface:**",
          "IMPROVED: Better button styling and positioning throughout the application.",
          "ENHANCED: CSS organization with comprehensive type-based styling system.",
          "FIXED: Various visual issues with transparency, outlines, and hover effects on icons.",
          "IMPROVED: Responsive design adjustments for better mobile experience.",
        ],
      },
      {
        title: "Technical Infrastructure",
        items: [
          "**Documentation:**",
          "ADDED: `TYPE_REFERENCE_KEY.md` comprehensive documentation for the type mapping system.",
          "IMPROVED: Code organization with better module separation and cleaner architecture.",
          "**Performance:**",
          "OPTIMIZED: Icon loading and display with proper caching and error handling.",
          "IMPROVED: Scroll behavior and container management for large card collections.",
          "**Compatibility:**",
          "ENHANCED: Cross-browser compatibility for type icons and CSS features.",
          "IMPROVED: Mobile responsiveness for new UI components and type displays.",
        ],
      },
    ],
  },
  {
    version: "2.5.1",
    date: "2025-05-23", // Placeholder: Update with actual release date
    title: "UI Overhaul & Dynamic Content Integration",
    isOpen: true,
    changes: [
      {
        title: "Key Features & Enhancements",
        items: [
          "**Modular UI Components:**",
          "ADDED: Header content is now dynamically generated by `layouts/header.js`.",
          "ADDED: Footer content is now dynamically generated by `layouts/footer.js`.",
          "IMPROVED: Centralized UI controls (sidebar toggle, popups, settings) in `js/ui-controls.js`.",
          "**Version & Changelog System:**",
          "ADDED: Dynamic version display in header using this `js/changelogData.js` file.",
          "ADDED: Clickable version badge in header to open a detailed changelog modal.",
          "IMPROVED: Changelog modal with accordion view for different versions and styled keywords for changes.",
          "**Header & Button Enhancements:**",
          "FIXED: 'Info' button correctly positioned to the left of the 'Join Discord' button in the header.",
          "IMPROVED: Styling for header buttons and actions for better consistency with the application theme.",
          "ADDED: 'Settings' button and modal for user-configurable options (e.g., effects toggle).",
          "**General UI/UX:**",
          "IMPROVED: Footer styling for a cleaner, more concise look and better layout.",
          "IMPROVED: Sidebar toggle functionality with state persistence via localStorage.",
          "REMOVED: Hardcoded version number from HTML document title.",
          "IMPROVED: Refined credits popup with detailed acknowledgments for all contributors."
        ],
      },
      {
        title: "Previous Major Updates (Example from v2.0.0)",
        items: [
          "**Revamped Card Search Panel (`EnhancedCardSearchPanel.js`):**",
          "ADDED: Default Load: Displays cards from the latest Pokémon TCG set on initial load for faster startup.",
          "CHANGED: Manual Search Trigger: Card searches are now initiated only by pressing the \"Search\" button.",
          "IMPROVED: Filter Panel Behavior: Search filter accordion now automatically minimizes when a search is executed.",
          "IMPROVED: Card Preview: Clicking a card image in search results now opens an enhanced preview modal (`CardPreviewModal.js`).",
          "ADDED: Custom Set Tabs: Integrated `CustomSetTabs.js` for managing and navigating user-created custom card sets.",
        ],
      },
      {
        title: "Bug Fixes & Stability",
        items: [
          "FIXED: Various minor layout and alignment issues across the application.",
          "IMPROVED: Robustness of modal open/close logic, especially for ESC key handling.",
          "FIXED: Addressed issues with button placement and dynamic content injection.",
        ],
      },
    ],
  },
  {
    version: "2.0.0",
    date: "2025-03-01", 
    title: "Forte Project Fork & Custom Card System",
    isOpen: false, 
    changes: [
      {
        title: "Project Direction & Core Changes",
        items: [
          "NEW: Project forked from 'Pocket-Image-Previewer' to become 'Forte Card Previewer'.",
          "NEW: Shifted focus to support custom 'Forte' card mechanics, Wuthering Waves elements, and a community-driven metagame.",
          "ADDED: Concept of 'Forte Generals' and a collaborative design process for the metagame.",
        ],
      },
      {
        title: "Custom Card & Data Management",
        items: [
          "ADDED: Initial backend integration concepts for card submissions and approvals (e.g., via Google Apps Script and Sheets).",
          "ADDED: `generate_image_structure.js` script for processing card data and images based on a defined naming scheme, including parsing for Forte status, types, creators, etc.",
          "IMPROVED: Data structure in `image_data.js` to include more detailed card attributes and counterpart information (blank/normal versions).",
        ],
      },
      {
        title: "Core Functionality Adaptation",
        items: [
          "IMPROVED: Filtering system adapted to include new card properties like 'Forte Status', 'Creator', and specific 'Trainer Types'.",
          "IMPROVED: Gallery display logic to correctly handle and prioritize normal vs. blank card versions.",
          "MAINTAINED: Core image viewing capabilities, lightbox functionality, and set-based navigation from v1.x, adapted for the new data structure.",
        ],
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2024-10-15",
    title: "Original Pocket Image Previewer",
    isOpen: false,
    changes: [
      {
        title: "Core Image Gallery Features",
        items: [
          "ADDED: Folder-based navigation for image sets with tabbed interface.",
          "ADDED: 'All' tab for recursive loading and display of all images.",
          "ADDED: Filtering by card Type & Rarity parsed from image filenames.",
          "ADDED: Configuration for filters, folder order, and tab colors via `filter_config.json`.",
        ],
      },
      {
        title: "Interactive Elements & UX",
        items: [
          "ADDED: Interactive Holo effect on thumbnails and lightbox images, reacting to mouse/touch.",
          "ADDED: Click effect on thumbnails before opening the lightbox.",
          "ADDED: Dynamic sizing controls (sliders) for gallery thumbnails and lightbox popup size, with settings saved to localStorage.",
          "ADDED: 'Load More' functionality for batched image loading to improve initial performance.",
          "ADDED: Lazy loading for gallery thumbnails.",
        ],
      },
      {
        title: "Multimedia & Aesthetics",
        items: [
          "ADDED: Background audio player with play/pause, next track, and volume controls.",
          "ADDED: Three.js animated particle background for visual flair.",
          "ADDED: Responsive design considerations for usability on different screen sizes.",
        ],
      },
    ],
  }
];

try {
    if (typeof changelogData !== 'undefined' && Array.isArray(changelogData) && changelogData.length > 0) {
        // Set global changelogData
        if (typeof window.changelogData === 'undefined') {
            window.changelogData = changelogData;
        } else {
            console.warn('[ChangelogData] window.changelogData already defined. Overwriting.');
            window.changelogData = changelogData;
        }

        // Set global latestVersion
        const firstEntry = changelogData[0];
        if (firstEntry && typeof firstEntry.version !== 'undefined') {
            if (typeof window.latestVersion === 'undefined') {
                window.latestVersion = firstEntry;
            } else {
                console.warn('[ChangelogData] window.latestVersion already defined. Overwriting.');
                window.latestVersion = firstEntry;
            }
            console.log('[ChangelogData] Changelog data loaded successfully. Latest version:', window.latestVersion.version);
        } else {
            console.error('[ChangelogData] First entry in changelogData is invalid or missing a version property.');
            window.latestVersion = undefined; // Ensure it's undefined if data is bad
        }
    } else {
        console.error('[ChangelogData] changelogData array is undefined, not an array, or empty.');
        window.changelogData = undefined;
        window.latestVersion = undefined;
    }
} catch (error) {
    console.error('[ChangelogData] Error during script execution:', error);
    window.changelogData = undefined;
    window.latestVersion = undefined;
}

console.log('[ChangelogData] Script execution finished.');
