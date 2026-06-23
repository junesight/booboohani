const modal = document.querySelector("#doctor-modal");
const modalImage = document.querySelector("#modal-doctor-image");
const modalName = document.querySelector("#modal-doctor-name");
const modalRole = document.querySelector("#modal-doctor-role");
const modalBio = document.querySelector("#modal-doctor-bio");
const modalScheduleRange = document.querySelector("#modal-schedule-range");
const modalWeeklySchedule = document.querySelector("#modal-weekly-schedule");
const doctorCards = document.querySelectorAll(".doctor-card");
const closeButtons = document.querySelectorAll("[data-modal-close]");

const careModal = document.querySelector("#care-modal");
const careModalNumber = document.querySelector("#modal-care-number");
const careModalTitle = document.querySelector("#modal-care-title");
const careModalDetails = document.querySelector("#modal-care-details");
const careCards = document.querySelectorAll(".care-card");
const careCloseButtons = document.querySelectorAll("[data-care-close]");
const carePrevButton = document.querySelector(".care-prev");
const careNextButton = document.querySelector(".care-next");
let activeCareCard = null;

const doctorPrevButton = document.querySelector(".doctor-prev");
const doctorNextButton = document.querySelector(".doctor-next");
let activeDoctorCard = null;

const galleryTabs = document.querySelectorAll(".gallery-tabs button");
const galleryStage = document.querySelector(".gallery-stage");
const galleryImage = document.querySelector("#gallery-main-image");
const galleryCaption = document.querySelector("#gallery-caption");
const galleryThumbs = document.querySelector("#gallery-thumbs");
const galleryPrev = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
const adminTrigger = document.querySelector(".admin-trigger");
const adminModal = document.querySelector("#admin-modal");
const adminCloseButtons = document.querySelectorAll("[data-admin-close]");
const adminLogin = document.querySelector("#admin-login");
const adminDashboard = document.querySelector("#admin-dashboard");
const adminPassword = document.querySelector("#admin-password");
const adminLoginButton = document.querySelector("#admin-login-button");
const adminError = document.querySelector("#admin-error");
const adminRecordDate = document.querySelector("#admin-record-date");
const adminRecordCount = document.querySelector("#admin-record-count");
const adminSaveRecord = document.querySelector("#admin-save-record");
const adminSuccess = document.querySelector("#admin-success");
const recordEndDate = document.querySelector("#record-end-date");
const recordPatientCount = document.querySelector("#record-patient-count");
const scheduleTrigger = document.querySelector(".schedule-trigger");
const scheduleModal = document.querySelector("#schedule-modal");
const scheduleCloseButtons = document.querySelectorAll("[data-schedule-close]");
const scheduleModalRange = document.querySelector("#schedule-modal-range");
const scheduleOverview = document.querySelector("#schedule-overview");

const SUPABASE_URL = "https://wfyuxxskwlczoyisdcmy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yUeE6ynEpbR3Eq-k3Gv1Ew_1DiaJHjz";
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const GALLERY_PLACEHOLDER = "assets/hero-treatment-room.png";
const ADMIN_PASSWORD = "272107";
const RECORD_STORAGE_KEY = "boobooPatientRecord";

