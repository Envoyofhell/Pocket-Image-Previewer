(function() {
    'use strict';

    /**
     * Creates the HTML string for the footer's content.
     * @returns {string} The HTML string.
     */
    function createFooterContentHTML() {
        const currentYear = new Date().getFullYear();
        const projectVersion = "2.5.1";
        const designerDiscordLink = "https://discordapp.com/users/your-discord-id-here";

        return `
            <div class="footer-content">
                <div class="footer-links">
                    <a href="https://github.com/Envoyofhell/Pocket-Image-Previewer" target="_blank" rel="noopener noreferrer" class="footer-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://discord.gg/8PyzHdDc4v" target="_blank" rel="noopener noreferrer" class="footer-link">
                        <i class="fab fa-discord"></i> Envoy's Realm
                    </a>
                    <button id="footer-credits-link" class="footer-link">
                        <i class="fas fa-info-circle"></i> Credits
                    </button>
                </div>
                <div class="footer-copyright">
                    <p>
                        Designed by <a href="${designerDiscordLink}" target="_blank" rel="noopener noreferrer">EnvoyOfHell</a>.
                        
                    </p>
                    <p>Pokémon © 1995-${currentYear} Nintendo, Creatures Inc., GAME FREAK inc. WuWa © Kuro Games.Fan Project. Full acknowledgments in Credits.</p>
                </div>
            </div>
        `;
    }

    /**
     * Renders the footer into the DOM.
     */
    function renderFooter() {
        let footerElement = document.querySelector('footer.app-footer');

        if (!footerElement) {
            footerElement = document.createElement('footer');
            footerElement.className = 'app-footer';
            document.body.appendChild(footerElement);
        }

        footerElement.innerHTML = createFooterContentHTML();

        const creditsButton = document.getElementById('footer-credits-link');
        if (creditsButton) {
            creditsButton.addEventListener('click', () => {
                if (window.ForteUIControls?.openCredits) {
                    window.ForteUIControls.openCredits();
                } else if (window.openKeyPopup) {
                    window.openKeyPopup();
                } else {
                    alert('Credits/Info popup function not found.');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderFooter);
    } else {
        renderFooter();
    }
})();