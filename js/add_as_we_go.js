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

// Initialize modules on load
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  ScrollManager.init();
});


// Get the top page button:
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

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
            const UI = {
                trigger: document.getElementById('search-trigger'),
                container: document.getElementById('search-container'),
                close: document.getElementById('search-close'),
                input: document.getElementById('search-input'),
                submit: document.getElementById('search-submit')
            };

            /**
             * Performs the actual search logic.
             */
            const executeSearch = () => {
                const query = UI.input.value.trim();
                if (query.length > 0) {
                    console.log(`Executing search for: ${query}`);
                    // In a real app, window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    UI.input.value = "";
                    toggle(false);
                }
            };

            /**
             * Toggles the search overlay visibility.
             * @param {boolean} force - Optional boolean to force a state.
             */
            const toggle = (force) => {
                const isActive = UI.container.classList.toggle('active', force);
                if (isActive) {
                    // Focus the input immediately for better UX
                    setTimeout(() => UI.input.focus(), 100);
                }
            };

            const init = () => {
                if (!UI.trigger) return;

                UI.trigger.addEventListener('click', () => toggle(true));
                UI.close.addEventListener('click', () => toggle(false));

                // Handle 'Enter' key press
                UI.input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') executeSearch();
                });

                // Handle icon click inside the field
                UI.submit.addEventListener('click', executeSearch);

                // Close on Escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') toggle(false);
                });
            };

            return { init };
        })();

        document.addEventListener("DOMContentLoaded", () => {
            ThemeManager.init();
            ScrollManager.init();
            SearchManager.init();
        });