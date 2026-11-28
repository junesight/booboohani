(() => {
  document.querySelectorAll(".health-carousel").forEach((carousel) => {
    const viewport = carousel.querySelector(".health-carousel-viewport");
    const track = carousel.querySelector(".health-carousel-track");
    const originals = [...track.children];
    const controls = carousel.querySelector(".health-carousel-controls");
    const toggle = controls.querySelector('[data-carousel="pause"]');
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = motion.matches;
    let hovered = false;
    let touching = false;
    let inView = false;
    let resumeAt = 0;
    let period = 0;
    let position = 0;
    let last = 0;

    // Copies complete the visual loop; only the originals enter keyboard navigation.
    for (const side of ["before", "after"]) {
      const copies = originals.map((card) => {
        const copy = card.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.dataset.carouselCopy = side;
        copy.querySelectorAll("a").forEach((a) => { a.tabIndex = -1; });
        return copy;
      });
      if (side === "before") track.prepend(...copies);
      else track.append(...copies);
    }
    viewport.dataset.enhanced = "";
    const updateToggle = () => {
      const label = paused ? "자동 넘김 재생" : "자동 넘김 일시정지";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.querySelector("[data-play]").hidden = !paused;
      toggle.querySelector("[data-pause]").hidden = paused;
    };
    updateToggle();
    const resize = () => {
      const gap = parseFloat(getComputedStyle(track).gap);
      const step = originals[0].getBoundingClientRect().width + gap;
      period = step * originals.length;
      position = period;
      viewport.scrollLeft = position;
      controls.hidden = period - gap <= viewport.clientWidth + 1;
      track.querySelectorAll("[data-carousel-copy]").forEach((card) => { card.hidden = controls.hidden; });
      if (controls.hidden) viewport.scrollLeft = position = 0;
    };
    new ResizeObserver(resize).observe(viewport);
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(viewport);
    carousel.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") hovered = true; });
    carousel.addEventListener("pointerleave", () => { hovered = false; });
    viewport.addEventListener("pointerdown", () => { touching = true; });
    window.addEventListener("pointerup", () => { if (touching) { touching = false; resumeAt = performance.now() + 6000; } });
    window.addEventListener("pointercancel", () => { touching = false; resumeAt = performance.now() + 6000; });
    viewport.addEventListener("wheel", () => { resumeAt = performance.now() + 6000; }, {passive: true});
    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-carousel]");
      if (!button) return;
      if (button.dataset.carousel === "pause") { paused = !paused; updateToggle(); }
      else {
        const step = originals[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
        viewport.scrollLeft += button.dataset.carousel === "next" ? step : -step;
        position = viewport.scrollLeft;
        resumeAt = performance.now() + 6000;
      }
    });
    motion.addEventListener("change", () => { paused = motion.matches; updateToggle(); });
    const frame = (now) => {
      const elapsed = last ? Math.min(now - last, 80) : 0;
      last = now;
      const blocked = paused || hovered || touching || carousel.contains(document.activeElement) || now < resumeAt || document.hidden || !inView || controls.hidden;
      if (blocked) position = viewport.scrollLeft;
      else {
        position -= elapsed * 18 / 1000;
        if (position <= 0) position += period;
        if (position >= period * 2) position -= period;
        viewport.scrollLeft = position;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
})();
