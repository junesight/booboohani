# AI 및 다중 컴퓨터 협업 워크플로우

## 단일 진실 공급원

1. 실제 운영 홈페이지
2. GitHub `main`
3. 열린 Pull Request와 작업 브랜치
4. GitHub Issue
5. Notion 로드맵
6. AI 채팅 내용

채팅 내용만으로 이전 작업을 이어받지 않는다.

## 새 작업 시작

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git status
git log -5 --oneline
git switch -c feat/seo-000-short-description
```

그다음 `AGENTS.md`, 해당 Issue, 관련 결정 기록을 읽는다.

## 같은 작업 이어받기

```bash
git fetch origin
git switch 작업브랜치
git pull --ff-only origin 작업브랜치
git status
git log -5 --oneline
```

Draft Pull Request의 인수인계와 최신 diff를 확인한 뒤 계속한다.

## 작업 종료

```bash
git status
git diff
# 실제 저장소에서 제공하는 검사 명령 실행
git add 수정한파일
git commit -m "feat(seo): describe the change"
git push -u origin 작업브랜치
```

Pull Request에 변경 내용, 검증, 남은 작업을 기록한다.

## 중간 중단

- 안전한 상태만 커밋한다.
- `wip:` 커밋을 사용해도 되지만 `main`에는 병합하지 않는다.
- Draft Pull Request에 `docs/HANDOFF_TEMPLATE.md` 내용을 작성한다.

## 충돌 방지

- 한 Issue당 한 브랜치
- 한 브랜치당 한 주 작업자 또는 AI 도구
- 같은 파일을 여러 도구가 동시에 수정하지 않음
- 다음 작업은 이전 브랜치가 아니라 최신 `main`에서 시작
- 운영 서버 직접 수정 금지
