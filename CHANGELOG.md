# 변경 이력

이 파일은 사용자에게 영향을 주는 운영 사이트 변경을 기록합니다.

형식은 `날짜 / 작업 ID / 변경 내용 / 검증 / 배포 commit` 순서로 작성합니다.

## 미배포

### 추가

- 작업 ID: CONTENT-005-autonomic
  - 변경: [CONTENT-005-autonomic] 목포 자율신경실조증, 만성피로, 가슴 두근거림, 불면증 등의 주요 로컬 키워드 최적화를 위한 자율신경실조 진료 독립 서브페이지(care-autonomic.html)를 개설하고 메인 자율신경실조 카드와 연동을 마쳤습니다.
  - 검증: 자율신경실조 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: (main 병합 시 확정)

- 작업 ID: CONTENT-007
  - 변경: [CONTENT-007] 주요 진료 분야 서브페이지 상단에 4열 2행의 텍스트 그리드 서브 내비게이션(care-sub-nav) 메뉴를 추가하여 8대 상세페이지 간 즉시 이동할 수 있도록 사용성을 대폭 개선했습니다.
  - 검증: 각 상세페이지 상단 4x2 이동 버튼 정상 렌더링 및 모바일 2x4 뷰포트 대응, 클릭 시 상호 서브페이지 이동 무결성 검증 완료
  - 배포 commit: (main 병합 시 확정)

### 변경

- 작업 ID: LOCAL-001
  - 변경: [LOCAL-001] 로컬 검색 최적화(Local SEO)를 위한 표준 NAP(Name, Address, Phone) 정보 정합성을 확립했습니다. 홈페이지 내 주차 안내, 오시는 길 및 모든 진료 서브페이지의 푸터 영역 주소에 '전라남도'를 추가하여 표준 도로명 주소(전라남도 목포시 옥암로 193, 1~4층)로 정교화했습니다. 또한, 외부 채널 등록 가이드를 담은 로컬 SEO 표준 NAP 문서(docs/LOCAL_SEO_NAP.md)를 신설했습니다.
  - 검증: 전수 HTML 파일 내 구주소(목포시 옥암로...) 패턴의 잔존 여부 검증 및 푸터 렌더링 검수 완료
  - 배포 commit: (main 병합 시 확정)

- 작업 ID: LOCAL-002, LOCAL-003, LOCAL-004
  - 변경: [LOCAL-002, LOCAL-003, LOCAL-004] 로컬 3대 플랫폼(네이버 플레이스, 구글 비즈니스 프로필, 카카오맵)의 표준 NAP, 비급여 수가(비용), 진료 시간, 고화질 원내 갤러리 이미지 동기화 상태를 정비하기 위한 정밀 검수 가이드라인(docs/LOCAL_SEO_AUDIT.md)을 신설했습니다.
  - 검증: 가이드라인 문서 내 기재된 비급여 수가와 index.html 실수가 정보의 교차 검수 완료
  - 배포 commit: (main 병합 시 확정)

### 수정

## 2026-08-28 — 주요 진료 분야 독립 페이지 구축 완료

- 작업 ID: CONTENT-005-women-children
  - 변경: [CONTENT-005-women-children] 목포 생리통, 생리불순, 갱년기증후군, 소아 비염, 소아 성장 등의 주요 로컬 키워드 최적화를 위한 여성 및 소아 진료 독립 서브페이지(care-women-children.html)를 개설하고 메인 여성 및 소아 카드와 연동을 마쳤습니다.
  - 검증: 여성 및 소아 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: 38bc8c01e6c25013cc80251805662c2e3ac753e2

- 작업 ID: CONTENT-005-digestion
  - 변경: [CONTENT-005-digestion] 목포 소화불량, 속쓰림, 수족냉증, 손발저림, 만성부종 등의 주요 로컬 키워드 최적화를 위한 소화 및 순환장애 진료 독립 서브페이지(care-digestion.html)를 개설하고 메인 소화 및 순환장애 카드와 연동을 마쳤습니다.
  - 검증: 소화 및 순환장애 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: 542b4f9c75c82c36fee5ef29fca730b726161954

- 작업 ID: CONTENT-004-diet
  - 변경: [CONTENT-004-diet] 목포 다이어트 한의원 체질 맞춤 한약 치료 등 주요 비만 키워드 노출 극대화를 위한 다이어트 독립 페이지(care-diet.html)를 개설하고 메인 다이어트 카드와 연동을 마쳤습니다.
  - 검증: 다이어트 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: 6d6880fba075ee3f6964dd18e597c3034de25ff6

- 작업 ID: CONTENT-001
  - 변경: [CONTENT-001] 목포 허리디스크, 목디스크, 협착증 등의 주요 로컬 키워드 타겟팅을 위한 척추 진료 독립 서브페이지(care-spine.html)를 개설하고 메인 척추 카드와 연동을 마쳤습니다.
  - 검증: 척추 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: ec146acfaae17a8d9bf905e62a74d4159af7ae96

