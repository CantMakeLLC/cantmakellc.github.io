document.addEventListener("DOMContentLoaded", () => {
    // Initializes the search functionality (event listeners, UI references, etc.)
    SearchManager.init();
    
    // You can also initialize other modules here
    ThemeManager.init();
    ScrollManager.init();
    LoaderManager.init();
    RevealManager.init();
    CartManager.init();
    FilterManager.init();
    DetailManager.init();
    CartPageManager.init();
    CartUI.init();
    SyncManager.init();
    /**
             * Safety Sync: Explicitly trigger a badge update from index.html 
             * to ensure storage and UI are perfectly aligned on home load.
             */
            if (typeof CartUI !== 'undefined') {
                CartUI.updateBadge();
            }
            
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

        /**
         * REVEAL MANAGER (Selected Code Integration)
         * Description: Uses IntersectionObserver to trigger animations 
         * when products scroll into the viewport.
         */
        const RevealManager = (() => {
            const init = () => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('revealed');
                        }
                    });
                }, { threshold: 0.1 });

                document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
            };
            return { init };
        })();

        /**
         * MODULAR CART MANAGER (Integration)
         * Description: Listens for clicks on Add to Cart buttons, 
         * extracts product metadata from HTML, and saves to CartStore.
         */
        const CartManager = (() => {
            const init = () => {
                document.querySelectorAll('.btn-add-cart').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // 1. Traverse up to find the data container
                        const itemContainer = this.closest('.product-item');
                        
                        // 2. Extract metadata
                        const product = {
                            id: itemContainer.dataset.id,
                            name: itemContainer.dataset.name,
                            price: parseFloat(itemContainer.dataset.price),
                            thumb: itemContainer.dataset.thumb,
                            qty: 1
                        };

                        // 3. Save to persistent storage (defined in cart_manager.js)
                        CartStore.add(product);

                        // 4. UI Feedback
                        const originalText = this.innerText;
                        this.innerText = "Added!";
                        this.style.backgroundColor = "#28a745"; // Success Green
                        
                        setTimeout(() => {
                            this.innerText = originalText;
                            this.style.backgroundColor = "";
                        }, 1500);
                    });
                });
            };
            return { init };
        })();


        /**
         * FILTER MANAGER
         * Description: Sorts products in the grid based on the price-filter select element.
         */
        const FilterManager = (() => {
            const CONFIG = {
                SELECT_ID: 'price-filter',
                GRID_ID: 'product-grid',
                ITEM_CLASS: 'product-item'
            };

            let originalOrder = [];

            /**
             * Extracts numeric price value from the product text.
             */
            const getPrice = (item) => {
                const priceText = item.querySelector('p').innerText;
                return parseFloat(priceText.replace(/[^0-9.]/g, ''));
            };

            /**
             * Sorting logic and DOM manipulation.
             */
            const applySort = (criteria) => {
                const grid = document.getElementById(CONFIG.GRID_ID);
                const items = Array.from(grid.querySelectorAll(`.${CONFIG.ITEM_CLASS}`));

                if (criteria === 'featured') {
                    // Restore the order as it was on initial page load
                    originalOrder.forEach(item => grid.appendChild(item));
                } else {
                    items.sort((a, b) => {
                        const priceA = getPrice(a);
                        const priceB = getPrice(b);
                        return criteria === 'low' ? priceA - priceB : priceB - priceA;
                    });
                    items.forEach(item => grid.appendChild(item));
                }

                // Re-initialize reveals if necessary (already revealed items stay revealed)
                RevealManager.init();
            };

            const init = () => {
                const select = document.getElementById(CONFIG.SELECT_ID);
                const grid = document.getElementById(CONFIG.GRID_ID);
                
                if (!select || !grid) return;

                // Cache the original state for 'featured' sorting
                originalOrder = Array.from(grid.querySelectorAll(`.${CONFIG.ITEM_CLASS}`));

                select.addEventListener('change', (e) => applySort(e.target.value));
            };

            return { init };
        })();

        /**
         * DETAIL MANAGER
         * Description: Handles quantity logic and Add to Cart button feedback.
         */
        const DetailManager = (() => {
            const UI = {
                minus: document.getElementById('qty-minus'),
                plus: document.getElementById('qty-plus'),
                input: document.getElementById('qty-count'),
                btn: document.getElementById('add-to-cart')
            };

            const updateQty = (delta) => {
                let current = parseInt(UI.input.value);
                let next = current + delta;
                if (next >= 1) UI.input.value = next;
            };

            const init = () => {
                if (!UI.btn) return;

                UI.minus.addEventListener('click', () => updateQty(-1));
                UI.plus.addEventListener('click', () => updateQty(1));

                UI.btn.addEventListener('click', function() {
                    const originalText = this.innerText;
                    this.innerText = "Added to Bag";
                    this.style.backgroundColor = "#28a745"; // Success Green
                    
                    setTimeout(() => {
                        this.innerText = originalText;
                        this.style.backgroundColor = "";
                        UI.input.value = 1;
                    }, 2000);
                });
            };

            return { init };
        })();

        /**
         * UPDATED CART PAGE MANAGER
         * Description: Now integrates with CartStore (localStorage) to render 
         * and update the cart dynamically.
         */
        const CartPageManager = (() => {
            const CONFIG = {
                VAT_RATE: 0.10,
                CONTAINER_ID: 'cart-items-container',
                EMPTY_MSG_ID: 'cart-empty'
            };

            const UI = {
                subtotal: document.getElementById('subtotal-val'),
                vat: document.getElementById('vat-val'),
                total: document.getElementById('total-val'),
                container: document.getElementById(CONFIG.CONTAINER_ID),
                emptyState: document.getElementById(CONFIG.EMPTY_MSG_ID)
            };

            const formatCurrency = (num) => `¥${num.toFixed(2)}`;

            /**
             * Renders the HTML for each product in storage.
             */
            const renderItems = () => {
                const items = CartStore.getItems();
                
                if (items.length === 0) {
                    UI.container.innerHTML = "";
                    UI.container.classList.add('d-none');
                    UI.emptyState.classList.remove('d-none');
                    updateSummaries(0);
                    return;
                }

                UI.container.classList.remove('d-none');
                UI.emptyState.classList.add('d-none');

                UI.container.innerHTML = items.map(item => `
                    <div class="cart-row py-4 border-bottom d-flex align-items-center justify-content-between" data-id="${item.id}">
                        <div class="d-flex align-items-center gap-4">
                            <img src="${item.thumb}" alt="${item.name}" class="cart-item-img">
                            <div>
                                <h6 class="fw-bold mb-1">${item.name}</h6>
                                <p class="small text-muted mb-0">${item.variant || ''}</p>
                                <button class="btn btn-link p-0 text-muted small text-decoration-none mt-2 btn-remove">Remove</button>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-5">
                            <div class="qty-control">
                                <button class="qty-btn btn-minus"><i class="bi bi-dash"></i></button>
                                <input type="number" value="${item.qty}" class="qty-input" readonly>
                                <button class="qty-btn btn-plus"><i class="bi bi-plus"></i></button>
                            </div>
                            <p class="fw-bold mb-0">¥${(item.price * item.qty).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('');

                attachEvents();
                calculateTotalValue(items);
            };

            const updateSummaries = (subtotal) => {
                const vat = subtotal * CONFIG.VAT_RATE;
                const total = subtotal + vat;
                UI.subtotal.innerText = formatCurrency(subtotal);
                UI.vat.innerText = formatCurrency(vat);
                UI.total.innerText = formatCurrency(total);
            };

            const calculateTotalValue = (items) => {
                const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
                updateSummaries(subtotal);
            };

            const attachEvents = () => {
                UI.container.querySelectorAll('.cart-row').forEach(row => {
                    const id = row.dataset.id;
                    
                    row.querySelector('.btn-minus').addEventListener('click', () => {
                        CartStore.updateQty(id, -1);
                        renderItems();
                    });

                    row.querySelector('.btn-plus').addEventListener('click', () => {
                        CartStore.updateQty(id, 1);
                        renderItems();
                    });

                    row.querySelector('.btn-remove').addEventListener('click', () => {
                        row.classList.add('fade-out');
                        setTimeout(() => {
                            CartStore.remove(id);
                            renderItems();
                        }, 300);
                    });
                });
            };

            const init = () => {
                renderItems();
            };

            return { init };
        })();

/**
 * CANTMAKE CART SYSTEM (Modular)
 * * This script handles persistent storage for the shopping cart and 
 * provides a global API to interact with the cart across different pages.
 */

const CartStore = (() => {
    const STORAGE_KEY = 'cantmake_cart_data';

    /**
     * Retrieves the current cart array from localStorage.
     * @returns {Array} List of product objects.
     */
    const getItems = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    };

    /**
     * Saves the cart array to localStorage and triggers badge updates.
     * @param {Array} items 
     */
    const saveItems = (items) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        // Trigger a custom event so other components can react to cart changes
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    };

    /**
     * Adds an item or increments quantity if it exists.
     * @param {Object} product {id, name, price, thumb, variant}
     */
    const add = (product) => {
        const items = getItems();
        const existing = items.find(item => item.id === product.id);

        if (existing) {
            existing.qty += (product.qty || 1);
        } else {
            items.push({ ...product, qty: (product.qty || 1) });
        }
        saveItems(items);
    };

    /**
     * Updates the quantity of a specific item.
     */
    const updateQty = (id, delta) => {
        let items = getItems();
        const item = items.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                items = items.filter(i => i.id !== id);
            }
            saveItems(items);
        }
    };

    /**
     * Removes an item entirely.
     */
    const remove = (id) => {
        const items = getItems().filter(item => item.id !== id);
        saveItems(items);
    };

    return { getItems, add, updateQty, remove };
})();

/**
 * CART UI MANAGER
 * Handles visual updates to the global cart badge.
 */
const CartUI = (() => {
    const BADGE_CLASS = 'cart-badge';

    /**
     * Updates all elements with the .cart-badge class.
     */
    const updateBadge = () => {
        const items = CartStore.getItems();
        const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
        
        document.querySelectorAll(`.${BADGE_CLASS}`).forEach(badge => {
            badge.innerText = totalCount;
            // Hide badge if empty for a cleaner look
            badge.style.display = totalCount > 0 ? 'flex' : 'none';
        });
    };

    const init = () => {
        // 1. Initial check when the script runs
        updateBadge();
        
        // 2. Listen for internal cart updates (actions within the same page)
        window.addEventListener('cartUpdated', updateBadge);

        /**
         * FEATURE: CROSS-TAB SYNCHRONIZATION
         * Description: If the user has multiple tabs open and adds an item 
         * in Tab A, Tab B's badge will update immediately without a refresh.
         */
        window.addEventListener('storage', (event) => {
            if (event.key === 'cantmake_cart_data') {
                updateBadge();
            }
        });

        /**
         * FEATURE: BACK-FORWARD CACHE (BFCache) HANDLING
         * Description: Browsers often 'freeze' pages in memory when navigating away.
         * When clicking the 'Back' button, standard load events don't fire.
         * 'pageshow' ensures the badge is re-checked every time the page appears.
         */
        window.addEventListener('pageshow', (event) => {
            updateBadge();
        });
    };

    return { init, updateBadge };
})();



        /**
         * GLOBAL SYNC MANAGER (BFCache Support)
         */
        const SyncManager = (() => {
            const updateUI = () => {
                if (typeof CartUI !== 'undefined') CartUI.updateBadge();
            };
            const init = () => {
                updateUI();
                window.addEventListener('pageshow', updateUI);
            };
            return { init };
        })();

