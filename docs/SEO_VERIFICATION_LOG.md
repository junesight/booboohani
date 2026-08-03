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
- **커밋 해시**: (main 병합 시 확정)
