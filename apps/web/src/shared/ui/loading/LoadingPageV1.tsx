import logo from '../../../../public/loading-duck-1.png';
import './animations.css';
import './LoadingPageV1.css';

export default function LoadingPageV1() {
    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-linear-to-b from-sky-50 via-sky-100 to-sky-50">
            {/* 은은한 하이라이트 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9),transparent_60%)]" />

            <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
                {/* 캐릭터 + 타이틀 */}
                <section className="flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute -inset-8 rounded-full bg-sky-200/40 blur-2xl" />
                        <img
                            src={logo}
                            alt="character"
                            className="relative h-28 w-28 select-none animate-[float_1.6s_ease-in-out_infinite]"
                            draggable={false}
                        />
                    </div>

                    <h1 className="mt-6 text-4xl font-semibold tracking-wide text-slate-900">
                        Locus
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        당신의 위치 탐험이 시작됩니다
                    </p>
                </section>

                {/* 로딩 인디케이터 */}
                <section className="mt-10 flex w-full flex-col items-center gap-5">
                    {/* 점 3개 */}
                    <div className="flex items-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="h-2 w-2 rounded-full bg-indigo-400"
                                style={{
                                    animation: 'dot 1s ease-in-out infinite',
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    animationDelay: `${i * 0.15}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* 프로그레스 바 (가짜 진행) */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/70">
                        <div className="h-full w-1/3 rounded-full bg-indigo-400 animate-[progress_1.8s_ease-in-out_infinite]" />
                    </div>
                </section>
            </main>
        </div>
    );
}
