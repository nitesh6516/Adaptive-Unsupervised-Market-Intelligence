export function initGlassInteractions() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      if (Math.abs(x) < rect.width / 2 + 20 && Math.abs(y) < rect.height / 2 + 20) {
        element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      }
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  const zone = document.querySelector("#drop-zone");
  zone.addEventListener("pointermove", (event) => {
    const rect = zone.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    zone.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
  });
  zone.addEventListener("pointerleave", () => {
    zone.style.transform = "";
  });
}

export function notify(message, variant = "success") {
  const stack = document.querySelector("#notification-stack");
  const note = document.createElement("div");
  note.className = "notification";
  note.style.borderColor = variant === "error" ? "var(--error)" : "rgba(var(--primary-rgb), 0.42)";
  note.textContent = message;
  stack.append(note);
  if (window.gsap) {
    window.gsap.fromTo(note, { opacity: 0, x: 60, rotateY: -90 }, { opacity: 1, x: 0, rotateY: 0, duration: 0.32, ease: "power3.out" });
    window.gsap.to(note, { opacity: 0, x: 40, delay: 3.2, duration: 0.24, onComplete: () => note.remove() });
  } else {
    setTimeout(() => note.remove(), 3500);
  }
}

export function setLoading(active) {
  document.querySelector("#loading-hud").hidden = !active;
}
