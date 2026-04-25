const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("navOverlay");
const navClose = document.getElementById("navClose");

if (hamburger && nav && navClose) {
  hamburger.addEventListener("click", () => {
    nav.classList.add("is-open");
    nav.removeAttribute("aria-hidden");
  });

  function closeNav() {
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
  }

  navClose.addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

const topbarHomeLink = document.querySelector('.topbar__sig a[href="index.html"]');
if (topbarHomeLink) {
  topbarHomeLink.addEventListener("click", () => {
    window.sessionStorage.removeItem("valerieweb.collectionMode");
  });
}

const collectionSection = document.getElementById("collection");
const recentProjectsToggle = document.querySelector(".section__title-back");
const viewPortfolioToggle = document.querySelector(".section__title-link");
const portfolioCards = collectionSection
  ? collectionSection.querySelector(".cards")
  : null;
const portfolioViewport = collectionSection
  ? collectionSection.querySelector(".portfolio-viewport")
  : null;
const portfolioPrev = collectionSection
  ? collectionSection.querySelector(".portfolio-arrow--left")
  : null;
const portfolioNext = collectionSection
  ? collectionSection.querySelector(".portfolio-arrow--right")
  : null;
const portfolioCloneClass = "card--loop-clone";

if (collectionSection) {
  const COLLECTION_MODE_KEY = "valerieweb.collectionMode";
  let busyClearTimer = null;
  let arrowAnimRaf = null;
  let cardsFadeTimer = null;

  const setCarouselBusy = (busy) => {
    collectionSection.classList.toggle("carousel-busy", !!busy);
  };

  const replayCardsFade = () => {
    if (!portfolioCards) return;
    portfolioCards.classList.remove("cards--fadein");
    // Force reflow so the animation can replay each time.
    void portfolioCards.offsetWidth;
    portfolioCards.classList.add("cards--fadein");
    if (cardsFadeTimer) window.clearTimeout(cardsFadeTimer);
    cardsFadeTimer = window.setTimeout(() => {
      portfolioCards.classList.remove("cards--fadein");
    }, 3400);
  };

  const getBasePortfolioCards = () => {
    if (!portfolioCards) return [];
    return Array.from(
      portfolioCards.querySelectorAll(`.card:not(.${portfolioCloneClass})`)
    );
  };

  const getPortfolioStep = () => {
    if (!portfolioCards) return 0;
    const firstCard = portfolioCards.querySelector(`.card:not(.${portfolioCloneClass})`);
    if (!firstCard) return 0;
    const cardWidth = firstCard.offsetWidth;
    const gap = parseFloat(window.getComputedStyle(portfolioCards).gap || "0");
    return cardWidth + gap;
  };

  const getPortfolioSetWidth = () => {
    const baseCards = getBasePortfolioCards();
    return getPortfolioStep() * baseCards.length;
  };

  const setupPortfolioLoop = () => {
    if (!portfolioCards || !portfolioViewport) return;
    if (portfolioCards.dataset.loopReady === "true") return;

    const baseCards = getBasePortfolioCards();
    if (!baseCards.length) return;

    const beforeFrag = document.createDocumentFragment();
    const afterFrag = document.createDocumentFragment();

    baseCards.forEach((card) => {
      const beforeClone = card.cloneNode(true);
      beforeClone.classList.add(portfolioCloneClass);
      beforeFrag.appendChild(beforeClone);

      const afterClone = card.cloneNode(true);
      afterClone.classList.add(portfolioCloneClass);
      afterFrag.appendChild(afterClone);
    });

    portfolioCards.prepend(beforeFrag);
    portfolioCards.append(afterFrag);
    portfolioCards.dataset.loopReady = "true";

    const setWidth = getPortfolioSetWidth();
    if (setWidth > 0) {
      portfolioViewport.scrollLeft = setWidth;
    }
  };

  const teardownPortfolioLoop = () => {
    if (!portfolioCards || !portfolioViewport) return;
    portfolioCards
      .querySelectorAll(`.${portfolioCloneClass}`)
      .forEach((node) => node.remove());
    delete portfolioCards.dataset.loopReady;
    portfolioViewport.scrollLeft = 0;
  };

  const normalizePortfolioLoopScroll = () => {
    if (!portfolioViewport || !portfolioCards) return;
    if (portfolioCards.dataset.loopReady !== "true") return;
    const setWidth = getPortfolioSetWidth();
    if (!setWidth) return;

    // Keep a wider middle safety band to avoid visible boundary jitter.
    const min = setWidth * 0.25;
    const max = setWidth * 1.75;
    let left = portfolioViewport.scrollLeft;

    if (left < min) left += setWidth;
    else if (left > max) left -= setWidth;
    if (left !== portfolioViewport.scrollLeft) portfolioViewport.scrollLeft = left;
  };

  const updatePortfolioArrows = () => {
    if (!portfolioViewport || !portfolioPrev || !portfolioNext) return;
    if (!collectionSection.classList.contains("mode-recent")) {
      portfolioPrev.disabled = true;
      portfolioNext.disabled = true;
      return;
    }
    portfolioPrev.disabled = false;
    portfolioNext.disabled = false;
  };

  const stopArrowAnimation = () => {
    if (arrowAnimRaf) {
      window.cancelAnimationFrame(arrowAnimRaf);
      arrowAnimRaf = null;
    }
  };

  const updateCollectionTitleSelection = (mode) => {
    if (recentProjectsToggle) {
      recentProjectsToggle.classList.toggle("is-active", mode === "mode-recent");
    }
    if (viewPortfolioToggle) {
      viewPortfolioToggle.classList.toggle("is-active", mode === "mode-portfolio");
    }
  };

  const updateHeroPortfolioState = (mode) => {
    document.body.classList.toggle("is-portfolio-view", mode === "mode-portfolio");
  };

  const animatePortfolioBy = (delta, duration = 320) => {
    if (!portfolioViewport) return;
    stopArrowAnimation();
    setCarouselBusy(true);

    const start = performance.now();
    const from = portfolioViewport.scrollLeft;
    const to = from + delta;
    const direction = Math.sign(delta) || 1;

    // smoother main motion before tail handoff
    const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutSine(t);
      portfolioViewport.scrollLeft = from + (to - from) * eased;
      normalizePortfolioLoopScroll();

      if (t < 1) {
        arrowAnimRaf = window.requestAnimationFrame(step);
      } else {
        arrowAnimRaf = null;
        setCarouselBusy(false);
      }
    };

    arrowAnimRaf = window.requestAnimationFrame(step);
  };

  const setCollectionMode = (mode, source = "user") => {
    collectionSection.classList.remove("mode-recent", "mode-portfolio");
    if (mode) collectionSection.classList.add(mode);
    if (mode === "mode-recent") {
      setupPortfolioLoop();
    } else {
      teardownPortfolioLoop();
    }
    if (mode) {
      window.sessionStorage.setItem(COLLECTION_MODE_KEY, mode);
    } else {
      window.sessionStorage.removeItem(COLLECTION_MODE_KEY);
    }
    updateCollectionTitleSelection(mode);
    updateHeroPortfolioState(mode);
    const shouldReplayFade =
      source === "init" || mode === "mode-recent";
    if (shouldReplayFade) replayCardsFade();
    updatePortfolioArrows();
  };

  if (recentProjectsToggle) {
    recentProjectsToggle.addEventListener("click", (e) => {
      e.preventDefault();
      setCollectionMode("mode-recent", "user");
    });
  }

  if (viewPortfolioToggle) {
    viewPortfolioToggle.addEventListener("click", (e) => {
      e.preventDefault();
      setCollectionMode("mode-portfolio", "user");
    });
  }

  if (portfolioPrev && portfolioNext) {
    portfolioPrev.addEventListener("click", () => {
      if (!portfolioViewport || !collectionSection.classList.contains("mode-recent")) return;
      const step = getPortfolioStep();
      if (!step) return;
      animatePortfolioBy(-step * 4);
    });

    portfolioNext.addEventListener("click", () => {
      if (!portfolioViewport || !collectionSection.classList.contains("mode-recent")) return;
      const step = getPortfolioStep();
      if (!step) return;
      animatePortfolioBy(step * 4);
    });
  }

  if (portfolioViewport) {
    let scrollTicking = false;
    let momentumVelocity = 0;
    let momentumRaf = null;
    let momentumStartTimer = null;

    const stopMomentum = () => {
      if (momentumRaf) {
        window.cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
    };

    const runMomentum = () => {
      if (!collectionSection.classList.contains("mode-recent")) return;
      stopMomentum();
      setCarouselBusy(true);

      const step = () => {
        if (!portfolioViewport) return;
        if (Math.abs(momentumVelocity) < 0.08) {
          momentumVelocity = 0;
          momentumRaf = null;
          setCarouselBusy(false);
          return;
        }

        portfolioViewport.scrollLeft = portfolioViewport.scrollLeft + momentumVelocity;
        normalizePortfolioLoopScroll();
        momentumVelocity *= 0.92;
        momentumRaf = window.requestAnimationFrame(step);
      };

      momentumRaf = window.requestAnimationFrame(step);
    };

    portfolioViewport.addEventListener(
      "scroll",
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          normalizePortfolioLoopScroll();
          updatePortfolioArrows();
          scrollTicking = false;
        });
      },
      { passive: true }
    );

    // Continuous horizontal scroll with delayed momentum after release.
    portfolioViewport.addEventListener(
      "wheel",
      (e) => {
        if (!collectionSection.classList.contains("mode-recent")) return;

        const mostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15;
        if (!mostlyHorizontal || Math.abs(e.deltaX) < 2) return;
        const delta = e.deltaX;

        e.preventDefault();
        stopArrowAnimation();
        stopMomentum();
        setCarouselBusy(true);
        if (busyClearTimer) window.clearTimeout(busyClearTimer);

        portfolioViewport.scrollLeft = portfolioViewport.scrollLeft + delta * 0.55;
        normalizePortfolioLoopScroll();
        momentumVelocity = delta * 0.24;
        if (momentumStartTimer) window.clearTimeout(momentumStartTimer);
        momentumStartTimer = window.setTimeout(() => {
          runMomentum();
        }, 45);

        busyClearTimer = window.setTimeout(() => {
          if (!momentumRaf) setCarouselBusy(false);
        }, 220);
      },
      { passive: false }
    );
  }

  const savedMode = window.sessionStorage.getItem(COLLECTION_MODE_KEY);
  if (savedMode === "mode-recent" || savedMode === "mode-portfolio") {
    setCollectionMode(savedMode, "init");
  } else {
    updateCollectionTitleSelection(null);
    updateHeroPortfolioState(null);
    replayCardsFade();
    updatePortfolioArrows();
  }

  window.addEventListener("resize", updatePortfolioArrows);
}

