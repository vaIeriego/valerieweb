const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("navOverlay");
const navClose = document.getElementById("navClose");

if (hamburger && nav && navClose) {
  let navOpenScrollY = 0;

  hamburger.addEventListener("click", () => {
    navOpenScrollY = window.scrollY;
    nav.classList.add("is-open");
    nav.removeAttribute("aria-hidden");
    hamburger.setAttribute("aria-expanded", "true");
  });

  function closeNav({ preserveScroll = true } = {}) {
    nav.classList.remove("is-open");
    nav.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    if (preserveScroll) {
      window.scrollTo({ top: navOpenScrollY, behavior: "auto" });
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: navOpenScrollY, behavior: "auto" });
      });
    }
  }

  navClose.addEventListener("click", (e) => {
    e.preventDefault();
    closeNav({ preserveScroll: true });
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => closeNav({ preserveScroll: false }))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav({ preserveScroll: true });
  });
}

const recentExtraViewport = document.querySelector(".recent-extra-carousel__viewport");
const recentExtraPrev = document.querySelector(".recent-extra-carousel__arrow--left");
const recentExtraNext = document.querySelector(".recent-extra-carousel__arrow--right");

if (recentExtraViewport && recentExtraPrev && recentExtraNext) {
  let rafId = null;
  let currentX = recentExtraViewport.scrollLeft;
  let targetX = currentX;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const maxScroll = () =>
    Math.max(0, recentExtraViewport.scrollWidth - recentExtraViewport.clientWidth);

  const ensureTick = () => {
    if (!rafId) rafId = window.requestAnimationFrame(tick);
  };

  const tick = () => {
    const diff = targetX - currentX;
    currentX += diff * 0.16;
    recentExtraViewport.scrollLeft = currentX;

    if (Math.abs(diff) > 0.35) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      currentX = targetX;
      recentExtraViewport.scrollLeft = currentX;
      rafId = null;
    }
  };

  const pushDelta = (delta) => {
    targetX = clamp(targetX + delta, 0, maxScroll());
    ensureTick();
  };

  const getStep = () => {
    const firstItem = recentExtraViewport.querySelector(".recent-extra-carousel__item");
    const track = recentExtraViewport.querySelector(".recent-extra-carousel__track");
    if (!firstItem || !track) return 334;
    const gap = parseFloat(window.getComputedStyle(track).gap || "14");
    return firstItem.getBoundingClientRect().width + gap;
  };

  recentExtraPrev.addEventListener("click", () => {
    pushDelta(-getStep() * 2);
  });

  recentExtraNext.addEventListener("click", () => {
    pushDelta(getStep() * 2);
  });

  recentExtraViewport.addEventListener(
    "wheel",
    (e) => {
      const mostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.1;
      if (!mostlyHorizontal || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      pushDelta(e.deltaX * 0.68);
    },
    { passive: false }
  );

  recentExtraViewport.addEventListener("scroll", () => {
    if (rafId) return;
    currentX = recentExtraViewport.scrollLeft;
    targetX = currentX;
  });

  window.addEventListener("resize", () => {
    targetX = clamp(targetX, 0, maxScroll());
    currentX = clamp(currentX, 0, maxScroll());
    recentExtraViewport.scrollLeft = currentX;
  });
}

const heroSquareViewport = document.querySelector(".hero-square-carousel__viewport");
const heroSquarePrev = document.querySelector(".hero-square-carousel__arrow--left");
const heroSquareNext = document.querySelector(".hero-square-carousel__arrow--right");

