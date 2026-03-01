# ERP Frontend

React + TypeScript 기반의 ERP 프론트엔드 애플리케이션입니다.  
사용자 인증(JWT)과 역할(Role) 기반 접근 제어를 포함하여, 주문 → 재고 → 생산 → 출고로 이어지는 업무 흐름을 UI로 구현한 프로젝트입니다.

---

## 📌 프로젝트 개요

- ERP 시스템의 핵심 화면 및 업무 흐름 UI 구현
- JWT 기반 인증 처리 및 보호 라우팅 적용
- 관리자(Admin) / 일반 사용자(User) 권한 분리
- React Router 기반 SPA 구조 설계

---

## 🛠 주요 기능

- 로그인 / 회원가입 페이지
- 환영(Welcome) 페이지
- ERP 메인 화면
- 관리자(Admin) 페이지
- 권한에 따른 메뉴 및 접근 제어
- 로그아웃 기능 구현
- 보호 라우트(RequireAuth / RequireAdmin)

---

## 🧱 기술 스택

### Frontend
- React
- TypeScript
- Vite
- React Router DOM

### Authentication
- JWT 기반 인증 처리
- LocalStorage 토큰 관리
- Role 기반 접근 제어

### Dev Tools
- Git
- GitHub
- IntelliJ / VS Code
- Postman (API 테스트)

---

## 📁 프로젝트 구조 (예시)


src
┣ pages
┃ ┣ Welcome.tsx
┃ ┣ Login.tsx
┃ ┣ Signup.tsx
┃ ┣ ERPHome.tsx
┃ ┗ Admin.tsx
┣ components
┃ ┗ Header.tsx
┣ auth
┃ ┣ auth.ts
┃ ┣ RequireAuth.tsx
┃ ┗ RequireAdmin.tsx
┗ App.tsx


---

## 🚀 실행 방법

### 1. 저장소 클론
```bash
git clone https://github.com/Nara-Park-513/erp-frontend.git
cd erp-frontend
2. 의존성 설치
npm install
3. 개발 서버 실행
npm run dev

기본 접속 주소:

http://localhost:5173
🔐 인증 흐름 요약

로그인 성공 시 JWT 토큰 및 사용자 정보(LocalStorage 저장)

RequireAuth를 통해 로그인 여부 확인

RequireAdmin을 통해 관리자 권한 확인

로그아웃 시 토큰 제거 후 홈으로 이동

🧠 설계 의도

단순 화면 구현이 아닌 인증 및 권한 구조까지 포함한 ERP 프론트엔드 설계

UI와 비즈니스 흐름을 연결하는 구조 설계

관리자 전용 페이지 및 보호 라우팅 구현을 통해 실제 서비스 구조와 유사하게 구성

📌 향후 개선 예정

실제 백엔드 API 연동 고도화

상태 관리 라이브러리 도입 (Redux / Zustand 등)

공통 레이아웃 및 UI 컴포넌트 모듈화

에러 핸들링 및 토큰 만료 처리 로직 개선

📜 License

This project is for portfolio purposes.