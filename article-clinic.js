(() => {
  const dialog = document.getElementById("article-schedule-modal");
  const trigger = document.querySelector(".health-weekly-trigger");
  const overview = document.getElementById("schedule-overview");
  const range = document.getElementById("schedule-modal-range");
  const retry = document.querySelector(".health-weekly-retry");
  const engine = window.ClinicArticleSchedule;
  if (!dialog || !trigger || !engine || typeof dialog.showModal !== "function") return;
  let loading = false;
  let savedStyles;
  let savedScroll = 0;
  const restore = () => {
    if (savedStyles) {
      [document.body.style.position, document.body.style.top, document.body.style.width] = savedStyles;
      savedStyles = null;
      window.scrollTo({top: savedScroll, behavior: "instant"});
    }
  };
  const close = () => { if (dialog.open) { dialog.close(); restore(); } };
  const load = async () => {
    if (loading) return;
    loading = true;
    retry.hidden = true;
    range.textContent = "";
    overview.textContent = "스케쥴을 불러오는 중입니다.";
    overview.setAttribute("aria-busy", "true");
    let timer;
    try {
      const rows = await Promise.race([engine.load(), new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), 12000);
      })]);
      if (!Array.isArray(rows) || !rows.length) {
        overview.textContent = "등록된 주간 스케쥴이 없습니다. 전화로 문의해 주세요.";
        retry.hidden = false;
        return;
      }
      engine.render(rows.map((row) => {
        const label = document.createElement("span");
        label.textContent = String(row.status ?? "");
        return {...row, status: label.innerHTML};
      }));
    } catch {
      overview.textContent = "스케쥴을 불러오지 못했습니다. 다시 시도하거나 전화로 문의해 주세요.";
      retry.hidden = false;
    } finally {
      clearTimeout(timer);
      loading = false;
      overview.removeAttribute("aria-busy");
    }
  };
  trigger.hidden = false;
  trigger.addEventListener("click", () => {
    savedScroll = window.scrollY;
    savedStyles = [document.body.style.position, document.body.style.top, document.body.style.width];
    dialog.showModal();
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScroll}px`;
    document.body.style.width = "100%";
    engine.reset();
    load();
  });
  retry.addEventListener("click", () => { engine.reset(); load(); });
  dialog.querySelector(".health-weekly-close").addEventListener("click", close);
  dialog.addEventListener("close", restore);
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  const desktop = matchMedia("(min-width: 1320px)");
  desktop.addEventListener("change", () => { if (!desktop.matches) close(); });
})();
