import logo from '@/assets/images/loading-duck-3.png';
import './animations.css';
import './LoadingPageV3.css';

const BAR_COUNT = 5;
const BAR_DELAYS = [0, 0.12, 0.24, 0.36, 0.48] as const;

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85),transparent_60%)]" />
  );
}

function LoadingBrand() {
  return (
    <section className="flex flex-col items-center">
      <div className="relative">
        {/* 부드러운 글로우 */}
        <div className="absolute -inset-10 rounded-full bg-orange-200/25 blur-3xl" />

        <img
          src={logo}
          alt="loading character"
          className="relative h-24 w-24 select-none animate-[float_3.4s_ease-in-out_infinite,breathe_3.8s_ease-in-out_infinite,microRotate_6s_ease-in-out_infinite]"
          draggable={false}
        />

        {/* 섀도우도 함께 호흡 */}
        <div className="mx-auto mt-3 h-3 w-16 rounded-full bg-orange-300/20 blur-sm animate-[shadow_3.4s_ease-in-out_infinite]" />
      </div>

      <h1 className="mt-8 text-4xl font-semibold tracking-wide text-orange-500">
        Locus
      </h1>
      <p className="mt-2 text-sm text-slate-600">잠시만 쉬어가세요...</p>
    </section>
  );
}

function LoadingBars() {
  return (
    <div className="flex items-end gap-1.5">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-orange-400/90"
          style={{
            height: 10 + (i % 2) * 6,
            animation: 'bar 1s ease-in-out infinite',
            animationDelay: `${BAR_DELAYS[i].toString()}s`,
          }}
        />
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="relative h-14 w-14">
      {/* 링 베이스 */}
      <div className="absolute inset-0 rounded-full border-4 border-orange-200/70" />
      {/* Arc */}
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,rgba(249,115,22,1),rgba(251,191,36,1),rgba(0,0,0,0)_62%)] animate-[spin_1.2s_linear_infinite]" />
      {/* 가운데 뚫기 */}
      <div className="absolute inset-[6px] rounded-full bg-[#fff1ef]" />

      {/* 가운데 작은 아이콘 (해/별 느낌) */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-5 w-5 rounded-full bg-orange-300/30 animate-[spark_1.6s_ease-in-out_infinite]" />
        <div className="absolute h-2 w-2 rotate-45 bg-orange-400/70 animate-[spark_1.6s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <section className="mt-8 flex flex-col items-center gap-6">
      <LoadingBars />
      <LoadingSpinner />
    </section>
  );
}

export default function LoadingPageV3() {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-linear-to-b from-[#fff7ea] via-[#fff1ef] to-[#fff7ea]">
      <Background />

      <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
        <LoadingBrand />
        <LoadingIndicator />
      </main>
    </div>
  );
}