const galleryFloors = {
  1: [
    { src: "assets/gallery-1f-01.jpg", caption: "외부" },
    { src: "assets/gallery-1f-02.jpg", caption: "로비" },
    { src: "assets/gallery-1f-03.jpg", caption: "로비" },
    { src: "assets/gallery-1f-04.jpg", caption: "로비" },
    { src: "assets/gallery-1f-05.jpg", caption: "데스크" },
    { src: "assets/gallery-1f-06.jpg", caption: "진료실 복도" },
    { src: "assets/gallery-1f-07.jpg", caption: "진료실" },
    { src: "assets/gallery-1f-08.jpg", caption: "치료실 입구" },
    { src: "assets/gallery-1f-09.jpg", caption: "치료실" },
    { src: "assets/gallery-1f-10.jpg", caption: "치료실" },
    { src: "assets/gallery-1f-11.jpg", caption: "치료실" },
    { src: "assets/gallery-1f-12.jpg", caption: "검진실" },
    { src: "assets/gallery-1f-13.jpg", caption: "검진실" },
  ],
  2: [
    { src: GALLERY_PLACEHOLDER, caption: "2층 치료 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "2층 물리치료실" },
    { src: GALLERY_PLACEHOLDER, caption: "2층 대기 공간" },
  ],
  3: [
    { src: GALLERY_PLACEHOLDER, caption: "3층 입원 치료 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "3층 휴게 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "3층 치료실" },
  ],
  4: [
    { src: GALLERY_PLACEHOLDER, caption: "4층 진료 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "4층 회복 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "4층 휴식 공간" },
  ],
};

const doctorIdsByName = {
  "최보빈 원장": "choi",
  "김준현 원장": "kim-jun",
  "김영윤 원장": "kim-young",
  "박지현 원장": "park",
  "안태윤 원장": "ahn",
  "황두호 원장": "hwang",
};

const scheduleImagesByName = {
  "최보빈 원장": "assets/schedule-choi-bb.png",
  "김준현 원장": "assets/schedule-kim-jh.png",
  "김영윤 원장": "assets/schedule-kim-yy.png",
  "박지현 원장": "assets/schedule-park-jh.png",
  "안태윤 원장": "assets/schedule-ahn-ty.png",
  "황두호 원장": "assets/schedule-hwang-dh.png",
};

const doctorProfiles = {
  "최보빈 원장": [
    "부부한의원 대표원장",
    "원광대학교 한의학과 졸업",
    "서울 오금고등학교 졸업",
    "",
    "대한 여한의사회 장학생",
    "대한 복지학회 정회원",
    "대한 약침학회 정회원",
    "장부형상학회 정회원",
    "대한 침도학회 정회원",
    "대한 비만학회 정회원",
  ],
  "김준현 원장": [
    "부부한의원 총괄진료원장",
    "침구의학과 전문의, 한의학 박사",
    "원광대 전주한방병원 일반 및 전문 수련의 과정 수료",
    "원광대 일반대학원 박사과정 수료",
    "원광대학교 한의학과 졸업",
    "목포고등학교 졸업",
    "",
    "미국 근골격계 초음파 자격증(APCA RMSK) 보유",
    "대한침구의학회 평생회원",
    "척추신경추나의학회 정회원",
    "대한한의사전문의협회 정회원",
  ],
  "김영윤 원장": [
    "부부한의원 원장",
    "대구한의대학교 한의학과 졸업",
    "남악고등학교 졸업",
    "",
    "대한약침학회 회원",
    "대한동의방약학회 준회원",
    "척추신경추나의학회 준회원",
    "Mongolia Monos Pharmacy University 실습 수료",
  ],
  "박지현 원장": [
    "부부한의원 원장",
    "상지대학교 한의학과 수석졸업",
    "대구 덕원고등학교 졸업",
    "",
    "전) 안산중앙한의원 진료원장",
    "미국 근골격계 초음파 자격증 (APCA RMSK) 보유",
    "한방비만학회 회원",
    "대한약침학회 회원",
    "대한동의방약학회 준회원",
  ],
  "안태윤 원장": [
    "부부한의원 원장",
    "대전대학교 한의학과 졸업",
    "충남고등학교 졸업",
    "",
    "전) 삼성바로튼튼한의원 진료원장",
    "전) 목포 부부요양병원 진료원장",
    "전) 경기 광주시 보건소 역학조사관",
    "척추신경추나의학회 정회원",
    "한방비만학회 정회원",
  ],
  "황두호 원장": [
    "부부한의원 원장",
    "세명대학교 한의학과 졸업",
    "상산고등학교 졸업",
    "",
    "미국 근골격계 초음파 자격증 (APCA RMSK) 보유",
    "척추신경추나의학회 정회원",
    "척추신경추나의학회 심화과정 M1 수료",
    "척추신경추나의학회 심화과정 M3 수료",
  ],
};

let lastFocusedCard = null;
let weeklyScheduleCache = null;
let activeGalleryFloor = "1";
let activeGalleryIndex = 0;
let galleryAutoplayTimer = null;
let galleryTouchStartX = 0;
let galleryTouchStartY = 0;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);

  return formatDate(date);
}

