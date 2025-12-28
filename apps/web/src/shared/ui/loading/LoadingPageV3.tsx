import logo from '../../../../public/loading-duck-3.png';

export default function LoadingPageV3() {
    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-linear-to-b from-[#fff7ea] via-[#fff1ef] to-[#fff7ea]">
            {/* 은은한 비네팅/하이라이트 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85),transparent_60%)]" />

            {/* 버블/빛 번짐 레이어 (가벼운 움직임) */}
            <div className="pointer-events-none absolute left-10 top-24 h-24 w-24 rounded-full bg-white/40 blur-2xl animate-[bubble_6s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute right-12 top-40 h-32 w-32 rounded-full bg-white/30 blur-3xl animate-[bubble_7.5s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute left-16 bottom-28 h-28 w-28 rounded-full bg-white/30 blur-3xl animate-[bubble_8.2s_ease-in-out_infinite]" />

            <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
                {/* 캐릭터 */}
                <section className="flex flex-col items-center">
                    <div className="relative">
                        {/* 부드러운 글로우 */}
                        <div className="absolute -inset-10 rounded-full bg-orange-200/25 blur-3xl" />

                        <img
                            src={logo}
                            alt="loading character"
                            className="relative h-24 w-24 select-none animate-[chillFloat_3.4s_ease-in-out_infinite,breathe_3.8s_ease-in-out_infinite,microRotate_6s_ease-in-out_infinite]"
                            draggable={false}
                        />

                        {/* 섀도우도 함께 호흡 */}
                        <div className="mx-auto mt-3 h-3 w-16 rounded-full bg-orange-300/20 blur-sm animate-[shadowSoft_3.4s_ease-in-out_infinite]" />
                    </div>

                    <h1 className="mt-8 text-4xl font-semibold tracking-wide text-orange-500">
                        Locus
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        잠시만 쉬어가세요...
                    </p>
                </section>

                {/* 로딩 인디케이터 */}
                <section className="mt-8 flex flex-col items-center gap-6">
                    {/* 세로 바 5개 */}
                    <div className="flex items-end gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span
                                key={i}
                                className="w-1.5 rounded-full bg-orange-400/90"
                                style={{
                                    height: 10 + (i % 2) * 6,
                                    animation: 'bar 1s ease-in-out infinite',
                                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                    animationDelay: `${i * 0.12}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* 원형 arc 로더 + 가운데 아이콘 */}
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
                </section>
            </main>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes bubble {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.35; }
          50% { transform: translateY(-10px) translateX(6px); opacity: 0.55; }
        }

        @keyframes chillFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes breathe {
          0%, 100% { scale: 1; }
          50% { scale: 1.02; }
        }

        @keyframes microRotate {
          0%, 100% { rotate: -1deg; }
          50% { rotate: 1deg; }
        }

        @keyframes shadowSoft {
          0%, 100% { transform: scaleX(1); opacity: 0.22; }
          50% { transform: scaleX(0.82); opacity: 0.14; }
        }

        @keyframes bar {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }

        @keyframes spark {
          0%, 100% { transform: scale(0.9); opacity: 0.65; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
        </div>
    );
}
