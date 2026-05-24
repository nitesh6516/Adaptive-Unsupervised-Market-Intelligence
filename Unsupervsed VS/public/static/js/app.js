import { initThemeManager } from "./ui/themeManager.js";
import { initModalitySwitcher } from "./ui/modalitySwitcher.js";
import { initGlassInteractions, notify, setLoading } from "./ui/glassmorphism.js";
import { initAudioReactive } from "./effects/audioReactive.js";

const MODES = ["text", "image", "audio", "video"];

function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    }
  };
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function appendTerminal(html, mode = "line") {
  const output = document.querySelector("#terminal-output");
  if (!output) return;
  const row = document.createElement("p");
  row.className = mode;
  row.innerHTML = html;
  output.append(row);
  output.scrollTop = output.scrollHeight;
}

function streamText(prompt) {
  const source = new EventSource(`/api/stream?prompt=${encodeURIComponent(prompt || "AETHER")}`);
  appendTerminal(`<span class="prompt">stream:</span>`, "stream-line");
  const current = document.querySelector("#terminal-output p:last-child");
  source.addEventListener("token", (event) => {
    const data = JSON.parse(event.data);
    const token = document.createElement("span");
    token.className = "stream-token";
    token.textContent = data.token;
    current.append(token);
    if (window.gsap) {
      window.gsap.to(token, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" });
    } else {
      token.style.opacity = 1;
      token.style.transform = "none";
    }
  });
  source.addEventListener("done", () => source.close());
  source.onerror = () => {
    source.close();
    notify("Stream closed by the browser.", "error");
  };
}

function drawWaveform(canvas, energy = 0.45) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < width; x += 5) {
    const t = x / width;
    const y = height / 2 + Math.sin(t * Math.PI * 12) * Math.sin(t * Math.PI * 2) * height * energy * 0.34;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

async function analyzeFileInWorker(file) {
  if (!window.Worker) return { name: file.name, size: file.size, type: file.type };
  return new Promise((resolve) => {
    const worker = new Worker("/static/js/workers/analyzer.worker.js", { type: "module" });
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = () => {
      resolve({ name: file.name, size: file.size, type: file.type });
      worker.terminate();
    };
    worker.postMessage({ file });
  });
}

function updateMediaPreview(file, uploadResponse) {
  const url = uploadResponse?.url || URL.createObjectURL(file);
  if (file.type.startsWith("image/")) {
    const carousel = document.querySelector("#image-carousel");
    const figure = document.createElement("figure");
    figure.className = "carousel-card";
    figure.innerHTML = `<img alt="Uploaded preview" src="${url}"><figcaption>${file.name}</figcaption>`;
    carousel.prepend(figure);
    while (carousel.children.length > 3) carousel.lastElementChild.remove();
  }
  if (file.type.startsWith("video/")) {
    const video = document.querySelector("#video-preview");
    video.src = url;
    document.querySelector("#keyframe-strip").innerHTML = "<span></span><span></span><span></span><span></span>";
  }
}

async function uploadFile(file, modality, sceneApi, store) {
  const metadata = await analyzeFileInWorker(file);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", modality);
  setLoading(true);
  try {
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed");
    updateMediaPreview(file, data);
    sceneApi?.burst?.();
    notify(`${metadata.kind || modality} uploaded: ${file.name}`, "success");
    appendTerminal(`<span class="prompt">upload:</span> ${file.name} staged as ${data.type}, ${Math.round(file.size / 1024)} KB.`);
    store.set({ lastUpload: data });
    return data;
  } catch (error) {
    notify(error.message, "error");
    throw error;
  } finally {
    setLoading(false);
  }
}

async function submitMultimodal(store, sceneApi) {
  const state = store.get();
  const prompt = document.querySelector("#prompt-input").value.trim();
  setLoading(true);
  const started = performance.now();
  try {
    const response = await fetch("/api/multimodal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: state.mode,
        payload: {
          prompt,
          upload: state.lastUpload || null
        },
        room: state.room
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    document.querySelector("#latency-readout").textContent = Math.max(8, Math.round(performance.now() - started));
    document.querySelector("#signal-readout").textContent = Math.round(data.confidence * 100);
    appendTerminal(`<span class="prompt">${data.type}:</span> ${data.summary}`);
    renderAnnotations(data.annotations);
    streamText(prompt || data.type);
    sceneApi?.setMode?.(data.type);
    sceneApi?.burst?.();
    notify("Analysis complete.", "success");
  } catch (error) {
    notify(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function renderAnnotations(annotations = []) {
  const stack = document.querySelector("#annotation-stack");
  if (!stack) return;
  stack.innerHTML = "";
  annotations.forEach((annotation) => {
    const card = document.createElement("article");
    card.className = "annotation-card";
    card.innerHTML = `<strong>${annotation.title}</strong><p>${annotation.body}</p>`;
    stack.append(card);
    if (window.gsap) {
      window.gsap.from(card, { opacity: 0, rotateY: -55, y: 18, duration: 0.38, ease: "power3.out" });
    }
  });
}

function setupSocket(store) {
  const enabled = document.querySelector("#app-shell")?.dataset.socketio === "true";
  if (!enabled || typeof window.io !== "function") return null;
  const socket = window.io();
  window.socket = socket;
  const pill = document.querySelector("#connection-pill");
  socket.on("connect", () => {
    pill.textContent = "live room";
    socket.emit("room:join", { room: store.get().room });
  });
  socket.on("analysis:complete", (data) => {
    appendTerminal(`<span class="prompt">collab:</span> ${data.summary}`);
  });
  window.addEventListener("pointermove", (event) => {
    const { room } = store.get();
    socket.emit("cursor:move", {
      room,
      x: Math.round((event.clientX / window.innerWidth) * 1000) / 1000,
      y: Math.round((event.clientY / window.innerHeight) * 1000) / 1000
    });
  }, { passive: true });
  return socket;
}

function setupRecorder(store, sceneApi) {
  const button = document.querySelector("#voice-button");
  const stateLabel = document.querySelector("#recording-state");
  let recorder = null;
  let chunks = [];
  let audioReactive = null;

  button.addEventListener("click", async () => {
    if (recorder?.state === "recording") {
      recorder.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioReactive = initAudioReactive(stream, (level) => {
        sceneApi?.setAudioLevel?.(level);
        drawWaveform(document.querySelector("#waveform-2d"), Math.max(0.18, level));
      });
      recorder = new MediaRecorder(stream);
      chunks = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        audioReactive?.stop();
        button.setAttribute("aria-pressed", "false");
        stateLabel.textContent = "processing";
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `aether-recording-${Date.now()}.webm`, { type: "audio/webm" });
        store.set({ mode: "audio" });
        await uploadFile(file, "audio", sceneApi, store);
        stateLabel.textContent = "transcribed";
        document.querySelector("#transcript-band").textContent = "voice capture routed into transcript stream.";
      };
      recorder.start();
      store.set({ mode: "audio" });
      button.setAttribute("aria-pressed", "true");
      stateLabel.textContent = "recording";
      notify("Recording started.", "success");
    } catch {
      notify("Microphone access was not granted.", "error");
    }
  });
}

function setupFileInput(store, sceneApi) {
  const input = document.querySelector("#file-input");
  const zone = document.querySelector("#drop-zone");
  const pickMode = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return store.get().mode;
  };
  const handleFile = async (file) => {
    const mode = pickMode(file);
    store.set({ mode });
    await uploadFile(file, mode, sceneApi, store);
  };
  input.addEventListener("change", () => {
    if (input.files?.[0]) handleFile(input.files[0]);
  });
  ["dragenter", "dragover"].forEach((name) => {
    zone.addEventListener(name, (event) => {
      event.preventDefault();
      zone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((name) => {
    zone.addEventListener(name, () => zone.classList.remove("is-dragging"));
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });
}

async function initScene(store) {
  const fallback = document.querySelector("#webgl-fallback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!supportsWebGL2()) {
    fallback.hidden = false;
    document.body.classList.add("no-webgl");
    notify("WebGL2 unavailable, using accessible 2D fallback.", "error");
    return null;
  }
  const { initAetherScene } = await import("./core/scene.js");
  return initAetherScene({
    canvas: document.querySelector("#aether-canvas"),
    store,
    reducedMotion,
    fpsTarget: document.querySelector("#fps-readout")
  });
}

function setupHoloMenu(sceneApi) {
  const menu = document.querySelector("#holo-menu");
  window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    menu.hidden = false;
    menu.style.left = `${Math.min(event.clientX - 112, window.innerWidth - 236)}px`;
    menu.style.top = `${Math.min(event.clientY - 112, window.innerHeight - 236)}px`;
    sceneApi?.burst?.();
    if (window.gsap) {
      window.gsap.fromTo(menu, { opacity: 0, rotateY: -55, scale: 0.88 }, { opacity: 1, rotateY: 0, scale: 1, duration: 0.26 });
    }
  });
  window.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) menu.hidden = true;
  });
}

async function boot() {
  window.lucide?.createIcons();
  const store = createStore({ mode: "text", theme: document.documentElement.dataset.theme || "dark", room: "global" });
  initThemeManager(store);
  initModalitySwitcher(store);
  initGlassInteractions();
  drawWaveform(document.querySelector("#waveform-2d"));
  const sceneApi = await initScene(store);
  setupSocket(store);
  setupFileInput(store, sceneApi);
  setupRecorder(store, sceneApi);
  setupHoloMenu(sceneApi);

  store.subscribe((state) => {
    sceneApi?.setMode?.(state.mode);
    window.socket?.emit?.("modality:change", { room: state.room, mode: state.mode });
  });

  document.querySelector("#multimodal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    submitMultimodal(store, sceneApi);
  });

  document.querySelector("#clear-output").addEventListener("click", () => {
    document.querySelector("#terminal-output").innerHTML = "";
  });

  document.querySelector("#perf-toggle").addEventListener("click", (event) => {
    const pressed = event.currentTarget.getAttribute("aria-pressed") === "true";
    event.currentTarget.setAttribute("aria-pressed", String(!pressed));
    sceneApi?.setPerformanceMode?.(!pressed);
    notify(!pressed ? "Performance mode enabled." : "Full fidelity restored.", "success");
  });
}

boot().catch((error) => {
  console.error(error);
  notify("AETHER failed to initialize. Check the console for details.", "error");
});