function formatMonthDay(dateString) {
  const [, , month, day] = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return `${Number(month)}/${Number(day)}`;
}

function formatDoctorDisplayName(name) {
  return name.replace(/\s원장$/, " <span class=\"doctor-title-small\">원장</span>");
}

function getCurrentWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + diff);
  const weekStart = formatDate(monday);

  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function formatScheduleStatus(status) {
  const value = String(status || "");

  if (["휴무", "휴일", "공휴일", "휴원", "연차", "연차사용", "대체 필요", ""].includes(value)) {
    return "휴진";
  }

  if (["8", "7", "6", "5", "4", "2"].includes(value)) {
    return `~${value}시`;
  }

  return value || "휴진";
}

async function fetchWeeklySchedules() {
  if (weeklyScheduleCache) return weeklyScheduleCache;

  const weekDates = getCurrentWeekDates();
  const startDate = weekDates[0];
  const endDate = weekDates[6];
  const query = new URLSearchParams({
    select: "doctor_id,date,status",
    date: `gte.${startDate}`,
  });
  const url = `${SUPABASE_URL}/rest/v1/schedules?${query.toString()}&date=lte.${endDate}`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error("스케쥴 데이터를 불러오지 못했습니다.");
  }

  weeklyScheduleCache = await response.json();
  return weeklyScheduleCache;
}

function renderWeeklySchedule(doctorId, rows = []) {
  const weekDates = getCurrentWeekDates();
  const rowsByDate = new Map(
    rows
      .filter((row) => row.doctor_id === doctorId)
      .map((row) => [row.date, row]),
  );

  modalScheduleRange.textContent = "";
  modalWeeklySchedule.replaceChildren(
    ...weekDates.map((date, index) => {
      const item = document.createElement("div");
      const status = formatScheduleStatus(rowsByDate.get(date)?.status);
      const isOff = status === "휴진";
      const isNight = status === "~8시";

      item.className = [
        "schedule-date-cell",
        "modal-date-cell",
        isOff ? "is-off" : "",
        isNight ? "is-night" : "",
      ].filter(Boolean).join(" ");
      item.innerHTML = `
        <strong>${formatMonthDay(date)}</strong>
        <span>${DAY_LABELS[index]}</span>
      `;

      return item;
    }),
    ...weekDates.map((date, index) => {
      const item = document.createElement("div");
      const status = formatScheduleStatus(rowsByDate.get(date)?.status);
      const isOff = status === "휴진";
      const isNight = status === "~8시";

      item.className = [
        "schedule-pill",
        isOff ? "is-off" : "",
        isNight ? "is-night" : "",
      ].filter(Boolean).join(" ");
      item.innerHTML = `
        <em>${isOff ? "휴진" : isNight ? "야간진료" : "진료"}</em>
        <span>${isOff ? "" : status}</span>
      `;

      return item;
    }),
  );
}

function createSchedulePill(date, index, rowsByDate) {
  const item = document.createElement("div");
  const status = formatScheduleStatus(rowsByDate.get(date)?.status);
  const isOff = status === "휴진";
  const isNight = status === "~8시";

  item.className = [
    "schedule-pill",
    isOff ? "is-off" : "",
    isNight ? "is-night" : "",
  ].filter(Boolean).join(" ");
  item.innerHTML = `
    <strong>${DAY_LABELS[index]}</strong>
    <em>${isOff ? "휴진" : isNight ? "야간진료" : "진료"}</em>
    <span>${isOff ? "" : status}</span>
  `;

  return item;
}

async function loadDoctorWeeklySchedule(name) {
  const doctorId = doctorIdsByName[name];

  modalScheduleRange.textContent = "";
  modalWeeklySchedule.innerHTML = "<span>스케쥴을 불러오는 중입니다.</span>";

  try {
    const rows = await fetchWeeklySchedules();
    renderWeeklySchedule(doctorId, rows);
  } catch (error) {
    modalWeeklySchedule.innerHTML = "<span>스케쥴을 불러오지 못했습니다.</span>";
  }
}

