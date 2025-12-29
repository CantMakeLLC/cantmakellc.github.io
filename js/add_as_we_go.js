(function() {
    'use strict';

    /**
     * Initializes the scroll observer to handle header state transitions.
     */
    const initHeaderScroll = () => {
        const header = document.getElementById('site-header');
        const body = document.body;
        const scrollThreshold = 40;

        if (!header) return;

        /**
         * Updates visual state based on vertical scroll offset.
         */
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentScroll > scrollThreshold) {
                // Apply scroll-specific state classes
                header.classList.add('header-scrolled');
                body.classList.add('scrolled');
            } else {
                // Revert to initial state
                header.classList.remove('header-scrolled');
                body.classList.remove('scrolled');
            }
        };

        // Attach optimized event listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Immediate check for mid-page refreshes
        handleScroll();
    };

    // Execute on DOM ready
    document.addEventListener('DOMContentLoaded', initHeaderScroll);

})();