const contactWrap = document.querySelector(".contact__img-wrap");
const contactImg = contactWrap ? contactWrap.querySelector("img") : null;
const aboutBarWrap = document.querySelector(".about-olive-bar--secondary");
const aboutBarImg = document.querySelector(".about-olive-bar__img");
const contactSection = document.getElementById("contact");
const contactEmailPanel = document.querySelector(".contact__email-panel");
const contactEmailPanelScroll = document.querySelector(".contact__email-panel-scroll");
const contactEmailToggle = document.querySelector(".contact__email-toggle");
const contactParallaxFactor = 0.72; // image scrolls slower than surrounding content
const aboutBarParallaxFactor = 0.72;

if (contactWrap && contactImg) {
  let rafId = null;
  let targetY = 0;
  let currentY = 0;

  const computeTargetParallaxY = () => {
    const rect = contactWrap.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    const imageCenter = rect.top + rect.height * 0.5;
    const delta = viewportCenter - imageCenter;
    return delta * (1 - contactParallaxFactor);
  };

  const animateParallax = () => {
    const diff = targetY - currentY;
    currentY += diff * 0.12; // smoothing

    contactImg.style.transform = `translateY(${currentY.toFixed(2)}px) scale(1.12)`;

    if (Math.abs(diff) > 0.08) {
      rafId = window.requestAnimationFrame(animateParallax);
    } else {
      currentY = targetY;
      contactImg.style.transform = `translateY(${currentY.toFixed(2)}px) scale(1.12)`;
      rafId = null;
    }
  };

  const requestParallaxUpdate = () => {
    targetY = computeTargetParallaxY();
    if (!rafId) rafId = window.requestAnimationFrame(animateParallax);
  };

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  requestParallaxUpdate();
}

