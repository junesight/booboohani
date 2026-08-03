# 부부한의원 홈페이지 배포 문서

이 문서는 부부한의원 홈페이지의 배포 방식, 인프라 구조, 배포 절차 및 복구 방법을 정의한 문서입니다.

## 1. 개요 및 기술 구조
- **운영 도메인**: `https://booboo.co.kr` (CNAME 파일 및 리다이렉션 기반)
- **홈페이지 기술 구조**: 
  - `index.html` (메인 웹페이지)
  - `script.js` (동적 기능 제어)
  - `styles.css` (스타일 및 레이아웃 정의)
  - `assets/` (이미지, 폰트 등의 정적 리소스)
  - 별도의 백엔드 서버나 데이터베이스가 없는 순수 정적 웹 애플리케이션(Static Site).
- **저장소 구조**:
  ```text
  booboohani/
  ├── .agents/          # AI 에이전트 설정 및 실행 지침
  ├── .github/          # GitHub Issue/PR 템플릿
  ├── assets/           # 이미지 등 정적 리소스 디렉토리
  ├── docs/             # 협업 워크플로우, 로드맵, 배포 가이드 등 문서 디렉토리
  ├── CNAME             # GitHub Pages 커스텀 도메인 설정 파일
  ├── index.html        # 메인 마크업
  ├── script.js         # 프론트엔드 자바스크립트
  └── styles.css        # 메인 스타일시트
  ```
- **빌드 과정 유무**: **없음**. (정적 파일을 그대로 서비스하므로 webpack, vite, npm build 등의 빌드 과정이나 컴파일 과정이 필요하지 않음)

---

## 2. 배포 방식 분석
- **현재 확인된 배포 방식**: **GitHub Pages를 통한 정적 배포**
  - 저장소 최상위에 `CNAME` 파일이 존재하고, `package.json`이나 배포 자동화 액션(GitHub Actions Workflow)이 지정되어 있지 않은 점으로 보아, GitHub의 기본 기능인 GitHub Pages의 브랜치 배포 방식을 사용하는 것으로 확인됩니다.
- **CNAME의 역할**:
  - 파일 내용: `booboo.co.kr`
  - 역할: GitHub Pages 웹 서버가 이 저장소의 내용을 `https://booboo.co.kr` 도메인 요청과 연결하도록 매핑해 줍니다. DNS 측면에서 해당 도메인에 대한 가상 호스트(Vhost) 역할을 보장합니다.
- **배포 트리거 추정**:
  - GitHub Pages의 일반적인 동작에 따라, 설정된 배포 대상 브랜치(주로 `main` 브랜치)에 신규 커밋이 푸시(push)되거나 머지(merge)될 때 GitHub Pages 배포 러너가 자동으로 트리거되어 정적 파일을 서빙용 CDN에 동기화할 것으로 추정됩니다.

---

## 3. GitHub Settings → Pages 수동 확인 항목 (확정 불가 사항)
*저장소 내 파일 상태만으로는 GitHub 레포지토리의 웹 관리 화면 설정을 확정할 수 없으므로, 작업자는 GitHub 레포지토리 웹 UI에서 아래 항목들을 직접 수동 검증해야 합니다.*

| 항목 | 확인 경로 | 설명 / 확인해야 할 상태 |
|---|---|---|
| **배포 Source** | Settings -> Pages -> Build and deployment -> Source | `Deploy from a branch`로 설정되어 있는지 확인 필요. |
| **배포 Branch** | Settings -> Pages -> Build and deployment -> Branch | 배포 기준 브랜치가 `main`으로 설정되어 있는지 확인 필요. |
| **배포 Folder** | Settings -> Pages -> Build and deployment -> Folder | 배포 대상 폴더가 루트(`/ (root)`)로 지정되어 있는지 확인 필요. |
| **Custom domain 설정 상태** | Settings -> Pages -> Custom domain | `booboo.co.kr`이 정상 등록되어 있고 DNS check가 통과했는지 확인 필요. |
| **Enforce HTTPS 활성화 상태** | Settings -> Pages -> Custom domain | `Enforce HTTPS` 체크박스가 활성화(Checked)되어 서비스 전체가 HTTPS로 강제 리디렉션되는지 확인 필요. |
| **DNS 레코드 설정** | DNS 호스팅 업체 관리 화면 | `booboo.co.kr` 도메인의 A 레코드나 CNAME 레코드가 GitHub Pages IP/도메인(`junesight.github.io`)을 올바르게 바라보고 있는지 수동 확인 필요. |
| **배포 완료 시간** | GitHub Actions 탭 / 배포 로그 | 변경 사항 푸시 후 실제 반영 완료까지 소요되는 실측 시간 확인 필요 (일반적으로 1~3분 소요로 추정). |