- 작업 ID: CONTENT-002
  - 변경: [CONTENT-002] 목포 어깨통증, 무릎통증, 오십견 등 주요 관절 질환 키워드 최적화를 위한 관절 진료 독립 서브페이지(care-joint.html)를 개설하고 메인 관절 카드와 연동을 마쳤습니다.
  - 검증: 관절 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: ec146acfaae17a8d9bf905e62a74d4159af7ae96

- 작업 ID: CONTENT-003
  - 변경: [CONTENT-003] 목포 교통사고 후유증, 목통증, 허리통증, 두통, 어지럼증 등 주요 후유증 키워드 노출 극대화를 위한 교통사고 진료 독립 서브페이지(care-accident.html)를 개설하고 메인 교통사고 카드와 연동을 마쳤습니다.
  - 검증: 교통사고 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: ec146acfaae17a8d9bf905e62a74d4159af7ae96

- 작업 ID: CONTENT-004
  - 변경: [CONTENT-004] 목포 스포츠 손상 인대·근육·힘줄 파열 및 엘보 등 주요 부상 키워드 노출 극대화를 위한 스포츠 손상 진료 독립 서브페이지(care-sports.html)를 개설하고 메인 스포츠 손상 카드와 연동을 마쳤습니다.
  - 검증: 스포츠 손상 카드 내 연동 링크 클릭성 및 서브페이지 내 상단 헤더/하단 푸터 정상 동작 수동 검증 완료
  - 배포 commit: ec146acfaae17a8d9bf905e62a74d4159af7ae96

## 2026-08-25 — 홈페이지 AEO 최적화, FAQ, 개인정보처리방침 및 llms.txt 적용 완료

- 작업 ID: AEO-003
  - 변경: [AEO-003] 홈페이지 하단 예약 안내 영역 뒤에 자주 묻는 질문(FAQ) 10가지를 좌우 2단 다중 열 구조의 네이티브 아코디언(<details>) UI로 추가하여 화면 높이를 줄이고 가독성을 높였습니다.
  - 검증: index.html 마크업 유효성 및 styles.css 반응형 스타일 수동 검증 완료
  - 배포 commit: 3926bf620d2abb70ba36036cc9239e59ae45e8e9

- 작업 ID: AEO-004
  - 변경: [AEO-004] 자주 묻는 질문 10가지에 부합하는 FAQPage JSON-LD 구조화 데이터를 head 영역에 삽입했습니다.
  - 검증: JSON-LD 구문 유효성 검토 및 본문 텍스트와의 100% 일치성 검증 완료
  - 배포 commit: 3926bf620d2abb70ba36036cc9239e59ae45e8e9

