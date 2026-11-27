import { icons } from "lucide";

const icon = (name) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ")}></${tag}>`).join("")}</svg>`;

export function withMobileNavigation(html) {
  if (!html.includes("</footer>") || html.includes('id="mobile-navigation"')) return html;
  const headerPattern = /<header class="site-header[^"\n]*"[\s\S]*?<\/header>/;
  if (!headerPattern.test(html)) return html;
  const toggle = `<button class="mobile-menu-toggle" type="button" aria-label="메뉴 열기" aria-controls="mobile-navigation" aria-expanded="false" hidden>${icon("Menu")}</button>`;
  html = html.replace(headerPattern, (header) => header.replace("</header>", `${toggle}</header>`));
  const care = [
    ["spine", "척추 질환"], ["joint", "관절 질환"], ["accident", "교통사고"],
    ["sports", "스포츠 손상"], ["diet", "다이어트"], ["digestion", "소화·순환"],
    ["women-children", "여성·소아"], ["autonomic", "자율신경실조"],
  ];
  const links = [["/#methods", "치료 시스템"], ["/#doctors", "의료진 소개"], ["/health.html", "건강 정보"], ["/#gallery", "한의원 둘러보기"], ["/#location", "오시는 길"], ["/#contact", "예약 안내"], ["/#faq", "FAQ"]];
  const drawer = `<dialog id="mobile-navigation" class="mobile-navigation" aria-labelledby="mobile-navigation-title"><div class="mobile-navigation-heading"><strong id="mobile-navigation-title">부부한의원</strong><button type="button" class="mobile-menu-close" aria-label="메뉴 닫기" autofocus>${icon("X")}</button></div><nav aria-label="모바일 주요 메뉴"><a href="/#home">홈</a><details><summary>진료 분야${icon("ChevronDown")}</summary><div class="mobile-care-links"><a href="/#care">진료 분야 전체</a>${care.map(([slug, label]) => `<a href="/care-${slug}.html">${label}</a>`).join("")}</div></details>${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav></dialog><script src="/mobile-navigation.js" defer></script>`;
  return html.replace("</body>", `${drawer}</body>`);
}