if (heroSquareViewport && heroSquarePrev && heroSquareNext) {
  const heroSquareTrack = heroSquareViewport.querySelector(".hero-square-carousel__track");
  if (heroSquareTrack && !heroSquareTrack.dataset.loopReady) {
    const originals = Array.from(heroSquareTrack.children);
    originals.forEach((item) => heroSquareTrack.appendChild(item.cloneNode(true)));
    heroSquareTrack.dataset.loopReady = "true";
  }

  let rafId = null;
  let currentX = heroSquareViewport.scrollLeft;
  let targetX = currentX;
  let autoSlideTimer = null;
  const slideLerp = 0.085;

  const getLoopWidth = () => {
    if (!heroSquareTrack) return 0;
    return Math.max(0, heroSquareTrack.scrollWidth / 2);
  };

  const normalizeLoopPosition = () => {
    const loopWidth = getLoopWidth();
    if (loopWidth <= 1) return;

    while (currentX >= loopWidth) {
      currentX -= loopWidth;
      targetX -= loopWidth;
    }
    while (currentX < 0) {
      currentX += loopWidth;
      targetX += loopWidth;
    }
  };

  const ensureTick = () => {
    if (!rafId) rafId = window.requestAnimationFrame(tick);
  };

  const syncArrowState = () => {
    // Infinite loop mode keeps both controls available.
    heroSquarePrev.disabled = false;
    heroSquareNext.disabled = false;
  };

  const tick = () => {
    const diff = targetX - currentX;
    currentX += diff * slideLerp;
    normalizeLoopPosition();
    heroSquareViewport.scrollLeft = currentX;
    syncArrowState();

    if (Math.abs(diff) > 0.35) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      currentX = targetX;
      normalizeLoopPosition();
      heroSquareViewport.scrollLeft = currentX;
      syncArrowState();
      rafId = null;
    }
  };

  const pushDelta = (delta) => {
    targetX += delta;
    ensureTick();
  };

  const getStep = () => {
    const firstItem = heroSquareViewport.querySelector(".hero-square-carousel__item");
    const track = heroSquareViewport.querySelector(".hero-square-carousel__track");
    if (!firstItem || !track) return 260;
    const gap = parseFloat(window.getComputedStyle(track).gap || "14");
    return firstItem.getBoundingClientRect().width + gap;
  };

  heroSquarePrev.addEventListener("click", () => {
    pushDelta(-getStep() * 2);
  });

  heroSquareNext.addEventListener("click", () => {
    pushDelta(getStep() * 2);
  });

  heroSquareViewport.addEventListener(
    "wheel",
    (e) => {
      const mostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.1;
      if (!mostlyHorizontal || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      pushDelta(e.deltaX * 0.75);
    },
    { passive: false }
  );

  heroSquareViewport.addEventListener("scroll", () => {
    if (rafId) return;
    currentX = heroSquareViewport.scrollLeft;
    targetX = currentX;
    normalizeLoopPosition();
    heroSquareViewport.scrollLeft = currentX;
    syncArrowState();
  });

  window.addEventListener("resize", () => {
    currentX = heroSquareViewport.scrollLeft;
    targetX = currentX;
    normalizeLoopPosition();
    heroSquareViewport.scrollLeft = currentX;
    syncArrowState();
  });

  const autoAdvanceOneStep = () => {
    if (document.hidden) return;
    const loopWidth = getLoopWidth();
    if (loopWidth <= 1) return;
    const step = getStep();
    if (step <= 1) return;
    pushDelta(step);
  };

  autoSlideTimer = window.setInterval(autoAdvanceOneStep, 6000);
  window.addEventListener("pagehide", () => {
    if (autoSlideTimer) {
      window.clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  });

  syncArrowState();
}

const topbarHomeLink = document.querySelector('.topbar__sig a[href="index.html"]');
const topbarResumeLink = document.querySelector('.topbar__nav a[href="#contact"]');
if (topbarHomeLink) {
  topbarHomeLink.addEventListener("click", () => {
    window.sessionStorage.removeItem("valerieweb.collectionMode");
  });
}

const preRectHeader = document.querySelector(".contact__pre-rect-header");
const preRectClose = document.querySelector(".contact__pre-rect-close");
const preRectSectionToggle = document.querySelector(".contact__pre-rect");
const preRectResumeCta = document.querySelector(".contact__pre-rect-resume-cta");
let focalShiftTimer = null;
let toggleSpeedTimer = null;
let lastToggleAt = 0;
let resumeHideSyncTimer = null;

const isPreRectCollapsedOrClosing = () =>
  !!(
    preRectSectionToggle &&
    (
      preRectSectionToggle.classList.contains("is-collapsed") ||
      preRectSectionToggle.classList.contains("is-closing")
    )
  );

const getAdaptiveToggleDuration = () => {
  const now = performance.now();
  const gap = lastToggleAt ? now - lastToggleAt : Infinity;
  lastToggleAt = now;
  // Slower rollout while keeping fast repeated toggles smooth.
  if (gap < 170) return 0.62;
  if (gap < 270) return 0.74;
  if (gap < 420) return 0.88;
  if (gap < 620) return 0.98;
  return 1.08;
};

const applyAdaptiveToggleDuration = (container) => {
  if (!container) return;
  const dur = getAdaptiveToggleDuration();
  container.style.setProperty("--toggle-dur", `${dur}s`);
  if (toggleSpeedTimer) window.clearTimeout(toggleSpeedTimer);
  toggleSpeedTimer = window.setTimeout(() => {
    container.style.setProperty("--toggle-dur", "1.08s");
    toggleSpeedTimer = null;
  }, Math.max(420, Math.round(dur * 1000) + 180));
};

const applyQuickHideDuration = (container) => {
  if (!container) return;
  const dur = 0.42;
  container.style.setProperty("--toggle-dur", `${dur}s`);
  if (toggleSpeedTimer) window.clearTimeout(toggleSpeedTimer);
  toggleSpeedTimer = window.setTimeout(() => {
    container.style.setProperty("--toggle-dur", "1.08s");
    toggleSpeedTimer = null;
  }, Math.max(420, Math.round(dur * 1000) + 180));
};

const clearResumeHideSyncWindow = (container) => {
  if (!container) return;
  container.classList.remove("is-resume-hiding");
  if (resumeHideSyncTimer) {
    window.clearTimeout(resumeHideSyncTimer);
    resumeHideSyncTimer = null;
  }
};

const startResumeHideSyncWindow = (container) => {
  if (!container) return;
  clearResumeHideSyncWindow(container);
  container.classList.add("is-resume-hiding");
  const raw = parseFloat(
    window.getComputedStyle(container).getPropertyValue("--toggle-dur")
  );
  const ms = (Number.isFinite(raw) && raw > 0 ? raw * 1000 : 420) + 70;
  resumeHideSyncTimer = window.setTimeout(() => {
    container.classList.remove("is-resume-hiding");
    resumeHideSyncTimer = null;
  }, ms);
};

const triggerFocalShift = (container) => {
  if (!container) return;
  // Force restart so rapid toggles always retrigger the focal-shift state.
  container.classList.remove("is-focal-shifting");
  void container.offsetWidth;
  container.classList.add("is-focal-shifting");
  if (focalShiftTimer) window.clearTimeout(focalShiftTimer);
  focalShiftTimer = window.setTimeout(() => {
    container.classList.remove("is-focal-shifting");
    focalShiftTimer = null;
  }, 900);
};

if (preRectHeader && preRectClose && preRectSectionToggle) {
  preRectSectionToggle.dataset.oliveCycleStep = "0"; // 0=hide, 1=show, 2=close

  const syncResumeHiddenState = (
    hidden,
    {
      skipAdaptiveDuration = false,
      skipFocalShift = false,
      skipHorizontalSlide = false,
      forceQuickHide = false
    } = {}
  ) => {
    if (hidden && forceQuickHide) {
      applyQuickHideDuration(preRectSectionToggle);
    } else if (!skipAdaptiveDuration) {
      applyAdaptiveToggleDuration(preRectSectionToggle);
    }
    const wasHidden = preRectSectionToggle.classList.contains("resume-hidden");
    if (!skipFocalShift && wasHidden !== hidden) {
      triggerFocalShift(preRectSectionToggle);
    }
    if (skipHorizontalSlide && wasHidden !== hidden) {
      preRectSectionToggle.classList.add("is-resume-slide-suppressed");
    }
    if (hidden && wasHidden !== hidden) {
      startResumeHideSyncWindow(preRectSectionToggle);
    } else if (!hidden) {
      clearResumeHideSyncWindow(preRectSectionToggle);
    }
    preRectSectionToggle.classList.toggle("resume-hidden", hidden);
    if (skipHorizontalSlide && wasHidden !== hidden) {
      void preRectSectionToggle.offsetWidth;
      preRectSectionToggle.classList.remove("is-resume-slide-suppressed");
    }
    const localResumeToggle = document.querySelector(".contact__resume-toggle");
    if (localResumeToggle) {
      localResumeToggle.textContent = hidden ? "›" : "‹";
      localResumeToggle.setAttribute("aria-expanded", String(!hidden));
      localResumeToggle.setAttribute("aria-label", hidden ? "Show resume" : "Hide resume");
    }
  };

  let preRectToggleTimer = null;
  const clearPreRectTimers = () => {
    if (preRectToggleTimer) {
      window.clearTimeout(preRectToggleTimer);
      preRectToggleTimer = null;
    }
  };

  const getCurrentToggleMs = () => {
    const raw = parseFloat(
      window.getComputedStyle(preRectSectionToggle).getPropertyValue("--toggle-dur")
    );
    if (Number.isFinite(raw) && raw > 0) return raw * 1000;
    return 780;
  };

  const syncPreRectCollapseState = (collapsed, immediate = false) => {
    if (immediate) {
      clearPreRectTimers();
      clearResumeHideSyncWindow(preRectSectionToggle);
      preRectSectionToggle.classList.remove("is-closing", "is-opening");
      preRectSectionToggle.classList.toggle("is-collapsed", collapsed);
      if (collapsed) {
        preRectSectionToggle.classList.remove("is-focal-shifting");
        preRectSectionToggle.dataset.oliveCycleStep = "0";
      }
      preRectClose.textContent = collapsed ? "▴" : "▾";
      preRectClose.setAttribute(
        "aria-label",
        collapsed ? "Show resume and slideshow" : "Hide resume and slideshow"
      );
      preRectClose.setAttribute("aria-expanded", String(!collapsed));
      return;
    }

    applyAdaptiveToggleDuration(preRectSectionToggle);
    const toggleMs = getCurrentToggleMs();
    const cleanupMs = Math.round(toggleMs + 60);

    clearPreRectTimers();

    // Never carry focal-shift into section open/close cycles.
    preRectSectionToggle.classList.remove("is-focal-shifting");
    clearResumeHideSyncWindow(preRectSectionToggle);

    // Ensure left panel visibility is restored before opening animation starts,
    // so the right image doesn't visibly shift during roll-out.
    if (!collapsed) {
      syncResumeHiddenState(false, {
        skipAdaptiveDuration: true,
        skipFocalShift: true,
        skipHorizontalSlide: true
      });
      preRectSectionToggle.dataset.oliveCycleStep = "0";
    }

    // Close with an immediate roll-up to keep the motion smooth.
    if (collapsed) {
      preRectSectionToggle.classList.remove("is-collapsed");
      preRectSectionToggle.classList.add("is-closing");
      preRectSectionToggle.classList.remove("is-opening");
    } else {
      preRectSectionToggle.classList.remove("is-collapsed", "is-closing");
      preRectSectionToggle.classList.add("is-opening");
    }

    if (collapsed) preRectSectionToggle.dataset.oliveCycleStep = "0";
    preRectToggleTimer = window.setTimeout(() => {
      // Reset hidden/focal state after close completes so each reopen starts from baseline,
      // without flashing the left panel during the close motion.
      if (collapsed) {
        if (focalShiftTimer) {
          window.clearTimeout(focalShiftTimer);
          focalShiftTimer = null;
        }
        // Finalize close state in the same frame to avoid a style-gap jolt.
        preRectSectionToggle.classList.add("is-collapsed");
        preRectSectionToggle.classList.remove("is-focal-shifting");
      }
      preRectSectionToggle.classList.remove("is-closing");
      preRectSectionToggle.classList.remove("is-opening");
      preRectToggleTimer = null;
    }, cleanupMs);

    preRectClose.textContent = collapsed ? "▴" : "▾";
    preRectClose.setAttribute(
      "aria-label",
      collapsed ? "Show resume and slideshow" : "Hide resume and slideshow"
    );
    preRectClose.setAttribute("aria-expanded", String(!collapsed));

  };

  preRectClose.addEventListener("click", () => {
    const shouldCollapse = !isPreRectCollapsedOrClosing();
    syncPreRectCollapseState(shouldCollapse);
  });

  if (preRectResumeCta) {
    preRectResumeCta.addEventListener("click", () => {
      syncPreRectCollapseState(false);
    });
  }

  preRectHeader.addEventListener("click", (e) => {
    if (
      e.target.closest(".contact__pre-rect-link") ||
      e.target.closest(".contact__pre-rect-close") ||
      e.target.closest(".contact__pre-rect-resume-cta")
    ) {
      return;
    }
    const isCollapsed = isPreRectCollapsedOrClosing();
    if (isCollapsed) {
      // If bar is collapsed, clicking the bar opens it.
      syncPreRectCollapseState(false);
      return;
    }

    const isLeftHidden = preRectSectionToggle.classList.contains("resume-hidden");
    if (!isLeftHidden) {
      // 2nd click: hide left panel.
      syncResumeHiddenState(true, { skipFocalShift: true, forceQuickHide: true });
      preRectSectionToggle.dataset.oliveCycleStep = "1";
      return;
    }

    // 3rd click: close the whole section.
    syncPreRectCollapseState(true);
    preRectSectionToggle.dataset.oliveCycleStep = "0";
  });

  // Default behavior: always closed on page load, with no animation.
  syncPreRectCollapseState(true, true);
}

const topbar = document.getElementById("topbar");
const mainHeroSplit = document.querySelector(
  ".split:not(.split--secondary):not(.split--about):not(.split--about-full):not(.split--tertiary)"
);
const preRect = document.querySelector(".contact__pre-rect");
const heroTitle = document.getElementById("heroTitle");

if (topbar && mainHeroSplit && heroTitle) {
  const heroTitleLink = heroTitle.querySelector(".text-block__title-home");

  if (heroTitleLink) {
    const floatingTitle = document.createElement("a");
    floatingTitle.className = "hero-title-float";
    floatingTitle.href = heroTitleLink.getAttribute("href") || "index.html";
    floatingTitle.innerHTML = heroTitleLink.innerHTML;
    floatingTitle.setAttribute("aria-label", "Go to main page");
    floatingTitle.setAttribute("aria-hidden", "true");
    document.body.appendChild(floatingTitle);
    heroTitle.classList.add("is-scroll-proxy-source");

    let startTop = 0;
    let sourceAbsTop = 0;
    let dockTop = 0;
    let endScale = 0.2;
    let dockScrollY = 1;
    let ticking = false;
    let resizeRaf = 0;
    const verticalStretch = 1.04;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const measure = () => {
      floatingTitle.style.visibility = "hidden";
      floatingTitle.style.transform = "translate3d(-50%, 0px, 0) scale(1)";

      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const sourceRect = heroTitle.getBoundingClientRect();
      const navRect = topbar.getBoundingClientRect();
      const sourceWidth = Math.max(sourceRect.width, 1);
      const desiredDockWidth = Math.min(window.innerWidth * 0.24, 250);

      endScale = clamp(desiredDockWidth / sourceWidth, 0.12, 0.34);
      startTop = sourceRect.top;
      sourceAbsTop = sourceRect.top + currentScrollY;
      {
        const dockDisplayTop = navRect.top + (navRect.height - sourceRect.height * endScale) * 0.5;
        // Bottom-origin scale compensation so title sits cleanly inside nav bar.
        dockTop = dockDisplayTop - sourceRect.height * (1 - endScale);
      }
      dockScrollY = Math.max(1, sourceAbsTop - dockTop);

      floatingTitle.style.visibility = "visible";
    };

    const remeasureAndSyncFloatingTitle = () => {
      measure();
      requestSyncFloatingTitle();
    };

    const syncFloatingTitle = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const scaleP = clamp(currentScrollY / dockScrollY, 0, 1);
      const sourceY = sourceAbsTop - currentScrollY;
      const y = Math.max(dockTop, sourceY);
      const scale = 1 + (endScale - 1) * scaleP;
      const scaleY = scale * verticalStretch;

      floatingTitle.style.transform = `translate3d(-50%, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}, ${scaleY.toFixed(4)})`;
      floatingTitle.style.opacity = "1";
      const wantsDarkText = topbar.classList.contains("is-solid") || scaleP >= 0.9;
      floatingTitle.classList.toggle("is-dark", wantsDarkText);
      floatingTitle.classList.toggle("is-hidden", !!(nav && nav.classList.contains("is-open")));
      ticking = false;
    };

    const requestSyncFloatingTitle = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncFloatingTitle);
    };

    remeasureAndSyncFloatingTitle();

    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(() => {
        remeasureAndSyncFloatingTitle();
      });
    }

    window.addEventListener("scroll", requestSyncFloatingTitle, { passive: true });
    window.addEventListener("load", () => {
      window.requestAnimationFrame(remeasureAndSyncFloatingTitle);
    });
    window.addEventListener("pageshow", () => {
      window.requestAnimationFrame(remeasureAndSyncFloatingTitle);
    });
    window.addEventListener("resize", () => {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        remeasureAndSyncFloatingTitle();
      });
    });
  }
}