---

## 4. 배포 전후 및 검증 절차

### 배포 전 절차 (Pre-deployment)
1. **최신 코드 확보**: `main` 브랜치 최신화 및 신규 작업 전 전용 브랜치(`feat/`, `fix/` 등) 생성.
2. **로컬 검증**:
   - 브라우저로 `index.html` 파일을 로컬에서 열어 변경 사항이 데스크톱 및 모바일 뷰포트에서 깨지지 않고 정상 작동하는지 확인.
   - 개발자 도구(F12) 콘솔에 에러나 경고 메시지가 없는지 점검.
3. **민감정보 유출 점검**: 코드에 비밀번호, API 키, 개인정보 등이 하드코딩되지 않았는지 확인.
4. **의료 광고법/콘텐츠 가이드 점검**: `AGENTS.md` 5항의 금지 표현(`완치`, `100%`, `보장` 등) 사용 여부 확인 및 의료진 최종 검수.
5. **체크리스트 확인**: `docs/DEPLOYMENT_CHECKLIST.md`에 명시된 배포 전 체크리스트 항목 점검.

### 배포 후 검증 절차 (Post-deployment)
1. **서비스 가동 확인**: 브라우저 시크릿 창을 열어 `https://booboo.co.kr`에 접속한 뒤 메인 페이지가 잘 열리는지 확인.
2. **강제 HTTPS 및 Canonical 검증**:
   - `http://booboo.co.kr` 접속 시 `https://booboo.co.kr`로 자동 301 리디렉션되는지 확인.
   - HTML 소스 내 `<link rel="canonical" href="https://booboo.co.kr/">`이 올바르게 명시되어 있는지 확인.
3. **핵심 기능 작동 점검**: 전화 걸기 버튼 링크, 네이버 예약/플레이스 링크, 지도 안내 동선 작동 여부 수동 테스트.
4. **콘솔 오류 검사**: F12 개발자 도구에서 리소스 로딩 에러(404)나 스크립트 런타임 에러가 없는지 최종 확인.

---

## 5. 장애 발생 시 복구 절차
GitHub Pages 배포 후 사이트가 먹통이 되거나 잘못된 정보가 표시되는 경우 아래 절차에 따라 즉각 대처합니다.

1. **상태 진단**:
   - GitHub Pages 빌드 실패인 경우: 레포지토리의 `Actions` 탭에서 배포 액션 실패 로그 확인.
   - 화면 레이아웃 에러 또는 스크립트 오작동인 경우: F12 콘솔 에러 메시지 분석.
2. **신속 롤백 (Git Revert)**:
   - 문제를 유발한 커밋을 파악하여 `git revert <commit_hash>` 실행 후 즉각 `main` 브랜치에 푸시.
   - 긴급 상황일 경우, 직전 성공 상태의 커밋으로 브랜치 헤드를 리셋하여 강제 푸시(`git push -f origin <commit_hash>:main`) 검토. (주의: 강제 푸시는 팀원 간 동기화 문제를 야기하므로 최후의 수단으로 사용하고 리버트를 우선 권장).
3. **배포 재확인**:
   - 롤백 커밋이 푸시된 후 GitHub Pages 배포 완료를 확인하고, 브라우저 캐시를 삭제(Ctrl + F5)한 후 복구 여부 검증.

---

## 6. 아직 확인되지 않은 항목 (미확정 항목)
- GitHub Pages의 빌드 및 배포 소스로 `GitHub Actions`를 사용하는 사용자 정의 워크플로우가 레포지토리 외부에 별도로 존재하는지 여부.
- 도메인 네임서버(DNS) 대행 업체 및 설정 권한 소유자 정보.
- GitHub Pages에 매핑된 커스텀 도메인(`booboo.co.kr`)의 SSL 인증서 갱신 자동화 여부.
