(() => {
  const drawer = document.getElementById("mobile-navigation");
  const toggle = document.querySelector(".mobile-menu-toggle");
  if (!drawer || !toggle || typeof drawer.showModal !== "function") return;
  const mobile = matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)");
  let scrollY = 0;
  let previousStyles;
  const restore = () => {
    if (previousStyles) {
      [document.body.style.position, document.body.style.top, document.body.style.width] = previousStyles;
      previousStyles = null;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    }
    toggle.setAttribute("aria-expanded", "false");
    drawer.querySelectorAll("details").forEach((item) => { item.open = false; });
  };
  const close = () => { if (drawer.open) { drawer.close(); restore(); } };
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    if (!mobile.matches || drawer.open) return;
    scrollY = window.scrollY;
    previousStyles = [document.body.style.position, document.body.style.top, document.body.style.width];
    drawer.showModal();
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    toggle.setAttribute("aria-expanded", "true");
  });
  drawer.querySelector(".mobile-menu-close").addEventListener("click", close);
  drawer.addEventListener("click", (event) => {
    const rect = drawer.getBoundingClientRect();
    if (event.target === drawer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
    if (event.target.closest("a")) close();
  });
  drawer.addEventListener("close", restore);
  mobile.addEventListener("change", () => { if (!mobile.matches) close(); });
})();
