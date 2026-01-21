import { motion } from 'motion/react';
import { ImageWithFallback } from '@/shared/ui/image';
import {
  PAGE1_FLOATING_CARDS,
  PAGE1_CONTENT,
} from '../constants/onboardingData';
import { cardVariants } from '../constants/motionVariants';

export function OnboardingPage1() {
  return (
    <>
      {/* Hero Visual Section */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[320px]">
        {PAGE1_FLOATING_CARDS.map((card) => (
          <FloatingImageCard key={card.id} {...card} />
        ))}
      </div>

      {/* Text Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-[340px] mt-[300px] pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="text-[42px] font-bold tracking-[0.5px] bg-linear-to-r from-[#FF8904] via-[#FE9A00] to-[#F0B100] bg-clip-text text-transparent">
            LOCUS
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-[32px] font-medium leading-[1.4] text-[#101828] mb-4 break-keep">
            {PAGE1_CONTENT.title}
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#6a7282] px-4 break-keep">
            {PAGE1_CONTENT.subtitle.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < PAGE1_CONTENT.subtitle.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </motion.div>
      </div>
    </>
  );
}

function FloatingImageCard({
  src,
  delay,
  x,
  y,
  rotation,
  scale = 1,
}: (typeof PAGE1_FLOATING_CARDS)[0]) {
  return (
    <motion.div
      className="absolute rounded-[16px] overflow-hidden shadow-2xl"
      style={{ left: x, top: y, width: 140 * scale, height: 100 * scale }}
      variants={cardVariants}
      custom={rotation}
      initial="initial"
      animate="animate"
      transition={{ delay }}
    >
      <ImageWithFallback
        src={src}
        alt="memory"
        className="w-full h-full object-cover"
      />

      {/* Pin & Line */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.4 }}
        >
          <div className="w-3 h-3 rounded-full bg-[#FF8904] shadow-lg relative">
            <div className="w-2 h-2 rounded-full bg-white absolute inset-0 m-auto" />
          </div>
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 w-[1.5px] bg-linear-to-b from-[#FF8904] to-transparent h-[40px] origin-top"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 0.6 }}
          transition={{ delay: delay + 0.5, duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
