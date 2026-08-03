# SEO 검증 로그

이 문서는 부부한의원 홈페이지 개선 과정에서 수행된 각 SEO/AEO 검증 태스크의 실행 이력과 결과를 기록하는 로그입니다.

---

## [SEO-001] HTTP → HTTPS 리디렉션 검증

- **검증일**: 2026-08-03
- **기준 main commit**: `7c626c5341493468f76c99c844cf5a9bbfba6c19`
- **검증 대상**: 
  - `http://booboo.co.kr/` (루트 도메인 HTTP 요청)
  - `http://booboo.co.kr/styles.css` (하위 경로 정적 파일 HTTP 요청)
- **최종 판정**: **통과 (PASS)**

### 1. 실행 명령 및 원문 응답

#### 루트 도메인 HTTP 헤더 검증 (`curl.exe -I http://booboo.co.kr/`)
```text
HTTP/1.1 301 Moved Permanently
Connection: keep-alive
Content-Length: 162
Server: GitHub.com
Content-Type: text/html
Location: https://booboo.co.kr/
...
```
- **최초 HTTP 상태 코드**: `301 Moved Permanently`
- **Location 헤더**: `https://booboo.co.kr/`

#### 루트 도메인 리디렉션 체인 검증 (`curl.exe -IL http://booboo.co.kr/`)
- 1단계: `http://booboo.co.kr/` -> `301 Moved Permanently`
- 2단계: `https://booboo.co.kr/` -> `200 OK` (최종 상태 코드: `200 OK`)
- **리디렉션 루프 여부**: 없음 (1회 리디렉션 후 즉시 200 OK 도달)

#### HTTPS 직접 접속 헤더 검증 (`curl.exe -I https://booboo.co.kr/`)
```text
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 97132
Server: GitHub.com
Content-Type: text/html; charset=utf-8
...
```
- **인증서 오류 여부**: 없음 (HTTPS 요청이 보안 경고 없이 200 OK로 정상 성공)

#### 정적 파일 경로 보존 검증 (`curl.exe -IL http://booboo.co.kr/styles.css`)
```text
HTTP/1.1 301 Moved Permanently
Location: https://booboo.co.kr/styles.css

HTTP/1.1 200 OK
Content-Type: text/css; charset=utf-8
...
```
- **경로 보존 결과**: **보존됨** (`/styles.css` 요청이 유실 없이 HTTPS 도메인의 동일 경로인 `https://booboo.co.kr/styles.css`로 리디렉션됨)

### 2. 판정 근거
- GitHub Pages의 `Enforce HTTPS` 기능이 정상 활성화되어 있어 모든 HTTP 요청에 대해 브라우저 표준에 부합하는 `301 Permanent Redirect`가 정상 응답됩니다.
- 리디렉션 타겟 도메인(`Location` 헤더)이 공식 주소인 `https://booboo.co.kr/`와 완벽히 일치하며 불필요한 서브도메인(www 등)으로 우회하지 않습니다.
- SSL/TLS 인증서가 정상 유효하여 최종 HTTPS 응답이 `200 OK`로 성공합니다.
- 하위 리소스 경로인 `/styles.css` 역시 리디렉션 과정에서 경로 손실 없이 HTTPS의 동일 경로로 안전하게 이관됨을 확인했습니다.

### 3. 작업 정보
- **관련 작업 브랜치**: `docs/seo-001-verify-https-redirect`
- **커밋 해시**: 8c2d44f18d2e07189e96f198e983617cb0f44984

---

## [SEO-002] canonical URL 통일

- **검증일**: 2026-08-03
- **공식 canonical 기준 URL**: `https://booboo.co.kr/`
- **수정 파일**: [index.html](file:///C:/Users/user/.gemini/antigravity/scratch/booboohani/index.html)
- **최종 판정**: **PASS**

### 1. 검증 결과
- [x] **canonical 태그 추가**: `index.html` 내 `<link rel="canonical" ...>` 태그 정상 삽입 완료.
- [x] **canonical 값 정합성**: 지정된 공식 대표 주소인 `https://booboo.co.kr/` (HTTPS 적용, non-www, trailing slash 포함)과 완벽히 일치함.
- [x] **`<head>` 내부 위치**: charset, viewport, title 메타 태그 바로 하단인 `<head>` 영역 내부(6라인)에 정상 배치됨.
- [x] **중복 태그 없음**: 동일 문서 내 canonical 선언 태그가 1개만 유일하게 존재하는 것을 확인함.
- [x] **CSS/JS/assets 변경 없음**: 홈페이지 렌더링 및 기능 오작동 영향도가 전혀 없음을 대조 검토 완료.
- [x] **CNAME 변경 없음**: 루트 CNAME 파일 변경 없음.

### 2. 수동 확인 항목 (운영 반영 후)
- [ ] PR 병합 완료 후, 실제 서비스 운영 도메인(`https://booboo.co.kr/`)에 브라우저로 접속하여 페이지 소스(F12) 내에 `<link rel="canonical" href="https://booboo.co.kr/">` 태그가 정확히 반영되었는지 수동으로 교차 검증을 진행해야 합니다.

---

## [SEO-003] robots.txt 생성 및 검증

- **검증일**: 2026-08-03
- **생성 파일**: `robots.txt`
- **robots.txt 목적**: 검색엔진 크롤러의 사이트 전체 수집 허용 명시
- **Sitemap 라인 제외 사유**: `sitemap.xml` 파일이 아직 생성되지 않았으므로 후속 sitemap 작업에서 추가 예정
- **최종 판정**: **PASS**

### 1. 검증 결과
- [x] **robots.txt 파일 생성**: 저장소 최상위 루트 디렉토리에 `robots.txt` 파일 신규 추가 완료.
- [x] **User-agent 규칙 확인**: `User-agent: *` 규칙이 명시되어 전 세계 모든 검색엔진 크롤러에 대한 규칙 정의 확인.
- [x] **Allow 규칙 확인**: `Allow: /` 규칙이 명시되어 웹사이트 전체 수집 허용 확인.
- [x] **Disallow 규칙 없음**: 차단 설정 라인(`Disallow:`)이 존재하지 않는 것을 확인.
- [x] **Sitemap 라인 없음**: 존재하지 않는 사이트맵 주소가 기재되지 않았음을 확인.
- [x] **index.html 변경 없음**: 메인 마크업 파일 변경 없음.
- [x] **styles.css 변경 없음**: 스타일시트 변경 없음.
- [x] **script.js 변경 없음**: 스크립트 파일 변경 없음.
- [x] **assets 변경 없음**: 이미지 등 에셋 자원 변경 없음.
- [x] **CNAME 변경 없음**: 루트 CNAME 파일 변경 없음.

### 2. 수동 확인 항목 (운영 반영 후)
- [ ] PR 병합 완료 후, 실제 서비스 운영 도메인의 robots.txt 경로(`https://booboo.co.kr/robots.txt`)에 브라우저로 직접 접속합니다.
- [ ] 응답 코드가 `200 OK` 인지 확인합니다.
- [ ] 출력된 내용이 `User-agent: *` 및 `Allow: /` 와 일치하는지 최종 확인합니다.