- 작업 ID: AEO-005
  - 변경: [AEO-005] 의료법 및 개인정보보호법에 준하는 개인정보처리방침 독립 페이지(privacy.html)를 구축하고 홈페이지 푸터에 링크를 연동했습니다. 개인정보처리방침 링크 클릭 시 새 탭이나 페이지 전환 대신 독립된 새 팝업 창(window.open)으로 뜨도록 보완하고 팝업 내 버튼을 '창 닫기' 기능으로 개선했습니다.
  - 검증: privacy.html 단독 가독성, window.open 동작 및 창 닫기 기능 수동 검증 완료
  - 배포 commit: 2998173 (PR #18)

- 작업 ID: AEO-006
  - 변경: [AEO-006] AI 크롤러 및 LLM 대응을 위한 요약 정보 파일(llms.txt)을 생성했습니다.
  - 검증: 파일 포맷 유효성 및 기재 정보의 정합성 정적 검토 완료
  - 배포 commit: 056c5de (PR #17)


## 2026-08-04 — WebSite 및 Organization 구조화 데이터 적용 완료

- 작업 ID: AEO-002
- 변경: [AEO-002] schema.org 표준에 따른 WebSite 및 Organization JSON-LD 구조화 데이터를 홈페이지 head 내 주입 완료했습니다.
- 검증: index.html 내 JSON-LD Graph 구문 규격 및 상호 링크 정합성 검토 완료
- 배포 commit: (main 병합 시 확정)

## 2026-08-04 — MedicalClinic 구조화 데이터 적용 완료

- 작업 ID: AEO-001
- 변경: [AEO-001] schema.org 표준에 따른 MedicalClinic 및 LocalBusiness JSON-LD 구조화 데이터를 홈페이지 head 내 주입 완료했습니다.
- 검증: index.html 내 JSON-LD 구문 규격 및 우편번호 58658 정합성 검토 완료
- 배포 commit: a07ac730a8c51b9801add66574546e57f61f4d5d

## 2026-08-04 — SNS 공유 카드 렌더링 검수 완료

- 작업 ID: SEO-008
- 변경: [SEO-008] 카카오톡, 페이스북, 블로그 공유 카드 메타태그와 이미지(og-image.png) 실시간 서빙 및 수동 검수를 완료했습니다.
- 검증: 운영 사이트 HTML 원문 파싱 대조 및 이미지 200 OK 상태 검증 완료
- 배포 commit: dd0b76add7743780ed6342375d44f05fcae68fdc

## 2026-08-04 — SNS 공유 메타태그 및 대표 이미지 추가 완료

- 작업 ID: SEO-007
- 변경: [SEO-007] 카카오톡, X, 블로그 공유를 위한 Open Graph 및 Twitter Card 메타태그와 대표 로고 이미지(og-image.png)를 추가했습니다.
- 검증: index.html 내 og/twitter 태그 구문 정합성 및 대표 이미지 로컬 추가 검증 완료
- 배포 commit: a4b2a6eb0280a536fc0984a08d5d5eb307d577be

## 2026-08-04 — 홈페이지 메타 설명문 최적화 완료

- 작업 ID: SEO-006
- 변경: [SEO-006] 홈페이지의 `<meta name="description">` 태그를 상세 치료과목 및 진료일정을 결합한 최적화 문구로 변경했습니다.
- 검증: index.html 내 meta description 변경 정합성 및 의료광고 가이드라인 준수 여부 정적 검증 완료
- 배포 commit: 812700b1abfe400750aa1e3636efb20b9ea28871

## 2026-08-03 — 홈페이지 메타 타이틀 최적화 및 사이트맵 연동 완료

- 작업 ID: SEO-005
- 변경: [SEO-005] 홈페이지의 `<title>` 메타 태그를 타겟팅 지역 및 주요 진료과목을 포함한 최적화 문구로 변경했습니다.
- 검증: index.html 내 title 교체 정합성 검토 및 의료 광고 가이드 준수 여부 정적 검증 완료
- 배포 commit: 129c604faae17a8d9bf905e62a74d4159af7ae96

- 작업 ID: SEO-004
- 변경: [SEO-004] sitemap.xml을 생성하고 robots.txt에 사이트맵 경로를 등록했습니다.
- 검증: sitemap.xml 생성 및 XML 선언/네임스페이스/loc/lastmod 정합성 검토, robots.txt 내 Sitemap 지시어 추가 검증 완료
- 배포 commit: e2dc10f29a3f3374da5d54ace09ada02d93802c0

- 작업 ID: SEO-003
- 변경: [SEO-003] 검색엔진 크롤러 수집 허용을 명시하는 robots.txt를 추가했습니다.
- 검증: robots.txt 생성 여부, User-agent, Allow 규칙 및 Disallow/Sitemap 부재 여부 정적 검증 완료
- 배포 commit: d553c1b5c751bf2bd547396167e03bf69534d36f

- 작업 ID: SEO-002
- 변경: [SEO-002] 부부한의원 홈페이지의 canonical URL을 `https://booboo.co.kr/` 기준으로 명시했습니다.
- 검증: index.html head 내 canonical 추가 여부, HTTPS non-www trailing slash 기준 정합성 검증 완료
- 배포 commit: 4b0ddb85abe3d0668225806fe5ec0f63e8aab811

- 작업 ID: SEO-001
- 변경: HTTP 요청을 HTTPS 공식 도메인으로 안전하게 강제 리디렉션하는 기술적 검증 완료 및 로그 작성
- 검증: curl.exe를 통한 HTTP header, Location, redirect chain, 정적 리소스 경로 보존 여부 검증
- 배포 commit: 8c2d44f18d2e07189e96f198e983617cb0f44984

- 작업 ID: SEO-000
- 변경: 2026-07-25 수행한 초기 SEO/AEO 기준 점수(35점) 및 저장소 파일 기반 기술 검증 완료
- 검증: 기술적 SEO/온페이지/AEO 구성요소 비파괴 분석 및 점수 검산
- 배포 commit: 7c626c5341493468f76c99c844cf5a9bbfba6c19

- 작업 ID: OPS-003
- 변경: 장애 복구 및 롤백 안정을 위한 BACKUP_AND_ROLLBACK.md 가이드 생성
- 검증: 가이드 내 명령어 정합성 검토 및 비파괴 검증 절차 수립
- 배포 commit: 0e95c7d21bd95bcfb493251ca4240a0d6915cf17

- 작업 ID: OPS-002
- 변경: 현재 홈페이지의 GitHub Pages 배포 방식 분석 및 DEPLOYMENT.md 작성
- 검증: 문서 내 직접 확인된 사실과 추정/수동 확인 항목 명확한 구분 검증
- 배포 commit: 1e4e44720230436127ce7486af78dbd641762cfc

- 작업 ID: OPS-001
- 변경: AI 코딩 도구와 여러 컴퓨터에서 이어서 작업하기 위한 문서·Issue·PR 템플릿 추가
- 검증: 문서 파일 구조 및 민감정보 포함 여부 확인
- 배포 commit: c11e55d9851ea3ca6372ed2307305513889d0020