if (topbar && mainHeroSplit) {
  let heroNavTicking = false;
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let prevHasPassedHero = topbar.classList.contains("is-solid");
  let fadeoutUpTimer = null;
  const fadeoutUpClass = "topbar-fadeout-up";

  document.body.classList.remove(fadeoutUpClass);

  const syncTopbarStyleFromHero = () => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const navHeight = topbar.offsetHeight || 0;
    const heroRect = mainHeroSplit.getBoundingClientRect();
    const hasPassedHero = heroRect.bottom <= navHeight;
    const scrollingUp = currentScrollY < lastScrollY - 0.5;
    const becameTransparentOnUp = prevHasPassedHero && !hasPassedHero && scrollingUp;

    topbar.classList.toggle("is-solid", hasPassedHero);

    if (becameTransparentOnUp) {
      document.body.classList.add(fadeoutUpClass);
      if (fadeoutUpTimer) window.clearTimeout(fadeoutUpTimer);
      fadeoutUpTimer = window.setTimeout(() => {
        document.body.classList.remove(fadeoutUpClass);
        fadeoutUpTimer = null;
      }, 560);
    } else if (hasPassedHero || !scrollingUp) {
      // Never stretch while scrolling down into the white nav bar.
      if (fadeoutUpTimer) {
        window.clearTimeout(fadeoutUpTimer);
        fadeoutUpTimer = null;
      }
      document.body.classList.remove(fadeoutUpClass);
    }

    if (Math.abs(currentScrollY - lastScrollY) > 0.5) {
      lastScrollY = currentScrollY;
    }
    prevHasPassedHero = hasPassedHero;
    heroNavTicking = false;
  };

  const requestHeroNavSync = () => {
    if (heroNavTicking) return;
    heroNavTicking = true;
    window.requestAnimationFrame(syncTopbarStyleFromHero);
  };

  window.addEventListener("scroll", requestHeroNavSync, { passive: true });
  window.addEventListener("resize", requestHeroNavSync);
  requestHeroNavSync();
}

