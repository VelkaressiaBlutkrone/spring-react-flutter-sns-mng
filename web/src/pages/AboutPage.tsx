/**
 * About 페이지 (TASK_WEB Step 6).
 * 서비스 소개·지도 기반 SNS 컨셉·기술 스택 정적 페이지.
 */
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';

export default function AboutPage() {
  return (
    <AppLayout
      title="About"
      nav={
        <>
          <Link to="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            게시글
          </Link>
          <Link to="/image-posts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            이미지
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈
          </Link>
        </>
      }
    >
      <div className="prose prose-slate max-w-none">
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">서비스 소개</h2>
          <p className="text-slate-600">
            지도 기반 SNS는 사용자의 <strong>위치</strong>를 중심으로 게시글과 이미지를 공유하는
            서비스입니다. 지도에 Pin을 등록하고, 해당 위치와 연결된 게시글을 작성하여 주변 사람들과
            소통할 수 있습니다.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">지도 기반 SNS 컨셉</h2>
          <ul className="list-disc space-y-2 pl-6 text-slate-600">
            <li>
              <strong>현재 위치 기반</strong>: GPS로 사용자 위치를 파악하고, 반경 내 정보를 실시간
              표시합니다.
            </li>
            <li>
              <strong>Pin과 게시글 연동</strong>: 지도에 Pin을 생성하고, 게시글·이미지 게시글과
              연결하여 위치별 콘텐츠를 관리합니다.
            </li>
            <li>
              <strong>경로·거리</strong>: 사용자 위치에서 목적지까지의 거리 계산 및 경로 시각화를
              지원합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">기술 스택</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-2 font-semibold text-slate-800">Backend</h3>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-slate-600">
              <li>Spring Boot 4.x, Java 21</li>
              <li>Spring MVC, Spring Data JPA</li>
              <li>JWT 인증, Redis (세션/캐시)</li>
              <li>H2 (개발), MySQL (운영)</li>
            </ul>
            <h3 className="mb-2 font-semibold text-slate-800">Frontend (Web)</h3>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-sm text-slate-600">
              <li>React 19.x, TypeScript 5.7.x</li>
              <li>Vite 7.x, Tailwind CSS 4.x</li>
              <li>Zustand, TanStack React Query</li>
              <li>React Router 7.x, Axios</li>
            </ul>
            <h3 className="mb-2 font-semibold text-slate-800">지도</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
              <li>Kakao Map API (추상화 설계로 교체 가능)</li>
            </ul>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
