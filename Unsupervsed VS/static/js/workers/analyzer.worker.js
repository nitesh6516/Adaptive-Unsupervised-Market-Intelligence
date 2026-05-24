self.onmessage = async (event) => {
  const { file } = event.data;
  const buffer = await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }
  const type = file.type || "application/octet-stream";
  const kind = type.startsWith("image/")
    ? "image"
    : type.startsWith("audio/")
      ? "audio"
      : type.startsWith("video/")
        ? "video"
        : "file";
  self.postMessage({
    name: file.name,
    type,
    kind,
    size: file.size,
    fingerprint: (hash >>> 0).toString(16),
    inspectedBytes: bytes.length
  });
};