if (topbar && preRect) {
  let ticking = false;
  let isLocked = false;

  const syncTopbarAndOliveBar = () => {
    const navHeight = topbar.offsetHeight || 0;
    const rect = preRect.getBoundingClientRect();
    const headerHeight = preRectHeader ? preRectHeader.offsetHeight : navHeight;
    const headerClosed = !!(preRectHeader && preRectHeader.classList.contains("is-closed"));

    const shouldLockTopbar = rect.top <= navHeight;
    if (shouldLockTopbar && !isLocked) {
      document.body.style.setProperty("--topbar-lock-y", `${window.scrollY}px`);
      document.body.classList.add("topbar-static-lock");
      isLocked = true;
    } else if (!shouldLockTopbar && isLocked) {
      document.body.classList.remove("topbar-static-lock");
      isLocked = false;
    }

    const shouldFollow = !headerClosed && rect.top <= 0 && rect.bottom > headerHeight;
    document.body.classList.toggle("olive-follow-active", shouldFollow);

    ticking = false;
  };

  const requestSync = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(syncTopbarAndOliveBar);
  };

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  requestSync();
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
    // Keep hero split visuals unchanged; portfolio mode should only affect collection area.
    document.body.classList.remove("is-portfolio-view");
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
      source === "init" || mode === "mode-recent" || mode === "mode-portfolio";
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
  const maxParallaxTravel = 110;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const computeTargetParallaxY = () => {
    const rect = contactWrap.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    const imageCenter = rect.top + rect.height * 0.5;
    const delta = viewportCenter - imageCenter;
    const next = delta * (1 - contactParallaxFactor);
    return clamp(next, -maxParallaxTravel, maxParallaxTravel);
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

const resumeSheet = document.querySelector(".contact__resume-sheet");
const resumeCanvas = document.querySelector(".contact__resume-canvas");
const resumeDownload = document.querySelector(".contact__resume-download");
if (resumeSheet && resumeCanvas) {
  const panResumeCanvasWithWheel = (e) => {
    const canScrollX = resumeCanvas.scrollWidth > resumeCanvas.clientWidth + 1;
    const canScrollY = resumeCanvas.scrollHeight > resumeCanvas.clientHeight + 1;
    if (!canScrollX && !canScrollY) return;
    const maxX = Math.max(0, resumeCanvas.scrollWidth - resumeCanvas.clientWidth);
    const prevX = resumeCanvas.scrollLeft;
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    const verticalOrMixedIntent = absY > absX * 0.7;

    // Let browser handle vertical (and mixed) scrolling natively for smoother
    // chaining from resume panel into full-page scroll near top/bottom.
    if (verticalOrMixedIntent) return;

    let consumed = false;
    const horizontalIntent = absX > absY * 1.1;

    if (canScrollX && absX > 0.01 && horizontalIntent) {
      const nextX = Math.min(maxX, Math.max(0, prevX + e.deltaX * 1.15));
      if (nextX !== prevX) {
        resumeCanvas.scrollLeft = nextX;
        consumed = true;
      }
    }

    // Only trap scrolling when resume panel actually consumed movement.
    // At top/bottom bounds, let the page continue scrolling naturally.
    if (consumed) e.preventDefault();
  };

  resumeCanvas.addEventListener(
    "wheel",
    panResumeCanvasWithWheel,
    { passive: false }
  );

  resumeSheet.addEventListener(
    "wheel",
    panResumeCanvasWithWheel,
    { passive: false }
  );

  if (resumeDownload) {
    const syncResumeDownloadVisibility = () => {
      const canScrollY = resumeCanvas.scrollHeight > resumeCanvas.clientHeight + 4;
      const maxY = Math.max(0, resumeCanvas.scrollHeight - resumeCanvas.clientHeight);
      const atBottom = maxY > 0 && resumeCanvas.scrollTop >= maxY - 2;
      const shouldShow = canScrollY && atBottom;
      resumeDownload.classList.toggle("is-visible", shouldShow);
    };

    resumeCanvas.addEventListener("scroll", syncResumeDownloadVisibility, { passive: true });
    window.addEventListener("resize", syncResumeDownloadVisibility);
    syncResumeDownloadVisibility();
  }
}

const resumeToggle = document.querySelector(".contact__resume-toggle");
const preRectContainer = document.querySelector(".contact__pre-rect");
const splitRightPortfolioLink = document.querySelector(".contact__split-right-title-link");

if (resumeToggle && preRectContainer) {
  resumeToggle.addEventListener("click", () => {
    const wasHidden = preRectContainer.classList.contains("resume-hidden");
    const hidden = !wasHidden;
    if (hidden) {
      applyQuickHideDuration(preRectContainer);
      startResumeHideSyncWindow(preRectContainer);
    } else {
      applyAdaptiveToggleDuration(preRectContainer);
      clearResumeHideSyncWindow(preRectContainer);
    }
    triggerFocalShift(preRectContainer);
    preRectContainer.classList.toggle("resume-hidden", hidden);
    preRectContainer.dataset.oliveCycleStep = hidden ? "1" : "0";
    resumeToggle.textContent = hidden ? "›" : "‹";
    resumeToggle.setAttribute("aria-expanded", String(!hidden));
    resumeToggle.setAttribute("aria-label", hidden ? "Show resume" : "Hide resume");
  });
}

const ensureResumeIsOpen = () => {
  // Always open via the same olive-bar control path so transition rules remain consistent.
  if (isPreRectCollapsedOrClosing()) {
    if (preRectClose) preRectClose.click();
    return;
  }

  // If already open, ensure left resume panel is visible.
  if (preRectContainer && preRectContainer.classList.contains("resume-hidden")) {
    preRectContainer.classList.remove("resume-hidden");
  }
  if (resumeToggle) {
    resumeToggle.textContent = "‹";
    resumeToggle.setAttribute("aria-expanded", "true");
    resumeToggle.setAttribute("aria-label", "Hide resume");
  }
};

const scrollContactToTopThen = (onDone) => {
  if (!contactSection) {
    onDone();
    return;
  }

  const navHeight = topbar ? topbar.offsetHeight || 0 : 0;
  const targetY = Math.max(
    0,
    window.scrollY + contactSection.getBoundingClientRect().top - navHeight
  );
  const distance = Math.abs(window.scrollY - targetY);

  if (distance < 2) {
    onDone();
    return;
  }

  let finished = false;
  let fallbackTimer = null;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.removeEventListener("scroll", syncOnScroll);
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    onDone();
  };

  const syncOnScroll = () => {
    if (Math.abs(window.scrollY - targetY) <= 2) finish();
  };

  window.addEventListener("scroll", syncOnScroll, { passive: true });

  const estimateMs = Math.min(1300, Math.max(420, Math.round(distance * 0.65)));
  fallbackTimer = window.setTimeout(finish, estimateMs + 180);

  window.scrollTo({ top: targetY, behavior: "smooth" });
};

