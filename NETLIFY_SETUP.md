# 🔑 Netlify Personal Access Token 생성 및 GitHub Secrets 설정 - 상세 가이드

## 📌 목표
Netlify에서 Personal Access Token을 생성하고, 이를 GitHub에 저장하여 자동 배포를 활성화합니다.

---

## 1️⃣ Netlify Personal Access Token 생성 (상세)

### Step 1: Netlify 계정 접속
```
🔗 URL: https://app.netlify.com
```

**하는 일:**
1. Netlify 공식 사이트 방문
2. 로그인 (GitHub, Google, Netlify 계정)
3. 대시보드 진입

**스크린샷 참고:**
- Netlify 로그인 후 화면 우상단에 본인 프로필 사진/아이콘 보임

---

### Step 2: Account Settings 접속
```
URL: https://app.netlify.com/user/settings/applications
```

**네비게이션 경로:**
```
우상단 프로필 아이콘 
  ↓
"User settings" 클릭
  ↓
좌측 메뉴 "Applications" 또는 "Integrations" 클릭
  ↓
"Personal access tokens" 섹션 찾기
```

**또는 직접 URL 복사:**
```
https://app.netlify.com/user/settings/applications#personal-access-tokens
```

**화면 구성:**
```
┌─────────────────────────────────────────┐
│ User Settings                           │
├─────────────────────────────────────────┤
│ 좌측 메뉴:                              │
│  • Account                              │
│  • Applications  ← 여기 클릭            │
│  • Billing                              │
│  • Teams                                │
├─────────────────────────────────────────┤
│ 메인 콘텐츠:                            │
│ Personal access tokens                  │
│ [Create new token] 버튼 ← 여기!        │
└─────────────────────────────────────────┘
```

---

### Step 3: "Create new token" 버튼 클릭

**화면에 보이는 것:**
```
Personal access tokens
─────────────────────────────────────
These tokens are used by third-party services
to access your Netlify account. Create a new
token to give others (or automated services)
limited access to your account.

[Create new token] ← 이 버튼 클릭
```

**클릭하면:**
- 토큰 생성 다이얼로그 또는 페이지 나타남

---

### Step 4: 토큰 정보 입력

**입력 폼 예시:**
```
┌─────────────────────────────────────────┐
│ Create a new token                      │
├─────────────────────────────────────────┤
│                                         │
│ Description (설명):                     │
│ ┌─────────────────────────────────────┐ │
│ │ GitHub Actions Deployment           │ │
│ └─────────────────────────────────────┘ │
│ (자유롭게 작성. 용도를 알기 쉽게)      │
│                                         │
│ [Generate token] 버튼                  │
│                                         │
└─────────────────────────────────────────┘
```

**입력할 내용:**
```
Description: GitHub Actions Deployment
또는: rara-calendar GitHub Auto Deploy
또는: CI/CD Token for rara-calendar
```

**Scopes/권한 설정:**
- 일반적으로 기본값으로 충분 (모든 권한 허용)
- 필요시 "API token" 또는 "Deploy token" 선택

---

### Step 5: 토큰 생성 및 복사

**"Generate token" 클릭 후:**

```
┌──────────────────────────────────────────────────────┐
│ ✅ Token Created Successfully!                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Your new personal access token:                      │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ nf_xAbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCd... │ │
│ │                                    [복사 버튼] ← │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│ ⚠️ 중요: 이 토큰은 한 번만 표시됩니다!              │
│         잃어버리면 새로 생성해야 합니다.           │
│                                                      │
│ [복사 완료] 또는 [I have saved this token]         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**복사하기:**
```
1. 토큰 문자열 옆의 [복사] 버튼 클릭
   또는
