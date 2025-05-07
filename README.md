# 업무 기록 캘린더/주간 요약 시스템

이 프로젝트는 업무 기록을 쉽고 직관적으로 관리할 수 있는 웹 기반 캘린더 애플리케이션입니다. FullCalendar UI를 활용하여 일별/주간 업무를 입력하고, 요약을 확인할 수 있습니다.

## 주요 기능

- **월간 캘린더**: 하루에 여러 업무를 입력, 최대 4개까지 각 줄에 표시, 5개 이상이면 마지막 줄에 "외 n건"으로 요약
- **업무별 색상 구분**: 한 날짜의 여러 업무는 줄마다 배경색이 번갈아 적용되어 가독성 향상
- **툴팁**: 각 날짜의 모든 업무 내용을 툴팁으로 한눈에 확인
- **페이지 이동**: 메인(캘린더) <-> 주간 요약 <-> 일일 업무기록 페이지 간 빠른 이동 버튼 제공
- **주간 요약**: 선택한 주의 일별 업무를 한눈에 요약
- **백엔드 API**: `/api/daily-tasks` 등 RESTful 엔드포인트로 업무 데이터 관리

## 기술 스택

- **프론트엔드**: React.js, FullCalendar, Material-UI
- **백엔드**: Node.js (Express)

## 설치 및 실행 방법

### 필수 요구사항
- Node.js 18.x 이상
- npm 9.x 이상

### 설치
```bash
# 저장소 클론
git clone [repository-url]

# 종속성 설치
cd Daily_work
npm install

# 개발 서버 실행 (프론트엔드/백엔드 별도)
cd client && npm install && npm start   # 프론트엔드
cd ../server && npm install && npm start # 백엔드
```

## 프로젝트 구조

- `/client` - React 프론트엔드 (src/pages/CalendarView.js, WeeklySummary.js 등)
- `/server` - Node.js 백엔드 (index.js, API 라우트)

## 버전관리 및 보안
- `.gitignore`로 node_modules, 환경설정, 비밀정보, 로그 등 불필요/민감 파일 자동 제외
- 서버 설정 파일(server/config/config.json 등)은 git에 포함되지 않음

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
