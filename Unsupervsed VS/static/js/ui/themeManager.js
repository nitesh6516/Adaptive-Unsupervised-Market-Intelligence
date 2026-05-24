export function initThemeManager(store) {
  const root = document.documentElement;
  const button = document.querySelector("#theme-toggle");
  const saved = localStorage.getItem("aether-theme") || root.dataset.theme || "dark";
  setTheme(saved, false);

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next, true);
  });

  async function setTheme(theme, persist) {
    root.dataset.theme = theme;
    localStorage.setItem("aether-theme", theme);
    store.set({ theme });
    const icon = button.querySelector("i");
    icon.setAttribute("data-lucide", theme === "dark" ? "moon" : "sun");
    window.lucide?.createIcons();
    if (window.gsap) {
      window.gsap.fromTo(button, { rotateY: -90 }, { rotateY: 0, duration: 0.24, ease: "power2.out" });
      window.gsap.fromTo(".noise-layer", { opacity: 0.02 }, { opacity: theme === "dark" ? 0.1 : 0.05, duration: 0.09 });
    }
    if (persist) {
      fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
      }).catch(() => {});
    }
  }
}