2. 토큰 문자열 선택 후 Cmd+C (Mac) / Ctrl+C (Windows)
3. 어딘가에 임시 저장 (메모장, 텍스트 에디터)
```

**⚠️ 주의:**
- 토큰은 **절대 공개하지 마세요**
- GitHub에만 저장하고, 다른 곳에 공유 금지
- 이 창을 닫으면 토큰을 다시 볼 수 없음

---

## 2️⃣ Netlify 사이트 ID 찾기

**함께 필요한 정보: NETLIFY_SITE_ID**

```
URL: https://app.netlify.com/sites
```

**찾는 방법:**

### 방법 1: Netlify 대시보드에서
```
1. https://app.netlify.com 접속
2. "Sites" 메뉴에서 "rara-calendar" 사이트 선택
3. 우상단 또는 설정 페이지에서 "Site ID" 찾기
```

**화면 구성:**
```
┌──────────────────────────────────────┐
│ rara-calendar                        │
├──────────────────────────────────────┤
│ Overview                             │
│ ┌──────────────────────────────────┐ │
│ │ Site information                 │ │
│ │                                  │ │
│ │ Site ID:                         │ │
│ │ abc123xyz-def-456                │ ← 이거!
│ │                                  │ │
│ │ Site name:                       │ │
│ │ rara-calendar-12345              │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 방법 2: Site Settings에서
```
1. Site settings 클릭
2. General 탭
3. Site information 섹션
4. Site ID 복사
```

**Site ID 예시:**
```
abc123xyz-def-456-ghi-789jklmno
(보통 UUID 형식)
```

---

## 3️⃣ GitHub Secrets 설정 (상세)

### Step 1: GitHub 저장소 접속

```
URL: https://github.com/copyfeel/rara-calendar
```

**또는 직접:**
```
https://github.com/copyfeel/rara-calendar/settings/secrets/actions
```

---

### Step 2: Settings 탭 클릭

**GitHub 저장소 페이지:**
```
┌──────────────────────────────────────────────────┐
│ copyfeel / rara-calendar                         │
├──────────────────────────────────────────────────┤
│ Code | Issues | Pull requests | Actions          │
│ Projects | Discussions | Settings ← 여기 클릭   │
└──────────────────────────────────────────────────┘
```

---

### Step 3: Secrets and variables → Actions 메뉴

**Settings 페이지:**
```
좌측 메뉴:
  • General
  • Collaborators and teams
  • Moderation
  • Code security and analysis
  • Secrets and variables ← 여기 클릭
      ├─ Actions
      ├─ Dependabot
      └─ Codespaces

"Actions" 클릭
```

**직접 URL:**
```
https://github.com/copyfeel/rara-calendar/settings/secrets/actions
```

---

### Step 4: "Repository secrets" 섹션

**화면 구성:**
```
┌─────────────────────────────────────────────────┐
│ Secrets / Actions                               │
├─────────────────────────────────────────────────┤
│                                                 │
│ Repository secrets                              │
│ [New repository secret] 버튼 ← 클릭            │
│                                                 │
│ Name          | Updated      | Created         │
│ ───────────────────────────────────────────────│
│ (아직 없으면 비어있음)                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### Step 5: 첫 번째 Secret 추가 - NETLIFY_AUTH_TOKEN

**"New repository secret" 클릭:**

```
┌──────────────────────────────────────────────────┐
│ Actions secrets / New secret                     │
├──────────────────────────────────────────────────┤
│                                                  │
│ Name *                                           │
│ ┌──────────────────────────────────────────────┐ │
│ │ NETLIFY_AUTH_TOKEN                           │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Value *                                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ [위에서 복사한 토큰 붙여넣기]                 │ │
│ │ nf_xAbCdEfGhIjKlMnOpQrStUvWxYz1234567890...  │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Add secret] 버튼                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

**입력 방법:**
```
1. Name 필드에 정확히 입력:
   NETLIFY_AUTH_TOKEN

2. Value 필드에 위에서 복사한 토큰 붙여넣기:
   Cmd+V (Mac) 또는 Ctrl+V (Windows)

3. [Add secret] 클릭
```

**✅ 완료:**
```
Name: NETLIFY_AUTH_TOKEN
Value: (마스킹됨, 별표로 표시)
Updated: 방금
```

---

### Step 6: 두 번째 Secret 추가 - NETLIFY_SITE_ID

**"New repository secret" 다시 클릭:**

```
┌──────────────────────────────────────────────────┐
│ Actions secrets / New secret                     │
├──────────────────────────────────────────────────┤
│                                                  │
│ Name *                                           │
│ ┌──────────────────────────────────────────────┐ │
│ │ NETLIFY_SITE_ID                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Value *                                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ [Netlify 사이트 ID 붙여넣기]                 │ │
│ │ abc123xyz-def-456-ghi-789jklmno              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Add secret] 버튼                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

**입력 방법:**
```
1. Name 필드에 정확히 입력:
   NETLIFY_SITE_ID