function renderScheduleOverview(rows = []) {
  const weekDates = getCurrentWeekDates();
  const headerRow = document.createElement("div");
  const headerSpacerPhoto = document.createElement("div");
  const headerSpacerMeta = document.createElement("div");
  const headerSchedule = document.createElement("div");

  headerRow.className = "schedule-row schedule-date-row";
  headerSpacerPhoto.className = "schedule-date-spacer";
  headerSpacerMeta.className = "schedule-date-spacer";
  headerSchedule.className = "weekly-schedule schedule-date-grid";
  headerSchedule.replaceChildren(
    ...weekDates.map((date, index) => {
      const cell = document.createElement("div");

      cell.className = "schedule-date-cell";
      cell.innerHTML = `
        <strong>${formatMonthDay(date)}</strong>
        <span>${DAY_LABELS[index]}</span>
      `;

      return cell;
    }),
  );
  headerRow.append(headerSpacerPhoto, headerSpacerMeta, headerSchedule);

  scheduleModalRange.textContent = `${formatMonthDay(weekDates[0])} - ${formatMonthDay(weekDates[6])}`;
  scheduleOverview.replaceChildren(
    headerRow,
    ...Array.from(doctorCards).map((card) => {
      const name = card.dataset.name;
      const role = card.dataset.role;
      const image = scheduleImagesByName[name] || card.dataset.image;
      const doctorId = doctorIdsByName[name];
      const rowsByDate = new Map(
        rows
          .filter((row) => row.doctor_id === doctorId)
          .map((row) => [row.date, row]),
      );
      const row = document.createElement("div");
      const photo = document.createElement("div");
      const img = document.createElement("img");
      const meta = document.createElement("div");
      const schedule = document.createElement("div");

      row.className = "schedule-row";
      photo.className = "schedule-doctor-photo";
      img.src = image;
      img.alt = `${name} 프로필 사진`;
      meta.className = "schedule-doctor-meta";
      meta.innerHTML = `
        <span>${role}</span>
        <strong>${formatDoctorDisplayName(name)}</strong>
      `;
      schedule.className = "weekly-schedule";
      schedule.replaceChildren(
        ...weekDates.map((date, index) => createSchedulePill(date, index, rowsByDate)),
      );

      const handleProfileClick = (event) => {
        event.preventDefault();
        openDoctorModal(card);
      };
      photo.style.cursor = "pointer";
      meta.style.cursor = "pointer";
      photo.addEventListener("click", handleProfileClick);
      meta.addEventListener("click", handleProfileClick);

      photo.append(img);
      row.append(photo, meta, schedule);
      return row;
    }),
  );
}

async function openScheduleModal() {
  if (!scheduleModal) return;

  scheduleModal.hidden = false;
  document.body.classList.add("modal-open");
  scheduleOverview.innerHTML = "<span>스케쥴을 불러오는 중입니다.</span>";
  scheduleModal.querySelector(".modal-close").focus();

  try {
    const rows = await fetchWeeklySchedules();
    renderScheduleOverview(rows);
  } catch (error) {
    scheduleOverview.innerHTML = "<span>스케쥴을 불러오지 못했습니다.</span>";
  }
}

function closeScheduleModal() {
  if (!scheduleModal) return;

  scheduleModal.hidden = true;
  const isAnyModalOpen = (modal && !modal.hidden) || (careModal && !careModal.hidden) || (adminModal && !adminModal.hidden);
  if (!isAnyModalOpen) {
    document.body.classList.remove("modal-open");
  }
  scheduleTrigger?.focus();
}

function renderCareModalContent() {
  if (!activeCareCard) return;

  const numberSpan = activeCareCard.querySelector("span");
  const number = numberSpan ? numberSpan.textContent : "";
  const title = activeCareCard.querySelector("h3").textContent;
  
  let detailsHtml = "";
  const ulEl = activeCareCard.querySelector("ul");
  const pEl = activeCareCard.querySelector("p");
  
  if (ulEl) {
    detailsHtml = ulEl.innerHTML;
  } else if (pEl) {
    detailsHtml = `<li>${pEl.textContent}</li>`;
  }

  if (careModalNumber) careModalNumber.textContent = number;
  if (careModalTitle) careModalTitle.textContent = title;
  if (careModalDetails) careModalDetails.innerHTML = detailsHtml;
}

