import logo from '../../../../public/loading-duck-2.png';
import './animations.css';
import './LoadingPageV2.css';

export default function LoadingPageV2() {
    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* 비네팅 + 은은한 하이라이트 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_58%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.55),transparent_55%)]" />

            <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
                {/* 캐릭터 블록 */}
                <section className="flex flex-col items-center">
                    <div className="relative">
                        {/* 골드 글로우 */}
                        <div className="absolute -inset-10 rounded-full bg-yellow-400/15 blur-3xl" />

                        {/* 오리: 걸어가는 듯한 V자 움직임 */}
                        <img
                            src={logo}
                            alt="loading character"
                            className="relative h-24 w-24 select-none animate-[walk_2.2s_ease-in-out_infinite,microRotate_2.8s_ease-in-out_infinite,breathe_2.4s_ease-in-out_infinite]"
                            draggable={false}
                        />

                        {/* 그림자도 같이 움직이면 더 생동감 */}
                        <div className="mx-auto mt-3 h-3 w-16 rounded-full bg-yellow-300/20 blur-sm animate-[shadow_2.2s_ease-in-out_infinite]" />
                    </div>

                    <h1 className="mt-8 text-4xl font-semibold tracking-wide text-yellow-400">
                        Locus
                    </h1>
                    <p className="mt-2 text-sm text-slate-300/80">
                        스타일리시한 탐험의 시작
                    </p>
                </section>

                {/* 로더 */}
                <section className="mt-10 flex flex-col items-center gap-4">
                    {/* Arc spinner: conic-gradient 버전 */}
                    <div className="relative h-14 w-14">
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,rgba(250,204,21,1),rgba(251,146,60,1),rgba(0,0,0,0)_62%)] animate-[spin_1.2s_linear_infinite]" />
                        {/* 가운데 뚫기 */}
                        <div className="absolute inset-[5px] rounded-full bg-slate-900" />
                    </div>

                    <p className="text-xs text-slate-400/80">Loading...</p>
                </section>
            </main>
        </div>
    );
}