2. Value 필드에 Netlify 사이트 ID 붙여넣기:
   Cmd+V (Mac) 또는 Ctrl+V (Windows)

3. [Add secret] 클릭
```

**✅ 완료:**
```
Name: NETLIFY_SITE_ID
Value: (마스킹됨, 별표로 표시)
Updated: 방금
```

---

## 4️⃣ 확인 및 테스트

### 최종 확인 체크리스트

```
☐ NETLIFY_AUTH_TOKEN 생성됨
☐ NETLIFY_SITE_ID 확인됨
☐ GitHub Secrets에 두 개 모두 저장됨
☐ 값들이 올바르게 입력됨 (오타 없음)
```

**GitHub Secrets 최종 화면:**
```
┌──────────────────────────────────────────────┐
│ Actions secrets                              │
├──────────────────────────────────────────────┤
│                                              │
│ Repository secrets:                          │
│                                              │
│ Name                   | Updated    | Edit  │
│ ────────────────────────────────────────────│
│ NETLIFY_AUTH_TOKEN     | 5분 전    | 🔧    │
│ NETLIFY_SITE_ID        | 3분 전    | 🔧    │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 5️⃣ 자동 배포 테스트

### 배포 트리거

GitHub Actions가 자동으로 실행됩니다:

```
1️⃣ 코드를 main 브랜치에 푸시
2️⃣ GitHub Actions 자동 실행 (1-2분)
3️⃣ Netlify 자동 배포 (2-5분)
4️⃣ 배포 완료 후 URL에서 확인
```

---

### 배포 상태 확인

**GitHub Actions 로그:**
```
URL: https://github.com/copyfeel/rara-calendar/actions
```

```
┌────────────────────────────────────┐
│ Actions                            │
├────────────────────────────────────┤
│ Workflow runs:                     │
│                                    │
│ Build and Deploy   ✅ passed       │
│ Commit: abc123...                  │
│ main branch                        │
│ 방금 완료됨                        │
└────────────────────────────────────┘
```

**Netlify 배포 로그:**
```
URL: https://app.netlify.com/sites/[site-name]
```

```
┌────────────────────────────────────┐
│ Deployments                        │
├────────────────────────────────────┤
│ [배포 1]  ✅ Published             │
│ Trigger: GitHub Push               │
│ Built in 2m 15s                    │
│ https://rara-calendar.netlify.app  │
└────────────────────────────────────┘
```

---

## 6️⃣ 최종 배포 URL 확인

**배포 완료 후 방문:**
```
https://[site-id].netlify.app
또는
https://[custom-domain].com (커스텀 도메인 설정시)
```

**예시:**
```
https://rara-calendar-app.netlify.app
```

---

## ❓ 자주 하는 실수 및 해결법

### 1️⃣ "Secret not found" 에러
```
원인: GitHub Secrets 이름이 틀림
해결: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID 이름 정확히 확인
```

### 2️⃣ "Invalid token" 에러
```
원인: 토큰이 손상되거나 불완전함
해결: 
  - 토큰 전체가 복사되었는지 확인
  - 앞뒤 공백 제거
  - 토큰 재생성
```

### 3️⃣ 배포되지 않음
```
원인: main 브랜치로 푸시하지 않음
해결:
  git push origin main  ← 확인
```

### 4️⃣ 권한 부족 에러
```
원인: Personal Access Token 권한 부족
해결:
  - Netlify에서 토큰 재생성
  - "All scopes" 선택
```

---

## 🎯 요약

```
1️⃣ Netlify 토큰 생성
   https://app.netlify.com/user/settings/applications#personal-access-tokens
   → Create new token → 복사

2️⃣ Netlify 사이트 ID 확인
   https://app.netlify.com/sites
   → Site settings → General → Site ID 복사

3️⃣ GitHub Secrets 저장
   https://github.com/copyfeel/rara-calendar/settings/secrets/actions
   → New repository secret
      - NETLIFY_AUTH_TOKEN = [토큰]
      - NETLIFY_SITE_ID = [사이트 ID]

4️⃣ 테스트 배포
   git push origin main
   → GitHub Actions 실행 → Netlify 배포

5️⃣ 완료! 🎉
```

---

## 📞 더 필요한 도움

- Netlify 공식 문서: https://docs.netlify.com/
- GitHub Actions 문서: https://docs.github.com/en/actions
- 프로젝트 DEPLOY.md 참고: /DEPLOY.md