if (topbarResumeLink) {
  topbarResumeLink.addEventListener("click", (e) => {
    e.preventDefault();
    scrollContactToTopThen(() => {
      if (window.location.hash !== "#contact") {
        window.history.replaceState(null, "", "#contact");
      }
      ensureResumeIsOpen();
    });
  });
}

if (splitRightPortfolioLink) {
  splitRightPortfolioLink.addEventListener("click", (e) => {
    const canUseLocalCollectionToggle = !!(viewPortfolioToggle && collectionSection);
    if (!canUseLocalCollectionToggle) return;
    e.preventDefault();
    if (viewPortfolioToggle) {
      viewPortfolioToggle.click();
    }
    window.sessionStorage.setItem("valerieweb.collectionMode", "mode-portfolio");
    if (window.location.hash !== "#collection") {
      window.location.hash = "collection";
    } else if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: "auto", block: "start" });
    }
  });
}

const heroFollowImage = document.querySelector(".hero-follow-image");
if (heroFollowImage) {
  const revealHeroFollowImage = () => {
    heroFollowImage.classList.add("is-visible");
  };

  if ("IntersectionObserver" in window) {
    const heroFollowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealHeroFollowImage();
          heroFollowObserver.disconnect();
        });
      },
      {
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    heroFollowObserver.observe(heroFollowImage);
  } else {
    revealHeroFollowImage();
  }
}
