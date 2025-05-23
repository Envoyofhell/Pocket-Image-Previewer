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