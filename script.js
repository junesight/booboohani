const modal = document.querySelector("#doctor-modal");
const modalImage = document.querySelector("#modal-doctor-image");
const modalName = document.querySelector("#modal-doctor-name");
const modalRole = document.querySelector("#modal-doctor-role");
const modalBio = document.querySelector("#modal-doctor-bio");
const modalScheduleRange = document.querySelector("#modal-schedule-range");
const modalWeeklySchedule = document.querySelector("#modal-weekly-schedule");
const doctorCards = document.querySelectorAll(".doctor-card");
const closeButtons = document.querySelectorAll("[data-modal-close]");
const popupLinks = document.querySelectorAll(".js-popup-link");
const galleryTabs = document.querySelectorAll(".gallery-tabs button");
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

const SUPABASE_URL = "https://wfyuxxskwlczoyisdcmy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_yUeE6ynEpbR3Eq-k3Gv1Ew_1DiaJHjz";
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const GALLERY_PLACEHOLDER = "assets/hero-treatment-room.png";
const ADMIN_PASSWORD = "272107";
const RECORD_STORAGE_KEY = "boobooPatientRecord";

const galleryFloors = {
  1: [
    { src: GALLERY_PLACEHOLDER, caption: "1층 접수 및 대기 공간" },
    { src: GALLERY_PLACEHOLDER, caption: "1층 로비" },
    { src: GALLERY_PLACEHOLDER, caption: "1층 상담 공간" },
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

  modalScheduleRange.textContent = `${weekDates[0].slice(5).replace("-", ".")} - ${weekDates[6].slice(5).replace("-", ".")}`;
  modalWeeklySchedule.replaceChildren(
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
        <strong>${DAY_LABELS[index]}</strong>
        <em>${isOff ? "휴진" : isNight ? "야간진료" : "진료"}</em>
        <span>${isOff ? "" : status}</span>
      `;

      return item;
    }),
  );
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

function openDoctorModal(card) {
  lastFocusedCard = card;

  const name = card.dataset.name;
  const role = card.dataset.role;
  const image = card.dataset.image;

  modalName.textContent = name;
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
  document.body.classList.remove("modal-open");
  modalImage.src = "";

  if (lastFocusedCard) {
    lastFocusedCard.focus();
  }
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

  galleryThumbs.replaceChildren(
    ...photos.map((photo, index) => {
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
      });

      return button;
    }),
  );
}

function moveGallery(step) {
  const photos = galleryFloors[activeGalleryFloor];
  activeGalleryIndex = (activeGalleryIndex + step + photos.length) % photos.length;
  renderGallery();
}

function normalizePatientCount(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  return trimmed.endsWith("명") ? trimmed : `${trimmed}명`;
}

function updatePatientRecord(date, count) {
  if (recordEndDate && date) {
    recordEndDate.textContent = date;
  }

  if (recordPatientCount && count) {
    recordPatientCount.textContent = normalizePatientCount(count);
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

popupLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const popup = window.open(
      link.href,
      "_blank",
      "noopener,noreferrer,width=520,height=760",
    );

    if (!popup) {
      window.location.href = link.href;
    }
  });
});

galleryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeGalleryFloor = tab.dataset.floor;
    activeGalleryIndex = 0;
    renderGallery();
  });
});

galleryPrev?.addEventListener("click", () => moveGallery(-1));
galleryNext?.addEventListener("click", () => moveGallery(1));

renderGallery();
loadPatientRecord();

adminTrigger?.addEventListener("click", openAdminModal);
adminLoginButton?.addEventListener("click", unlockAdminMenu);
adminSaveRecord?.addEventListener("click", savePatientRecord);

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeDoctorModal();
  }

  if (event.key === "Escape" && adminModal && !adminModal.hidden) {
    closeAdminModal();
  }
});
