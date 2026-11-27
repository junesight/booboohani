import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
import {clinicPanel, scheduleEngine} from "./clinic-panel.mjs";
import {escapeHtml, articlePage, listPage, samplePosts} from "./content.mjs";

const source = await readFile(new URL("../../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../../script.js", import.meta.url), "utf8");
test("right article panel reuses homepage hours, contacts and six medical staff", () => {
  const {sidebar, popup} = clinicPanel(source, escapeHtml);
  for (const label of ["오전 09:00 - 12:20", "오후 14:00 - 20:00", "(점심시간 12:20 - 14:00)", "08:30 - 14:00", "(점심시간 없이 진료)", "전화 문의", "네이버 예약", "카톡 문의"]) assert(sidebar.includes(label));
  assert(sidebar.includes('href="tel:061-272-1075"'));
  assert(sidebar.includes('href="http://pf.kakao.com/_VlVkG/chat"'));
  assert(sidebar.includes("bizes/1260872"));
  assert.equal((popup.match(/data-name=/g) || []).length, 6);
  assert(popup.includes('aria-labelledby="article-schedule-title"'));
  assert(popup.includes('src="/article-schedule-engine.js" defer'));
  assert.throws(() => clinicPanel("<body></body>", escapeHtml), /Missing homepage/);
  const changed = clinicPanel(source.replace("오전 09:00 - 12:20", "오전 09:30 - 12:20"), escapeHtml);
  assert(changed.sidebar.includes("오전 09:30 - 12:20"));
});

test("isolated schedule engine uses only allowlisted homepage code and read-only public queries", async () => {
  const engine = scheduleEngine(script);
  for (const excluded of ["ADMIN_PASSWORD", "unlockAdminMenu", "savePatientRecord", "galleryFloors", "patient_records", "localStorage"]) assert(!engine.includes(excluded));
  let requests = 0;
  const window = {};
  vm.runInNewContext(engine, {window, document: {querySelectorAll: () => [], getElementById: () => ({})}, URLSearchParams, fetch: async (url, options) => {
    requests++;
    const parsed = new URL(url);
    assert.equal(parsed.pathname, "/rest/v1/schedules");
    assert.equal(parsed.searchParams.get("select"), "doctor_id,date,status");
    assert.equal(parsed.searchParams.getAll("date").length, 2);
    assert.equal(options.method || "GET", "GET");
    return {ok: true, json: async () => [{doctor_id: "choi", date: "2026-11-27", status: "8"}]};
  }});
  const rows = await window.ClinicArticleSchedule.load();
  assert.equal(rows.length, 1);
  await window.ClinicArticleSchedule.load();
  assert.equal(requests, 1);
  window.ClinicArticleSchedule.reset();
  await window.ClinicArticleSchedule.load();
  assert.equal(requests, 2);
  assert.throws(() => scheduleEngine("const DAY_LABELS = [];"), /Missing homepage schedule symbol/);
});

test("clinic sidebar and schedule popup belong only to article pages, not home or listings", () => {
  const article = articlePage(source, samplePosts()[0]);
  assert.equal((article.match(/class="health-clinic-panel"/g) || []).length, 1);
  assert.equal((article.match(/id="article-schedule-modal"/g) || []).length, 1);
  assert(article.includes('id="article-top"'));
  assert(!listPage(source, [], new URL("http://localhost/health.html")).includes('class="health-clinic-panel"'));
  assert(!source.includes('class="health-clinic-panel"'));
});

test("failed schedule requests remain retryable instead of becoming a cached empty week", async () => {
  const window = {};
  let calls = 0;
  vm.runInNewContext(scheduleEngine(script), {window, document: {querySelectorAll: () => [], getElementById: () => ({})}, URLSearchParams, fetch: async () => ({ok: ++calls > 1, json: async () => []})});
  await assert.rejects(window.ClinicArticleSchedule.load());
  assert.equal((await window.ClinicArticleSchedule.load()).length, 0);
  assert.equal(calls, 2);
});
