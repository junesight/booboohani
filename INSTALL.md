# 설치 안내

이 패키지는 기존 부부한의원 홈페이지 GitHub 저장소에 **추가**하는 운영 문서 모음입니다.

## 적용 전 주의

- 기존 `README.md`, `.gitignore`, `CHANGELOG.md`를 자동으로 덮어쓰지 않습니다.
- 실제 API 키, 비밀번호, 환자·직원 정보는 GitHub에 올리지 않습니다.
- 기존 저장소가 공개라면 `docs/`에도 공개 가능한 정보만 기록합니다.

## 복사할 파일

패키지 폴더의 내용을 기존 저장소 최상위에 복사합니다.

```text
기존-홈페이지-저장소/
├── AGENTS.md
├── .env.example
├── .github/
└── docs/
```

선택 파일:

- `CHANGELOG_TEMPLATE.md`: 기존 `CHANGELOG.md`가 없을 때 내용을 복사해 `CHANGELOG.md`로 이름을 바꿉니다.
- `gitignore.snippet`: 필요한 줄만 기존 `.gitignore`에 추가합니다.

## 첫 커밋 예시

```bash
git switch main
git pull --ff-only origin main
git switch -c chore/add-ai-workflow-docs
git add AGENTS.md .github docs .env.example CHANGELOG_TEMPLATE.md gitignore.snippet
git commit -m "docs: add AI collaboration workflow"
git push -u origin chore/add-ai-workflow-docs
```

Pull Request 검수 후 `main`에 병합합니다.

## 적용 후 반드시 맞춤 수정할 곳

1. `AGENTS.md`의 실제 실행·빌드·검사 명령어
2. `docs/DEPLOYMENT_CHECKLIST.md`의 실제 배포 플랫폼
3. `docs/SEO_BASELINE.md`의 재검수 날짜와 실측값
4. `.env.example`의 실제 환경변수 이름
