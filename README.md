# ERP Frontend Web Application

본 프로젝트는 ERP 시스템의 **프론트엔드 아키텍처 및 UI/UX 설계 역량**에 초점을 둔 포트폴리오 프로젝트입니다.  
실제 ERP/MES 환경을 가정한 백엔드 REST API 구조를 기준으로 화면 연계를 고려하였으며,  
프론트엔드에서는 **인증·권한·업무 흐름 중심의 화면 설계와 상태 관리**에 집중하였습니다.

> 본 저장소는 **ERP 프론트엔드 포트폴리오 용도**로 제작되었습니다.

---

## 🏭 Main Dashboard (ERP · MES 통합 진입 화면)

ERP와 MES가 연계되는 **업무 흐름의 시작 지점**으로,  
주문부터 출고까지 이어지는 전체 데이터 흐름을 시각적으로 표현한 메인 화면입니다.

<a href="./public/img/main.png">
  <img src="./public/img/main.png" style="max-width: 100%; height: auto;" />
</a>

- 주문 → 생산 → 출하 → 재고 흐름을 한 화면에서 인지 가능
- ERP / MES / 주문 채널 간 역할 구분을 고려한 UI 구성
- B2B 제조·유통 시스템 성격을 강조한 Hero 화면 설계

---

## 🔁 Order Management Business Process (ERP · MES 연계)

본 프로젝트는 **고객 주문 → 재고 확인 → 생산 → 출하 → 매출 확정**까지의  
전체 업무 흐름을 ERP와 MES 관점에서 통합적으로 설계하였습니다.

ERP는 **주문·재고·출하·매출 관리**를 담당하며,  
MES는 **생산 지시·작업 진행·품질 검사** 흐름을 담당합니다.

### 📊 Order Management Process Diagram
<a href="./public/img/order-process.png">
  <img src="./public/img/order-process.png" style="max-width: 100%; height: auto;" />
</a>

### 📌 프로세스 요약
- 고객 주문 접수 및 재고 확인 (ERP)
- 재고 부족 시 구매/생산 오더 자동 연계 (ERP → MES)
- 생산 완료 후 품질 검사 및 재고 반영 (MES → ERP)
- 출하, 배송, 납품 완료(POD) 후 매출 확정 (ERP)

---

## 🔐 Authentication (Login & User Registration)

JWT 기반 인증 흐름을 고려하여 설계한 시스템 진입 및 사용자 등록 화면입니다.  
사용자 인증 상태 및 권한(Role)에 따라 접근 가능한 화면이 분기되도록 설계되었습니다.

### Login
<a href="./public/img/login.png">
  <img src="./public/img/login.png" style="max-width: 100%; height: auto;" />
</a>

- JWT 기반 인증 흐름을 고려한 로그인 UI
- 인증 정보는 LocalStorage 기반으로 관리
- 인증 만료 및 권한 오류 발생 시 강제 로그아웃 처리 흐름 고려

### User Registration (회원가입)
<a href="./public/img/회원가입.png">
  <img src="./public/img/회원가입.png" style="max-width: 100%; height: auto;" />
</a>

- ERP 사용자 등록을 위한 회원가입 화면
- 회사명, 직급, 연락처 등 **업무 시스템 필수 정보 입력 구조**
- **관리자 승인 후 계정 활성화** 방식 적용
- B2B ERP 환경에 적합한 사용자 관리 프로세스 반영

---

## 🛠 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite

### UI / Styling
- Styled-components
- SCSS

### Auth / Integration
- JWT 기반 인증
- Role 기반 라우팅 제어

---

## 📁 Master Data Management (기준정보 관리)

### 📦 Inventory Registration (재고 등록)
<a href="./public/img/재고등록.png">
  <img src="./public/img/재고등록.png" style="max-width: 100%; height: auto;" />
</a>

- 품목 코드 및 품목명 기반 재고 관리
- 수량 × 단가 기반 재고 금액 자동 계산
- ERP 재고 관리 기본 흐름을 고려한 화면 설계

---

## 🔄 Transaction Management (거래 관리)

### 🧾 Estimate Registration (견적서 입력)
<a href="./public/img/견적서입력.png">
  <img src="./public/img/견적서입력.png" style="max-width: 100%; height: auto;" />
</a>

- 거래처 기준 견적 데이터 등록
- 다중 품목 입력 및 합계 금액 자동 계산
- 실무 ERP 견적서 작성 흐름 반영

### 🧾 Estimate Management (견적서 관리)
<a href="./public/img/견적서등록2.png">
  <img src="./public/img/견적서등록2.png" style="max-width: 100%; height: auto;" />
</a>

- 기존 견적 데이터 수정 및 관리
- 품목 단위 금액 변경 시 합계 자동 반영
- ERP 견적 관리 화면 구조를 기준으로 UI 설계

### 🧾 Sales Registration (판매 등록)
<a href="./public/img/판매등록.png">
  <img src="./public/img/판매등록.png" style="max-width: 100%; height: auto;" />
</a>

- 거래처 선택 후 판매 품목 다중 라인 입력
- 수량 × 단가 기반 금액 자동 계산
- 판매 합계 금액 실시간 반영

---

## 📦 Order Management (오더 관리)

ERP/MES 환경에서 오더의 **진행 상태를 단계별로 관리**하기 위한 화면입니다.  
발주부터 제작, 출고까지의 업무 흐름을 시스템 상에서 명확하게 추적할 수 있도록 설계되었습니다.

### 오더 진행단계 등록
<a href="./public/img/오더관리.png">
  <img src="./public/img/오더관리.png" style="max-width: 100%; height: auto;" />
</a>

- 오더관리번호 자동 생성
- 발주완료 / 제작중 / 출고완료 상태 관리
- ERP–MES 연계 오더 흐름 반영

---

## 📢 Notice Management (공지사항 관리)

<a href="./public/img/공지사항.png">
  <img src="./public/img/공지사항.png" style="max-width: 100%; height: auto;" />
</a>

- 관리자 공지사항 등록 및 수정
- 중요 공지 상단 고정 처리
- 권한 기반 접근 제어

---

## 🗄 Database Snapshot (Estimate Structure)

### 📄 Estimate (Header)
<a href="./public/img/estimates_db.png">
  <img src="./public/img/estimates_db.png" style="max-width: 100%; height: auto;" />
</a>

### 📄 Estimate Lines (Detail)
<a href="./public/img/estimate_lines_db.png">
  <img src="./public/img/estimate_lines_db.png" style="max-width: 100%; height: auto;" />
</a>

- Header–Line(1:N) 구조 기반 견적 데이터 설계
- 프론트엔드 다중 품목 입력 UI와 DB 구조 매핑

---

## 🚀 Key Features
- ERP/MES 업무 흐름 기반 화면 설계
- JWT 인증 및 권한 제어
- 상태 기반 오더 관리
- 실무 문서 구조 중심 UI/UX

---

## 👨‍💻 Developer

**이기창**  
ERP · MES 기반 웹 서비스 개발  
React(TypeScript) · Spring Boot  

업무 흐름을 이해하고  
현업에서 바로 사용할 수 있는 시스템을 설계하는 개발자를 지향합니다.