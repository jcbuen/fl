(function waitForTargetAndInject() {
  const targetSelector = "#homeTab > div > div.verticalSection.section0.emby-scroller-container";

  function injectDualScrollArrows(container) {
    if (!container || container.dataset.arrowInjected) return;

    container.dataset.arrowInjected = "true";

    const scrollable = container.querySelector(".emby-scroller");
    if (!scrollable) return console.warn("No scrollable child found");

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "scroll-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.overflow = "hidden";

    // Create arrows
    const leftArrow = document.createElement("div");
    const rightArrow = document.createElement("div");

    leftArrow.className = "scroll-arrow left";
    rightArrow.className = "scroll-arrow right";

    leftArrow.textContent = "◀";
    rightArrow.textContent = "▶";

    const baseArrowStyle = {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "2rem",
      background: "rgba(255,255,255,0.7)",
      cursor: "pointer",
      zIndex: "10",
      padding: "0 10px",
      transition: "opacity 0.3s ease",
      opacity: "0",
      pointerEvents: "none"
    };

    Object.assign(leftArrow.style, baseArrowStyle, { left: "0" });
    Object.assign(rightArrow.style, baseArrowStyle, { right: "0" });

    // Inject into DOM
    container.insertBefore(wrapper, scrollable);
    wrapper.appendChild(scrollable);
    wrapper.appendChild(leftArrow);
    wrapper.appendChild(rightArrow);

    // Scroll logic
    function updateArrows() {
      const maxScrollLeft = scrollable.scrollWidth - scrollable.clientWidth;
      const scrollLeft = scrollable.scrollLeft;
      const buffer = 5;

      const showLeft = scrollLeft > buffer;
      const showRight = scrollLeft < maxScrollLeft - buffer;

      leftArrow.style.opacity = showLeft ? "1" : "0";
      rightArrow.style.opacity = showRight ? "1" : "0";

      leftArrow.style.pointerEvents = showLeft ? "auto" : "none";
      rightArrow.style.pointerEvents = showRight ? "auto" : "none";
    }

    function scrollByAmount(direction) {
      const amount = scrollable.clientWidth * 0.8;
      scrollable.scrollBy({ left: direction * amount, behavior: "smooth" });
    }

    leftArrow.addEventListener("click", () => scrollByAmount(-1));
    rightArrow.addEventListener("click", () => scrollByAmount(1));

    scrollable.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    new MutationObserver(updateArrows).observe(scrollable, { childList: true, subtree: true });

    updateArrows();
  }

  function tryInject() {
    const container = document.querySelector(targetSelector);
    if (container && !container.dataset.arrowInjected) {
      injectDualScrollArrows(container);
    }
  }

  // Wait for document.body to exist
  function waitForBody() {
    if (!document.body) {
      requestAnimationFrame(waitForBody);
      return;
    }

    // Observe DOM changes to catch dynamic navigation
    const observer = new MutationObserver(() => requestAnimationFrame(tryInject));
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial injection attempt
    requestAnimationFrame(tryInject);
  }

  waitForBody();
})();
