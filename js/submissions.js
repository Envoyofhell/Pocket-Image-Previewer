// js/submissions.js
// Handles the "Submit Card" button functionality.

(function() {
    'use strict';

    // --- Configuration ---
    // IMPORTANT: Replace this URL with your *actual deployed Google Apps Script web app URL*
    // This URL is for the Forte Card Submission Portal (Index.html served by your Apps Script).
    const SUBMISSION_PORTAL_URL = "YOUR_APPS_SCRIPT_SUBMISSION_WEB_APP_URL_HERE"; 
    // Example: "[https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec](https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec)";
    // --------------------------------------------------------------------
    
    const SUBMISSION_BUTTON_ID = 'submission-button'; // ID of the button in index.html

    /**
     * Opens the configured card submission portal link in a new browser tab.
     */
    function openSubmissionPortal() {
        if (!SUBMISSION_PORTAL_URL || SUBMISSION_PORTAL_URL === "YOUR_APPS_SCRIPT_SUBMISSION_WEB_APP_URL_HERE") {
            console.warn("[Submissions] Submission Portal URL is not configured in js/submissions.js. Please update it with your deployed Apps Script web app URL.");
            alert("The Card Submission Portal link is not configured yet. Please contact the site administrator.");
            return;
        }

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
