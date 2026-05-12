(function () {
  const clearFouc = () => {
    document.documentElement.classList.remove("hero-fouc-pending");
    const float = document.querySelector(".hero-title-float");
    if (float) float.classList.add("is-layout-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(clearFouc));
    });
  } else {
    window.requestAnimationFrame(() => window.requestAnimationFrame(clearFouc));
  }
})();
