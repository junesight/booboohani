import {parseDocument} from "htmlparser2";
import {parse} from "acorn";
import {icon} from "./navigation.mjs";

const hasClass = (node, name) => (node.attribs?.class || "").split(/\s+/).includes(name);
const nodes = (node, predicate) => (node.children || []).flatMap((child) => [...(predicate(child) ? [child] : []), ...nodes(child, predicate)]);
const text = (node) => node.type === "text" ? node.data : (node.children || []).map(text).join("");

export function clinicPanel(source, escape) {
  const doc = parseDocument(source);
  const hours = nodes(doc, (node) => hasClass(node, "clinic-time-info"))[0];
  const actions = nodes(doc, (node) => hasClass(node, "contact-actions"))[0];
  const cards = hours && nodes(hours, (node) => hasClass(node, "clinic-time-card"));
  const links = actions && nodes(actions, (node) => node.name === "a");
  const doctors = nodes(doc, (node) => hasClass(node, "doctor-card"));
  if (cards?.length !== 2 || links?.length !== 3 || doctors.length !== 6) throw new Error("Missing homepage reservation or medical staff source.");
  const timeHtml = cards.map((card) => `<div class="health-clinic-hours">${nodes(card, (node) => ["strong", "span"].includes(node.name)).map((node) => `<${node.name} class="${escape(node.attribs.class || "")}">${escape(text(node))}</${node.name}>`).join("")}</div>`).join("");
  const contactHtml = links.map((link) => {
    const img = nodes(link, (node) => node.name === "img")[0];
    if (!img?.attribs.src?.startsWith("assets/") || !/^(tel:|https?:\/\/)/.test(link.attribs.href)) throw new Error("Invalid homepage contact link.");
    return `<a class="${escape(link.attribs.class)}" href="${escape(link.attribs.href)}" target="_blank" rel="noopener noreferrer"><img src="/${escape(img.attribs.src)}" alt="" width="22" height="22">${escape(text(link).trim())}</a>`;
  }).join("");
  const doctorHtml = doctors.map((doctor) => `<span data-name="${escape(doctor.attribs["data-name"])}" data-role="${escape(doctor.attribs["data-role"])}" data-image="${escape(doctor.attribs["data-image"])}"></span>`).join("");
  const sidebar = `<aside class="health-clinic-panel" aria-label="진료 및 예약 안내"><div class="health-clinic-sticky"><h2>${icon("Clock")}진료 시간</h2>${timeHtml}<button class="health-weekly-trigger" type="button" aria-haspopup="dialog" aria-controls="article-schedule-modal" hidden>${icon("CalendarDays")}의료진 주간 스케쥴</button><noscript><a href="/#home">의료진 주간 스케쥴 보기</a></noscript><div class="health-clinic-actions">${contactHtml}</div></div></aside>`;
  const popup = `<dialog class="health-schedule-dialog" id="article-schedule-modal" aria-labelledby="article-schedule-title"><div class="schedule-modal-panel"><button class="modal-close health-weekly-close" type="button" aria-label="진료 스케쥴 닫기" autofocus>${icon("X")}</button><div class="schedule-modal-head"><p class="eyebrow">Weekly Schedule</p><h2 id="article-schedule-title">주간 진료 스케쥴</h2><span id="schedule-modal-range"></span></div><div class="schedule-overview" id="schedule-overview" aria-live="polite"></div><button class="health-weekly-retry" type="button" hidden>${icon("RefreshCw")}다시 불러오기</button></div></dialog><div class="health-schedule-doctors" hidden>${doctorHtml}</div><script src="/article-schedule-engine.js" defer></script><script src="/article-clinic.js" defer></script>`;
  return {sidebar, popup};
}

// Reuse only the homepage's public schedule logic; never ship its admin/gallery code here.
export function scheduleEngine(source) {
  const functions = ["formatDate", "addDays", "formatMonthDay", "formatDoctorDisplayName", "getCurrentWeekDates", "getDateColorClass", "formatScheduleStatus", "fetchWeeklySchedules", "createSchedulePill", "renderScheduleOverview"];
  const constants = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "DAY_LABELS", "doctorIdsByName", "scheduleImagesByName"];
  const found = new Map();
  for (const node of parse(source, {ecmaVersion: "latest"}).body) {
    if (node.type === "FunctionDeclaration" && functions.includes(node.id.name)) found.set(node.id.name, source.slice(node.start, node.end));
    if (node.type === "VariableDeclaration") {
      for (const decl of node.declarations) {
        if (constants.includes(decl.id.name)) {
          if (decl.id.name === "SUPABASE_PUBLISHABLE_KEY" && !String(decl.init.value).startsWith("sb_publishable_")) throw new Error("Only the existing public schedule credential is supported.");
          found.set(decl.id.name, `const ${source.slice(decl.start, decl.end)};`);
        }
      }
    }
  }
  for (const name of [...constants, ...functions]) if (!found.has(name)) throw new Error(`Missing homepage schedule symbol: ${name}`);
  return `(() => {\n"use strict";\nconst doctorCards = document.querySelectorAll(".health-schedule-doctors > span");\nconst scheduleModalRange = document.getElementById("schedule-modal-range");\nconst scheduleOverview = document.getElementById("schedule-overview");\nlet weeklyScheduleCache = null;\nfunction openDoctorModal() { window.location.assign("/#doctors"); }\n${[...constants, ...functions].map((name) => found.get(name)).join("\n")}\nwindow.ClinicArticleSchedule = {load: fetchWeeklySchedules, render: renderScheduleOverview, reset: () => { weeklyScheduleCache = null; }};\n})();`;
}
