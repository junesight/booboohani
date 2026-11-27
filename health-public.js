if (window.lucide) window.lucide.createIcons();

(() => {
  const dataElement = document.querySelector("#health-search-data");
  const page = document.querySelector(".health-list-page");
  if (!dataElement || !page) return;
  const posts = JSON.parse(dataElement.textContent);
  const form = page.querySelector('form[role="search"]');
  const input = form.querySelector('input[name="q"]');
  const results = document.querySelector("#health-results");
  const count = document.querySelector("#health-result-count");
  const initialResults = [...results.childNodes].map((node) => node.cloneNode(true));
  const initialCount = count.textContent;
  const category = page.dataset.healthCategory;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function render(query) {
    if (!query) {
      results.replaceChildren(...initialResults.map((node) => node.cloneNode(true)));
      count.textContent = initialCount;
      return;
    }
    const selected = posts.filter((post) => (!category || post.category === category) && post.searchText.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    count.textContent = String(selected.length);
    const grid = element("div", "health-grid");
    for (const post of selected) {
      const card = element("article", "health-card");
      const link = element("a");
      link.href = `/health/${encodeURIComponent(post.id)}.html`;
      const media = element("div", "health-card-image");
      const image = element("img");
      image.src = post.coverThumb;
      image.alt = post.coverAlt;
      image.width = 600;
      image.height = 600;
      image.loading = "lazy";
      media.append(image);
      const copy = element("div", "health-card-copy");
      copy.append(element("p", "health-category", post.categoryLabel), element("h3", "", post.title));
      link.append(media, copy);
      card.append(link);
      grid.append(card);
    }
    if (selected.length) results.replaceChildren(grid);
    else {
      const empty = element("div", "health-empty");
      const reset = element("button", "health-outline-button", "검색 초기화");
      reset.type = "button";
      reset.addEventListener("click", () => { input.value = ""; search(); input.focus(); });
      empty.append(element("h2", "", "검색 결과가 없습니다."), reset);
      results.replaceChildren(empty);
    }
  }
  function search() {
    const query = input.value.trim().slice(0, 100);
    const url = new URL(location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
    render(query);
  }
  input.value = new URLSearchParams(location.search).get("q")?.slice(0, 100) || "";
  form.addEventListener("submit", (event) => { event.preventDefault(); search(); });
  input.addEventListener("search", search);
  render(input.value.trim());
})();
