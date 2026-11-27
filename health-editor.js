(() => {
  const $ = (selector) => document.querySelector(selector);
  let quill;
  let token;
  let posts = [];
  let current = null;
  let cover = "";
  let coverThumb = "";
  let dirty = false;
  let busy = false;
  let loading = false;
  let imageEdit = null;
  let insertRange = null;
  let toastTimer;
  const icons = () => window.lucide?.createIcons();
  function error(message = "") {
    $("#editor-error").textContent = message;
    $("#editor-error").hidden = !message;
  }
  function toast(message) {
    $("#editor-toast").textContent = message;
    $("#editor-toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $("#editor-toast").hidden = true; }, 3500);
  }
  function setBusy(value) {
    busy = value;
    document.querySelectorAll("button, select, textarea, input").forEach((element) => { element.disabled = value; });
    quill?.enable(!value);
  }
  async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { "X-Health-Token": token || "", ...options.headers } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "요청을 처리하지 못했습니다.");
    return result;
  }
  async function action(callback) {
    if (busy) return;
    error();
    setBusy(true);
    try { await callback(); } catch (exception) { error(exception.message); } finally { setBusy(false); }
  }
  function markDirty() {
    if (loading) return;
    dirty = true;
    $("#save-state").textContent = "저장하지 않은 변경사항";
  }
  function renderLibrary() {
    $("#post-count").textContent = posts.length;
    const filter = $("#post-filter").value;
    const filtered = posts.filter((post) => filter === "all" || post.status === filter).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const list = $("#post-list");
    list.replaceChildren();
    for (const post of filtered) {
      const button = document.createElement("button");
      button.className = "editor-post-item";
      button.type = "button";
      if (post.id === current?.id) button.setAttribute("aria-current", "true");
      const title = document.createElement("strong");
      title.textContent = post.title;
      const state = document.createElement("small");
      state.textContent = `${post.sample ? "예시 · " : ""}${post.status === "published" ? "발행" : "임시저장"}`;
      button.append(title, state);
      button.addEventListener("click", () => { if (!busy && canLeave()) loadPost(post); });
      list.append(button);
    }
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "editor-post-empty";
      empty.textContent = "등록된 글이 없습니다.";
      list.append(empty);
    }
  }
  function renderCover() {
    $("#cover-preview").hidden = !cover;
    if (cover) $("#cover-preview").src = cover;
    else $("#cover-preview").removeAttribute("src");
    $("#cover-preview").alt = $("#cover-alt").value;
    $("#cover-placeholder").hidden = Boolean(cover);
    $("#remove-cover").hidden = !cover;
  }
  function canLeave() { return !dirty || window.confirm("저장하지 않은 변경사항이 있습니다. 이동할까요?"); }
  function loadPost(post = null) {
    loading = true;
    current = post;
    cover = post?.cover || "";
    coverThumb = post?.coverThumb || "";
    $("#post-title").value = post?.title || "";
    $("#post-category").value = post?.category || "";
    $("#cover-alt").value = post?.coverAlt || "";
    quill.setText("");
    if (post?.html) quill.clipboard.dangerouslyPasteHTML(post.html, "silent");
    quill.history.clear();
    $("#editor-heading").textContent = post ? "글 수정" : "새 글";
    $("#save-state").textContent = post ? `${post.status === "published" ? "발행" : "임시저장"} · ${new Date(post.updatedAt).toLocaleString("ko-KR")}` : "저장 전";
    $("#save-label").textContent = post?.status === "published" ? "변경 저장" : "임시저장";
    $("#publish-label").textContent = post?.status === "published" ? "발행 수정" : "발행";
    $("#delete-post").hidden = !post;
    $("#unpublish-post").hidden = post?.status !== "published";
    $("#view-post").hidden = post?.status !== "published";
    if (post) $("#view-post").href = `/health/${post.id}.html`;
    history.replaceState(null, "", post ? `?id=${encodeURIComponent(post.id)}` : location.pathname);
    renderCover();
    renderLibrary();
    error();
    dirty = false;
    loading = false;
  }
  function values(status = current?.status || "draft") {
    return { id: current?.id, revision: current?.revision, title: $("#post-title").value, category: $("#post-category").value, cover, coverThumb, coverAlt: $("#cover-alt").value, html: quill.getSemanticHTML(), status };
  }
  async function save(status) {
    const post = await request("/api/health/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values(status)) });
    posts = posts.filter((item) => item.id !== post.id).concat(post);
    loadPost(post);
    toast(status === "published" ? "발행했습니다." : "임시저장했습니다.");
  }
  async function upload(file) {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG, WebP 이미지를 선택해 주세요.");
    if (file.size > 12 * 1024 * 1024) throw new Error("12MB 이하의 이미지를 선택해 주세요.");
    return request("/api/health/images", { method: "POST", headers: { "Content-Type": file.type }, body: file });
  }
  function openImageSettings({ src, index, existing = false, alt = "", width = "100%" }) {
    imageEdit = { src, index, existing };
    $("#inline-image-preview").src = src;
    $("#inline-image-alt").value = alt;
    $("#inline-image-width").value = ["100%", "640", "400", "240"].includes(width) ? width : "100%";
    $("#remove-inline-image").hidden = !existing;
    $("#image-dialog").showModal();
  }
  function insertBodyImage(index, src, alt, width = "100%") {
    let imageIndex = index;
    if (imageIndex > 0 && quill.getText(imageIndex - 1, 1) !== "\n") {
      quill.insertText(imageIndex, "\n", "user");
      imageIndex += 1;
    }
    quill.insertEmbed(imageIndex, "image", src, "user");
    quill.formatText(imageIndex, 1, { alt, width }, "user");
    if (quill.getText(imageIndex + 1, 1) !== "\n") quill.insertText(imageIndex + 1, "\n", "user");
    return imageIndex;
  }

  async function start() {
    if (!window.Quill) throw new Error("편집기를 불러오지 못했습니다. 로컬 서버에서 페이지를 새로고침해 주세요.");
    if (window.matchMedia("(max-width: 1000px)").matches) $(".editor-library").open = false;
    const session = await request("/api/health/session");
    token = session.token;
    const Size = Quill.import("attributors/style/size");
    Size.whitelist = ["14px", "16px", "18px", "22px", "28px", "36px"];
    Quill.register(Size, true);
    quill = new Quill("#health-editor", {
      theme: "snow", placeholder: "본문을 입력하세요",
      formats: ["header", "size", "bold", "italic", "underline", "strike", "color", "background", "align", "list", "blockquote", "link", "image", "indent"],
      modules: { toolbar: { container: "#health-toolbar", handlers: { image() { insertRange = quill.getSelection(true); $("#body-file").click(); } } }, history: { userOnly: true }, uploader: { handler(range, files) {
        action(async () => {
          for (const file of files) {
            const image = await upload(file);
            range.index = insertBodyImage(range.index, image.src, file.name.replace(/\.[^.]+$/, "")) + 2;
          }
        });
      } } },
    });
    $("#health-editor .ql-editor").setAttribute("aria-label", "글 본문");
    $("#health-editor .ql-editor").setAttribute("role", "textbox");
    $("#health-editor .ql-editor").setAttribute("aria-multiline", "true");
    const toolbarIcons = { bold: "bold", italic: "italic", underline: "underline", strike: "strikethrough", blockquote: "quote", link: "link", image: "image-plus", clean: "remove-formatting" };
    for (const [format, icon] of Object.entries(toolbarIcons)) $("#health-toolbar .ql-" + format).innerHTML = `<i data-lucide="${icon}"></i>`;
    $("#health-toolbar .ql-list[value='bullet']").innerHTML = '<i data-lucide="list"></i>';
    $("#health-toolbar .ql-list[value='ordered']").innerHTML = '<i data-lucide="list-ordered"></i>';
    icons();
    posts = await request("/api/health/posts");
    const selected = new URLSearchParams(location.search).get("id");
    loadPost(posts.find((post) => post.id === selected) || null);
    quill.on("text-change", markDirty);
    for (const selector of ["#post-title", "#post-category", "#cover-alt"]) $(selector).addEventListener("input", markDirty);
    $("#cover-alt").addEventListener("input", renderCover);
    $("#post-filter").addEventListener("change", renderLibrary);
    $("#new-post").addEventListener("click", () => { if (canLeave()) loadPost(); });
    $("#save-draft").addEventListener("click", () => action(() => save(current?.status === "published" ? "published" : "draft")));
    $("#publish-post").addEventListener("click", () => action(() => save("published")));
    $("#unpublish-post").addEventListener("click", () => { if (window.confirm("이 글을 비공개로 전환할까요?")) action(() => save("draft")); });
    $("#delete-post").addEventListener("click", () => {
      if (!current || !window.confirm("글을 삭제할까요? 삭제한 글은 복구할 수 없습니다.")) return;
      action(async () => {
        await request(`/api/health/posts/${current.id}`, { method: "DELETE", headers: { "X-Post-Revision": String(current.revision) } });
        posts = posts.filter((post) => post.id !== current.id);
        loadPost();
        toast("삭제했습니다.");
      });
    });
    $("#preview-post").addEventListener("click", () => action(async () => {
      const preview = await request("/api/health/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values()) });
      $("#preview-frame").srcdoc = preview.html;
      $("#preview-dialog").showModal();
    }));
    $("#choose-cover").addEventListener("click", () => $("#cover-file").click());
    $("#cover-file").addEventListener("change", (event) => action(async () => {
      const file = event.target.files[0];
      if (!file) return;
      const image = await upload(file);
      cover = image.src;
      coverThumb = image.thumbnail;
      if (!$("#cover-alt").value) $("#cover-alt").value = file.name.replace(/\.[^.]+$/, "");
      renderCover(); markDirty(); event.target.value = "";
    }));
    $("#remove-cover").addEventListener("click", () => { cover = ""; coverThumb = ""; renderCover(); markDirty(); });
    $("#body-file").addEventListener("change", (event) => action(async () => {
      const file = event.target.files[0];
      if (!file) return;
      const image = await upload(file);
      openImageSettings({ src: image.src, index: insertRange?.index ?? quill.getLength()-1, alt: file.name.replace(/\.[^.]+$/, "") });
      event.target.value = "";
    }));
    $("#health-editor").addEventListener("click", (event) => {
      if (event.target.tagName !== "IMG") return;
      const blot = Quill.find(event.target);
      if (blot) openImageSettings({ src: event.target.getAttribute("src"), index: quill.getIndex(blot), existing: true, alt: event.target.alt, width: event.target.getAttribute("width") || "100%" });
    });
    $("#image-settings").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!imageEdit) return;
      const { src, index, existing } = imageEdit;
      const alt = $("#inline-image-alt").value.trim();
      const width = $("#inline-image-width").value;
      const imageIndex = existing ? index : insertBodyImage(index, src, alt, width);
      if (existing) quill.formatText(imageIndex, 1, { alt, width }, "user");
      $("#image-dialog").close();
      quill.setSelection(Math.min(imageIndex+2, quill.getLength()-1), 0);
      markDirty();
    });
    $("#remove-inline-image").addEventListener("click", () => { if (imageEdit?.existing) { quill.deleteText(imageEdit.index, 1, "user"); $("#image-dialog").close(); } });
    document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
    window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
  }
  start().catch((exception) => { error(exception.message); document.querySelectorAll(".health-editor-actions button").forEach((button) => { button.disabled = true; }); });
})();
