// Injects HTML partials where data-include="partials/header.html" etc.
async function injectPartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    Array.from(nodes).map(async (el) => {
      const url = el.getAttribute("data-include");
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed ${url}`);
        el.outerHTML = await res.text();
      } catch (e) {
        console.error("Include error:", e);
      }
    })
  );
  // After partials are injected, update i18n content if available
  if (window.updateContent) {
    window.updateContent();
  }
}
document.addEventListener("DOMContentLoaded", injectPartials);
