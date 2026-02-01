<div align="center">

<img src="https://i.imgur.com/BVS8cFI.gif" alt="Locus 배너" width=1000>

</div>

<div align="center">

<br>
  
> **생각이 태어난 장소를 기억하고,  
> 그 생각으로 다시 돌아갈 수 있도록 돕는 공간 기반 기록 서비스**

</div>

---

## 🗺️ What is Locus?

기록은 텍스트가 아니라, 그날의 *공기와 장소*로 완성됩니다.  
우리는 매일 수많은 생각을 하지만, 대부분은 휘발됩니다.  
메모 앱을 뒤져봐도 그때 왜 이런 생각을 했는지 기억나지 않는 이유는 `맥락`이 사라졌기 때문입니다.

_Locus는 생각이 태어난 `장소(Locus)`를 기록의 중심에 둡니다._

단순히 글을 남기는 것을 넘어, 당신이 걸어온 길 위의 사유들을 지도 위에 단단히 고정하세요.  
훗날 그 장소에 다시 섰을 때, 당신의 기록은 가장 생생한 모습으로 되살아날 것입니다

---

## 기술 스택

<div align="center">

### 💻 Frontend

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E63DD?style=for-the-badge&logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)

### ⚙️ Backend & Database

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![ElasticSearch](https://img.shields.io/badge/ElasticSearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### 🚀 Infra & Tools

![Naver Cloud](https://img.shields.io/badge/Naver_Cloud-03C75A?style=for-the-badge&logo=naver&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Turbo](https://img.shields.io/badge/Turbo-5C1678?style=for-the-badge&logo=turbo&logoColor=white)

</div>

---

---

## 인프라 아키텍처

서비스의 안정성과 확장성을 위해 개발(`Dev`) 환경과 운영(`Prod`) 환경을 물리적으로 분리하여 관리합니다.

<details>
<summary><b>Prod 환경 아키텍처 보기 (Main Branch)</b></summary>
<br />
<img src="https://i.imgur.com/V1XTYEj.png" alt="운영 인프라 아키텍처" width="1000">

- Elasticsearch, Redis, RabbitMQ 서버를 <br>별도 노드로 분리하여 리소스 간섭을 최소화했습니다.
- PostgreSQL를 Private Subnet에 배치하여 보안을 강화했습니다.
</details>

<details>
<summary><b>Dev 환경 아키텍처 보기 (Develop Branch)</b></summary>
<br />
<img src="https://i.imgur.com/UH6ZyGu.png" alt="개발 인프라 아키텍처" width="1000">

- 개발 편의성을 위해 주요 서비스를 하나의 Web Server 서브넷 내에서 관리하며 신속한 반복 개발이 가능하도록 구성했습니다.
</details>

> 상세한 설계 결정 과정은 [운영 인프라 설계 (NCP)](위키_링크)에서 확인하실 수 있습니다.

---

---

## 더 알아보기

Locus를 이해하는 가장 빠른 방법입니다.

- 👉 **프로젝트 전반이 궁금하다면**  
  [Project Overview / 서비스 개요](링크)  
  → Locus가 어떤 문제를 풀고, 어떤 경험을 제공하는지 한눈에 볼 수 있습니다.

- 👉 **프론트엔드 구현이 궁금하다면**  
  [Frontend 문서 모음](링크)  
  → UI 흐름, 상태 관리, 지도 렌더링 최적화, 반응형(PWA·데스크톱) 전략

- 👉 **백엔드·아키텍처가 궁금하다면**  
  [Backend & Architecture](링크)  
  → API 구조, 검색·알림 시스템, 이벤트 기반 아키텍처, 운영 인프라 설계

- 👉 **팀이 어떻게 일했는지 궁금하다면**  
  [Sprint Log](링크)  
  → 회고 기록
  [**팀 공식 블로그**](https://locus-log.tistory.com/)  
  → 설계 결정 과정, 구현 중 고민, 회고를 기록합니다

---

## 🚀 Quick Start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
pnpm dev
```

> 자세한 실행/환경변수/DB 세팅은 [Development Guide](https://github.com/boostcampwm2025/web06-locus/wiki/Development-Guide)에서 확인하세요.

---

## 🖥️ 팀

### 팀원 소개

<table>
  <tbody>
    <tr>
      <td align="center"><b>그루</b></td>
      <td align="center"><b>휴고</b></td>
      <td align="center"><b>피넛</b></td>
      <td align="center"><b>아리</b></td>
      <td align="center"><b>민다</b></td>
    </tr>
    <tr>
      <td align="center">
        <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #fdfdcd 0%, #fdd7d7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; overflow: hidden;">
          <img src="https://avatars.githubusercontent.com/u/74031333?v=4" alt="그루" width="150" />
        </div>
      </td>
      <td align="center">
        <div style="width: 150px; height: 150px; background: #83c5be; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; overflow: hidden;">
          <img src="https://avatars.githubusercontent.com/u/101388919?v=4" alt="휴고" width="150" />
        </div>
      </td>
      <td align="center">
        <div style="width: 150px; height: 150px; background: #cee958; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; overflow: hidden;">
          <img src="https://avatars.githubusercontent.com/u/112597929?v=4" alt="피넛" width="150" />
        </div>
      </td>
      <td align="center">
        <div style="width: 150px; height: 150px; background: #b6baf1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; overflow: hidden;">
          <img src="https://avatars.githubusercontent.com/u/159447466?v=4" alt="아리" width="150" />
        </div>
      </td>
      <td align="center">
        <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #d5adef 0%, #f27d77 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; overflow: hidden;">
          <img src="https://avatars.githubusercontent.com/u/147925385?v=4" alt="민다" width="150" />
        </div>
      </td>
    </tr>
    <tr>
      <td align="center">
        <b>유저 · 검색 동기화<br/>알림 시스템</b>
      </td>
      <td align="center">
        <b>지도 데이터 · 공간 API<br/>기록 조회 로직</b>
      </td>
      <td align="center">
        <b>기록 연결 그래프<br/>태그 · 즐겨찾기</b>
      </td>
      <td align="center">
        <b>인프라 · 검색<br/>AI 연계</b>
      </td>
      <td align="center">
        <b>Frontend<br/>UI/UX · 상태 관리</b>
      </td>
    </tr>
  </tbody>
</table>

Made with 🐥 by **Team Haping**

> _by you, for memory, thought, and spatial understanding._
