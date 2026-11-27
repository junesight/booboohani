(() => {
  const toc = document.querySelector(".health-toc");
  if (!toc) return;
  toc.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    history.replaceState(history.state, "", url.href);
    const temporaryFocus = !target.hasAttribute("tabindex");
    if (temporaryFocus) target.setAttribute("tabindex", "-1");
    target.focus({preventScroll: true});
    if (temporaryFocus) target.addEventListener("blur", () => target.removeAttribute("tabindex"), {once: true});
    target.scrollIntoView({block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  });
})();
