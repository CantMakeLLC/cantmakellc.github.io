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
