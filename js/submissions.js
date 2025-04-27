// js/submissions.js
// Handles card submission button functionality independently.

(function() {
    'use strict';

    // --- Configuration ---
    // --- IMPORTANT: Replace this URL with your actual Google Script link ---
    const SUBMISSION_URL = "https://script.google.com/macros/s/AKfycbwpbkeExZf3fOPRJjnOG6ynC4E77ZS_45PkdHnk4Xgn2SECjv3rggZyFlFtOf4poqJB/exec";
    // --------------------------------------------------------------------
    const SUBMISSION_BUTTON_ID = 'submission-button';

    /**
     * Opens the configured card submission link in a new browser tab.
     */
    function openSubmissionLink() {
        if (!SUBMISSION_URL || SUBMISSION_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
            console.warn("[Submissions] Submission URL is not configured in js/submissions.js.");
            alert("Card submission link is not configured yet."); // User feedback
            return;
        }

        console.log("[Submissions] Opening submission link:", SUBMISSION_URL);
        // Open the URL in a new tab securely
        window.open(SUBMISSION_URL, '_blank', 'noopener,noreferrer');
    }

    /**
     * Finds the submission button and attaches the click listener.
     */
    function initializeSubmissionButton() {
        const submissionButton = document.getElementById(SUBMISSION_BUTTON_ID);

        if (submissionButton) {
            console.log("[Submissions] Submission button found. Attaching listener.");
            submissionButton.addEventListener('click', openSubmissionLink);
        } else {
            console.warn(`[Submissions] Button with ID "${SUBMISSION_BUTTON_ID}" not found. Submission feature inactive.`);
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

})(); // End of IIFE scope
