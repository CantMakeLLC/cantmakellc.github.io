document.addEventListener("DOMContentLoaded", () => {
    // Initializes the search functionality (event listeners, UI references, etc.)
    SearchManager.init();
    
    // You can also initialize other modules here
    ThemeManager.init();
    ScrollManager.init();
    LoaderManager.init();
});


/**
 * THEME MANAGER
 * Handles persistence and system scheme detection.
 */
const ThemeManager = (() => {
  const CONFIG = {
    KEY: "user-theme-pref",
    ATTR: "data-bs-theme",
    BTN_ID: "theme-toggle",
  };

  const getPreferred = () => {
    const saved = localStorage.getItem(CONFIG.KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const apply = (theme) => {
    document.documentElement.setAttribute(CONFIG.ATTR, theme);
    localStorage.setItem(CONFIG.KEY, theme);
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: theme }));
  };

  const init = () => {
    apply(getPreferred());

    const btn = document.getElementById(CONFIG.BTN_ID);
    if (btn) {
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute(CONFIG.ATTR);
        apply(current === "dark" ? "light" : "dark");
      });
    }

    // Listen for OS changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(CONFIG.KEY)) {
          apply(e.matches ? "dark" : "light");
        }
      });
  };

  return { init };
})();

/**
 * SCROLL OBSERVER
 * Manages header collapse states.
 */
const ScrollManager = (() => {
  const init = () => {
    const header = document.getElementById("site-header");
    const threshold = 50;

    const checkScroll = () => {
      if (window.scrollY > threshold) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  };

  return { init };
})();



// Get the top page button:
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//search function (useless)
/**
 * NEW FEATURE: SEARCH MANAGER
 * Description: Handles the toggle logic, focus management, and search execution.
 * Self-contained and modular for easy maintenance.
 */
const SearchManager = (() => {
  // Configuration: Change these IDs to match your specific HTML structure
  const CONFIG = {
    TRIGGER_ID: "search-trigger",
    CONTAINER_ID: "search-container",
    CLOSE_ID: "search-close",
    INPUT_ID: "search-input",
    SUBMIT_ID: "search-submit",
    ACTIVE_CLASS: "active",
  };

  // Internal cache for UI elements
  const UI = {};

  /**
   * Performs the actual search logic.
   */
  const executeSearch = () => {
    const query = UI.input.value.trim();
    if (query.length > 0) {
      console.log(`Executing modular search for: ${query}`);
      // Action: Redirect or update UI
      UI.input.value = "";
      toggle(false);
    }
  };

  /**
   * Toggles the search overlay visibility.
   * @param {boolean} force - Optional boolean to force a state.
   */
  const toggle = (force) => {
    const isActive = UI.container.classList.toggle(CONFIG.ACTIVE_CLASS, force);
    if (isActive) {
      // Slight delay to ensure visibility transition has begun
      setTimeout(() => UI.input.focus(), 100);
    }
  };

  /**
   * Initializes the search functionality and event listeners.
   */
  const init = () => {
    // Initialize UI references based on CONFIG
    UI.trigger = document.getElementById(CONFIG.TRIGGER_ID);
    UI.container = document.getElementById(CONFIG.CONTAINER_ID);
    UI.close = document.getElementById(CONFIG.CLOSE_ID);
    UI.input = document.getElementById(CONFIG.INPUT_ID);
    UI.submit = document.getElementById(CONFIG.SUBMIT_ID);

    // Exit if essential elements are missing
    if (!UI.trigger || !UI.container) return;

    // Event Listeners
    UI.trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggle(true);
    });

    UI.close.addEventListener("click", () => toggle(false));

    UI.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });

    UI.submit.addEventListener("click", executeSearch);

    // Accessibility: Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggle(false);
    });
  };

  // Public API
  return { init, toggle, executeSearch };
})();

const LoaderManager = (() => {
            const CONFIG = {
                LOADER_ID: 'preloader',
                HIDDEN_CLASS: 'loader-hidden',
                DISPLAY_TIME: 3000
            };

            const hide = () => {
                const preloader = document.getElementById(CONFIG.LOADER_ID);
                if (preloader) {
                    preloader.classList.add(CONFIG.HIDDEN_CLASS);
                }
            };

            const init = () => {
                /**
                 * window.onload ensures we wait for all images and resources.
                 * If the page is already loaded, hide immediately.
                 */
                 setTimeout(hide, CONFIG.DISPLAY_TIME);
            };

            return { init };
        })();
