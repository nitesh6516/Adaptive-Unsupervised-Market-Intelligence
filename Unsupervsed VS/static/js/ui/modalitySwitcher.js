const copy = {
  text: ["Text synthesis", "Ask, paste, or stream text into the central neural field."],
  image: ["Image prism", "Drop visuals into the portal and inspect floating annotations."],
  audio: ["Audio waveform", "Record or upload sound and watch the orb pulse with energy."],
  video: ["Video projection", "Send footage through the holographic timeline and keyframe deck."]
};

export function initModalitySwitcher(store) {
  const buttons = [...document.querySelectorAll(".modality-button")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const prompt = document.querySelector("#prompt-input");
  const title = document.querySelector("#orb-title");
  const body = document.querySelector("#orb-copy");

  buttons.forEach((button) => {
    button.addEventListener("click", () => store.set({ mode: button.dataset.mode }));
  });

  store.subscribe(({ mode }) => {
    buttons.forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      if (active && window.gsap) {
        window.gsap.fromTo(button, { y: 6, opacity: 0.75 }, { y: 0, opacity: 1, duration: 0.22 });
      }
    });
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === mode));
    title.textContent = copy[mode][0];
    body.textContent = copy[mode][1];
    prompt.placeholder = {
      text: "Ask AETHER to synthesize, explain, transform, or generate...",
      image: "Describe what to inspect in the uploaded image...",
      audio: "Describe transcription, emotion, or waveform analysis goals...",
      video: "Describe scene analysis, keyframes, or timeline edits..."
    }[mode];
  });
}