function openCareModal(card) {
  if (window.innerWidth > 768) {
    const isDetailCard = card.classList.contains("has-detail") || card.closest(".has-detail");
    if (!isDetailCard) {
      return;
    }
  }

  lastFocusedCard = card;
  activeCareCard = card;
  renderCareModalContent();

  if (careModal) {
    careModal.hidden = false;
    document.body.classList.add("modal-open");
    careModal.querySelector(".modal-close")?.focus();
  }
}

function closeCareModal() {
  if (!careModal) return;
  activeCareCard = null;
  careModal.hidden = true;
  const isAnyModalOpen = (modal && !modal.hidden) || (scheduleModal && !scheduleModal.hidden) || (adminModal && !adminModal.hidden);
  if (!isAnyModalOpen) {
    document.body.classList.remove("modal-open");
  }

  if (lastFocusedCard) {
    lastFocusedCard.focus();
    lastFocusedCard = null;
  }
}

function navigateCareModal(direction) {
  if (!activeCareCard) return;

  const isMethod = activeCareCard.classList.contains("method-card");
  let cards;

  if (isMethod) {
    if (window.innerWidth > 768) {
      cards = document.querySelectorAll(".method-card.has-detail");
    } else {
      cards = document.querySelectorAll(".method-card");
    }
  } else {
    cards = document.querySelectorAll(".care-card");
  }

  if (cards.length === 0) return;

  let currentIndex = Array.from(cards).indexOf(activeCareCard);
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  
  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) {
    nextIndex = cards.length - 1;
  } else if (nextIndex >= cards.length) {
    nextIndex = 0;
  }

  activeCareCard = cards[nextIndex];
  renderCareModalContent();
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleCareModalTouchStart(event) {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}

function handleCareModalTouchEnd(event) {
  touchEndX = event.changedTouches[0].screenX;
  touchEndY = event.changedTouches[0].screenY;
  handleCareModalSwipe();
}

function handleCareModalSwipe() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  const minThreshold = 50;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > minThreshold) {
      if (diffX > 0) {
        navigateCareModal(-1);
      } else {
        navigateCareModal(1);
      }
    }
  }
}

function openDoctorModal(card) {
  lastFocusedCard = card;
  activeDoctorCard = card;

  const name = card.dataset.name;
  const role = card.dataset.role;
  const image = card.dataset.image;

  modalName.innerHTML = formatDoctorDisplayName(name);
  modalRole.textContent = role;
  modalImage.src = image;
  modalImage.alt = `${name} 프로필 사진`;
  modalBio.replaceChildren(
    ...doctorProfiles[name].map((item) => {
      const listItem = document.createElement("li");

      if (item === "") {
        listItem.className = "bio-spacer";
        listItem.setAttribute("aria-hidden", "true");
      } else {
        listItem.textContent = item;
      }

      return listItem;
    }),
  );
  loadDoctorWeeklySchedule(name);

  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeDoctorModal() {
  modal.hidden = true;
  activeDoctorCard = null;
  const isAnyModalOpen = (scheduleModal && !scheduleModal.hidden) || (careModal && !careModal.hidden) || (adminModal && !adminModal.hidden);
  if (!isAnyModalOpen) {
    document.body.classList.remove("modal-open");
  }
  modalImage.src = "";

  if (scheduleModal && !scheduleModal.hidden) {
    scheduleModal.querySelector(".modal-close")?.focus();
  } else {
    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  }
}

function navigateDoctorModal(direction) {
  if (!activeDoctorCard || doctorCards.length === 0) return;

  const activeName = activeDoctorCard.dataset.name;
  let currentIndex = Array.from(doctorCards).findIndex(card => card.dataset.name === activeName);
  
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  
  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) {
    nextIndex = doctorCards.length - 1;
  } else if (nextIndex >= doctorCards.length) {
    nextIndex = 0;
  }

  activeDoctorCard = doctorCards[nextIndex];
  openDoctorModal(activeDoctorCard);
}

