// js/submissions.js
// Handles the "Submit Card" button functionality.

(function() {
    'use strict';

    // --- Configuration ---
    // Forte Card Submission Portal URL
    const SUBMISSION_PORTAL_URL = "https://script.google.com/macros/s/AKfycbwesoXMd6ng8y8EHFUzCt2tWPOlMlMlYgY1nJN2l9nlW5O3A_crAn-C45fyOlRxwYMO/exec"; 
    // --------------------------------------------------------------------
    
    const SUBMISSION_BUTTON_ID = 'submission-button'; // ID of the button in index.html

    /**
     * Opens the configured card submission portal link in a new browser tab.
     */
    function openSubmissionPortal() {
        console.log("[Submissions] Opening submission portal link:", SUBMISSION_PORTAL_URL);
        // Open the URL in a new tab securely
        window.open(SUBMISSION_PORTAL_URL, '_blank', 'noopener,noreferrer');
    }

    /**
     * Finds the submission button and attaches the click listener.
     */
    function initializeSubmissionButton() {
        const submissionButton = document.getElementById(SUBMISSION_BUTTON_ID);

        if (submissionButton) {
            console.log("[Submissions] Submission button found. Attaching listener.");
            submissionButton.addEventListener('click', openSubmissionPortal);
        } else {
            console.warn(`[Submissions] Button with ID "${SUBMISSION_BUTTON_ID}" not found in the HTML. Submission feature will be inactive.`);
        }
    }

    // --- Initialization ---
    // Wait for the DOM to be fully loaded before trying to find the button
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSubmissionButton);
    } else {
        // DOM is already loaded
        initializeSubmissionButton();
    }

})();
