# 변경 이력

이 파일은 사용자에게 영향을 주는 운영 사이트 변경을 기록합니다.

형식은 `날짜 / 작업 ID / 변경 내용 / 검증 / 배포 commit` 순서로 작성합니다.

## 미배포

### 추가

### 변경

### 수정

## 2026-08-25 — 홈페이지 FAQ 및 FAQPage JSON-LD 구조화 데이터 적용 완료

- 작업 ID: AEO-003
  - 변경: [AEO-003] 홈페이지 하단 예약 안내 영역 뒤에 자주 묻는 질문(FAQ) 10가지를 네이티브 아코디언(<details>) UI로 추가했습니다.
  - 검증: index.html 마크업 유효성 및 styles.css 반응형 스타일 수동 검증 완료
  - 배포 commit: e2f916b1a734b25c23da68c501b5ae0ebbd3d08d

- 작업 ID: AEO-004
  - 변경: [AEO-004] 자주 묻는 질문 10가지에 부합하는 FAQPage JSON-LD 구조화 데이터를 head 영역에 삽입했습니다.
  - 검증: JSON-LD 구문 유효성 검토 및 본문 텍스트와의 100% 일치성 검증 완료
  - 배포 commit: e2f916b1a734b25c23da68c501b5ae0ebbd3d08d


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