let doctorTouchStartX = 0;
let doctorTouchStartY = 0;
let doctorTouchEndX = 0;
let doctorTouchEndY = 0;

function handleDoctorModalTouchStart(event) {
  doctorTouchStartX = event.changedTouches[0].screenX;
  doctorTouchStartY = event.changedTouches[0].screenY;
}

function handleDoctorModalTouchEnd(event) {
  doctorTouchEndX = event.changedTouches[0].screenX;
  doctorTouchEndY = event.changedTouches[0].screenY;
  handleDoctorModalSwipe();
}

function handleDoctorModalSwipe() {
  const diffX = doctorTouchEndX - doctorTouchStartX;
  const diffY = doctorTouchEndY - doctorTouchStartY;
  const minThreshold = 50;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > minThreshold) {
      if (diffX > 0) {
        navigateDoctorModal(-1);
      } else {
        navigateDoctorModal(1);
      }
    }
  }
}

function scrollActiveGalleryThumb(activeThumb) {
  if (!activeThumb || !galleryThumbs) return;

  const targetLeft =
    activeThumb.offsetLeft -
    galleryThumbs.clientWidth / 2 +
    activeThumb.clientWidth / 2;

  galleryThumbs.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: "smooth",
  });
}

function renderGallery() {
  if (!galleryImage || !galleryCaption || !galleryThumbs) return;

  const photos = galleryFloors[activeGalleryFloor];
  const activePhoto = photos[activeGalleryIndex];

  galleryImage.src = activePhoto.src;
  galleryImage.alt = `부부한의원 ${activeGalleryFloor}층 ${activePhoto.caption}`;
  galleryCaption.textContent = activePhoto.caption;

  galleryTabs.forEach((tab) => {
    const isActive = tab.dataset.floor === activeGalleryFloor;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  const thumbButtons = photos.map((photo, index) => {
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.className = `gallery-thumb${index === activeGalleryIndex ? " is-active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `${photo.caption} 보기`);
    image.src = photo.src;
    image.alt = "";

    button.append(image);
    button.addEventListener("click", () => {
      activeGalleryIndex = index;
      renderGallery();
      restartGalleryAutoplay();
    });

    return button;
  });

  galleryThumbs.replaceChildren(...thumbButtons);
  scrollActiveGalleryThumb(thumbButtons[activeGalleryIndex]);
}

function moveGallery(step) {
  const photos = galleryFloors[activeGalleryFloor];
  activeGalleryIndex = (activeGalleryIndex + step + photos.length) % photos.length;
  renderGallery();
}

function startGalleryAutoplay() {
  if (!galleryImage) return;

  window.clearInterval(galleryAutoplayTimer);
  galleryAutoplayTimer = window.setInterval(() => {
    moveGallery(1);
  }, 5000);
}

function restartGalleryAutoplay() {
  startGalleryAutoplay();
}

function normalizePatientCount(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  return trimmed.endsWith("명") ? trimmed : `${trimmed}명`;
}

function formatUnitText(text) {
  return text.replace(/(년|월|일|명)/g, '<span class="unit">$1</span>');
}

function updatePatientRecord(date, count) {
  if (recordEndDate && date) {
    recordEndDate.innerHTML = formatUnitText(date);
  }

  if (recordPatientCount && count) {
    recordPatientCount.innerHTML = formatUnitText(normalizePatientCount(count));
  }
}

function loadPatientRecord() {
  const savedRecord = localStorage.getItem(RECORD_STORAGE_KEY);
  if (!savedRecord) return;

  try {
    const record = JSON.parse(savedRecord);
    updatePatientRecord(record.date, record.count);
  } catch (error) {
    localStorage.removeItem(RECORD_STORAGE_KEY);
  }
}

function openAdminModal() {
  if (!adminModal) return;

  adminModal.hidden = false;
  document.body.classList.add("modal-open");
  adminLogin.hidden = false;
  adminDashboard.hidden = true;
  adminPassword.value = "";
  adminError.textContent = "";
  adminSuccess.textContent = "";
  adminPassword.focus();
}

function closeAdminModal() {
  if (!adminModal) return;

  adminModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function unlockAdminMenu() {
  if (adminPassword.value !== ADMIN_PASSWORD) {
    adminError.textContent = "비밀번호가 맞지 않습니다.";
    adminPassword.select();
    return;
  }

  adminLogin.hidden = true;
  adminDashboard.hidden = false;
  adminError.textContent = "";
  adminSuccess.textContent = "";
  adminRecordDate.value = recordEndDate?.textContent || "";
  adminRecordCount.value = recordPatientCount?.textContent || "";
  adminRecordDate.focus();
}

function savePatientRecord() {
  const date = adminRecordDate.value.trim();
  const count = normalizePatientCount(adminRecordCount.value);

  if (!date || !count) {
    adminSuccess.classList.add("is-error");
    adminSuccess.textContent = "날짜와 내원 환자수를 모두 입력해주세요.";
    return;
  }

  updatePatientRecord(date, count);
  localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify({ date, count }));
  adminRecordCount.value = count;
  adminSuccess.classList.remove("is-error");
  adminSuccess.textContent = "내원 환자수가 업데이트되었습니다.";
}

doctorCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    openDoctorModal(card);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeDoctorModal);
});

careCards.forEach((card) => {
  card.addEventListener("click", () => {
    openCareModal(card);
  });
});

const methodCards = document.querySelectorAll(".method-card");
methodCards.forEach((card) => {
  card.addEventListener("click", () => {
    openCareModal(card);
  });
});

careCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCareModal);
});

carePrevButton?.addEventListener("click", () => {
  navigateCareModal(-1);
});

careNextButton?.addEventListener("click", () => {
  navigateCareModal(1);
});

const careModalContent = careModal?.querySelector(".modal-content-small");
careModalContent?.addEventListener("touchstart", handleCareModalTouchStart, { passive: true });
careModalContent?.addEventListener("touchend", handleCareModalTouchEnd, { passive: true });

doctorPrevButton?.addEventListener("click", () => {
  navigateDoctorModal(-1);
});

doctorNextButton?.addEventListener("click", () => {
  navigateDoctorModal(1);
});

const doctorModalContent = modal?.querySelector(".modal-content");
doctorModalContent?.addEventListener("touchstart", handleDoctorModalTouchStart, { passive: true });
doctorModalContent?.addEventListener("touchend", handleDoctorModalTouchEnd, { passive: true });

galleryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeGalleryFloor = tab.dataset.floor;
    activeGalleryIndex = 0;
    renderGallery();
    restartGalleryAutoplay();
  });
});

galleryPrev?.addEventListener("click", () => {
  moveGallery(-1);
  restartGalleryAutoplay();
});
galleryNext?.addEventListener("click", () => {
  moveGallery(1);
  restartGalleryAutoplay();
});

galleryStage?.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    galleryTouchStartX = touch.clientX;
    galleryTouchStartY = touch.clientY;
  },
  { passive: true },
);

galleryStage?.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - galleryTouchStartX;
    const deltaY = touch.clientY - galleryTouchStartY;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

    moveGallery(deltaX > 0 ? -1 : 1);
    restartGalleryAutoplay();
  },
  { passive: true },
);

renderGallery();
startGalleryAutoplay();
loadPatientRecord();

adminTrigger?.addEventListener("click", openAdminModal);
adminLoginButton?.addEventListener("click", unlockAdminMenu);
adminSaveRecord?.addEventListener("click", savePatientRecord);
scheduleTrigger?.addEventListener("click", openScheduleModal);

adminPassword?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockAdminMenu();
  }
});

[adminRecordDate, adminRecordCount].forEach((input) => {
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      savePatientRecord();
    }
  });
});

adminCloseButtons.forEach((button) => {
  button.addEventListener("click", closeAdminModal);
});

scheduleCloseButtons.forEach((button) => {
  button.addEventListener("click", closeScheduleModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeDoctorModal();
  }

  if (event.key === "Escape" && adminModal && !adminModal.hidden) {
    closeAdminModal();
  }

  if (event.key === "Escape" && scheduleModal && !scheduleModal.hidden) {
    closeScheduleModal();
  }
});
