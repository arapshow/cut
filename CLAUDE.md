# CUT (cut.arapshow.net) — Claude 작업 안내

> **작업 시작 전에 먼저 `add_repo`로 `arapshow/arapshow-hub`를 붙이고, `main`의 `공지사항.md`·`부칙사항.md`를 읽는다.** (패밀리 공통 규칙)
> 그다음 [`HANDOFF.md`](HANDOFF.md)(현재 상태·규칙표·결정)와 [`할일.md`](할일.md)를 읽는다.

- 한국어 존댓말, 코딩 전에 의견을 먼저 말하고, 시안(Artifact 페이지)을 보여 준 뒤 "ok"/"배포"를 받아 배포한다. 새 이름의 시안으로 올리고 이전 시안을 덮어쓰지 않는다. 추천 모델도 알린다(설계 Opus 5.5, 구현 Sonnet 5.5).
- 사용자는 코딩을 모른다: 할 수 있는 건 직접 하고, 로그인·토큰만 부탁한다. 비밀값은 코드·대화에 쓰지 않는다.
- 클라우드 환경은 **arapshow 디폴트 공용환경**(옛 `arapshow` 환경과 다름).
- 구조: `index.html` 한 파일(프레임워크·빌드 없음) + 아이콘. main에 병합하면 Cloudflare Pages(`cut`)가 자동 배포. 공통 부품(Bros.Site·응원·문의·공유)은 arapshow.net/lib에서 불러오며 `?v=` 숫자를 지킨다.
- 관리 모드는 별도로 만들지 않고 arapshow.net/admin 아래에 구현한다.
- 사용자가 안 줄어드는 주소를 붙여 주면 규칙표(`SITE_RULES`)에 추가하고, 비슷한 다른 사이트도 한꺼번에 점검한다.