if (aboutBarWrap && aboutBarImg) {
  let rafId = null;
  let targetY = 0;
  let currentY = 0;

  const computeTargetParallaxY = () => {
    const rect = aboutBarWrap.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    const imageCenter = rect.top + rect.height * 0.5;
    const delta = viewportCenter - imageCenter;
    return delta * (1 - aboutBarParallaxFactor);
  };

  const animateParallax = () => {
    const diff = targetY - currentY;
    currentY += diff * 0.12;

    aboutBarImg.style.transform = `translateY(${currentY.toFixed(2)}px) scale(1.13)`;

    if (Math.abs(diff) > 0.08) {
      rafId = window.requestAnimationFrame(animateParallax);
    } else {
      currentY = targetY;
      aboutBarImg.style.transform = `translateY(${currentY.toFixed(2)}px) scale(1.13)`;
      rafId = null;
    }
  };

  const requestParallaxUpdate = () => {
    targetY = computeTargetParallaxY();
    if (!rafId) rafId = window.requestAnimationFrame(animateParallax);
  };

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  requestParallaxUpdate();
}

if (contactSection && contactEmailPanel) {
  let panelTicking = false;

  const updateEmailPanelScroll = () => {
    const rect = contactSection.getBoundingClientRect();
    const startY = window.innerHeight * 0.9;
    const progress = Math.min(1, Math.max(0, (startY - rect.top) / Math.max(rect.height, 1)));
    const travel = 220; // how far the email panel glides upward over the image
    const offsetY = -travel * progress;

    contactEmailPanel.style.transform = `translateY(${offsetY.toFixed(2)}px)`;
    panelTicking = false;
  };

  const requestEmailPanelUpdate = () => {
    if (!panelTicking) {
      panelTicking = true;
      window.requestAnimationFrame(updateEmailPanelScroll);
    }
  };

  window.addEventListener("scroll", requestEmailPanelUpdate, { passive: true });
  window.addEventListener("resize", requestEmailPanelUpdate);
  requestEmailPanelUpdate();
}

if (contactEmailPanelScroll && contactEmailToggle) {
  contactEmailToggle.addEventListener("click", () => {
    const nextOpen = !contactEmailPanelScroll.classList.contains("is-open");
    contactEmailPanelScroll.classList.toggle("is-open", nextOpen);
    contactEmailToggle.setAttribute("aria-expanded", String(nextOpen));
  });
}
