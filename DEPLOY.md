# 🚀 배포 가이드

## 개요
Rara Calendar는 **GitHub Actions** + **Netlify**를 통한 자동 배포를 지원합니다.

## 1️⃣ 초기 설정

### GitHub 저장소 설정
```bash
# 저장소에 Netlify 연동
# GitHub Settings → Secrets and variables → Actions
# 다음 시크릿 추가:
# - NETLIFY_AUTH_TOKEN: Netlify 계정의 Personal Access Token
# - NETLIFY_SITE_ID: Netlify 사이트의 ID
```

### Netlify에서 토큰 생성
1. [Netlify Account Settings](https://app.netlify.com/user/settings/applications#personal-access-tokens)
2. **Create new token** → **Personal access tokens** 섹션
3. 토큰 복사하여 GitHub Secrets에 저장 (`NETLIFY_AUTH_TOKEN`)

### Netlify 사이트 ID 찾기
```bash
# Netlify 사이트 설정 → General → Site information
# Site ID를 GitHub Secrets에 저장 (NETLIFY_SITE_ID)
```

## 2️⃣ 자동 배포 프로세스

### GitHub Actions 워크플로우
파일: `.github/workflows/deploy.yml`

**트리거:**
- `main` 브랜치에 push 시 자동 배포
- PR 생성 시 프리뷰 배포

**단계:**
1. Node.js 18 설정
2. 패키지 설치 (`npm ci`)
3. 프론트엔드 빌드 (`npm run build`)
4. Netlify에 배포 (`dist/` 디렉토리)

## 3️⃣ 수동 배포

### Netlify CLI로 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 프로젝트 연결
cd frontend
netlify init

# 배포
netlify deploy --prod
```

## 4️⃣ 배포 확인

### 배포 상태 확인
```bash
# GitHub Actions
https://github.com/copyfeel/rara-calendar/actions

# Netlify 대시보드
https://app.netlify.com/
```

### 프리뷰 URL
- PR 생성 시 자동으로 프리뷰 URL 생성
- GitHub PR 코멘트에서 확인 가능

## 5️⃣ 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 먼저 테스트
cd frontend
npm run build

# 에러 확인 및 수정
# 수정 후 커밋
git add .
git commit -m "fix: build error"
git push
```

### 배포되지 않음
1. **GitHub Secrets 확인**
   - `NETLIFY_AUTH_TOKEN` 설정됨?
   - `NETLIFY_SITE_ID` 설정됨?

2. **Netlify 사이트 확인**
   - 사이트가 실제로 생성됨?
   - 배포 로그 확인

3. **GitHub Actions 로그 확인**
   - Actions 탭에서 실패 원인 확인

## 6️⃣ 환경 변수 (필요시)

### `.env.production`
```env
VITE_API_URL=https://api.example.com
# 기타 프로덕션 환경 변수
```

## 7️⃣ 최적화 설정

### 캐싱 전략 (netlify.toml)
- **정적 자산**: 1년 캐싱 (`/assets/*`)
- **HTML**: 캐싱 안 함 (최신 버전 보장)

### 성능 최적화
- **소스맵 비활성화**: 번들 크기 감소
- **콘솔 로그 제거**: 프로덕션 빌드에서 자동 제거
- **Terser 압축**: 자동 최소화

## 8️⃣ 도메인 연결

### 커스텀 도메인 설정
1. Netlify 대시보드 → Site settings → Domain management
2. **Custom domain** → 도메인 추가
3. DNS 설정 변경

## 📋 체크리스트

- [ ] GitHub Secrets 설정 (NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID)
- [ ] Netlify 사이트 생성 및 연동
- [ ] 로컬 빌드 테스트 (`npm run build`)
- [ ] `main` 브랜치에 커밋 후 배포 확인
- [ ] 배포된 사이트 방문하여 기능 확인
- [ ] 커스텀 도메인 연결 (선택)

## 🔗 유용한 링크

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Netlify Docs](https://docs.netlify.com/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
