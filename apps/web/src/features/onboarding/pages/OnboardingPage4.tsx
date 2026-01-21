import { motion } from 'motion/react';
import { ImageWithFallback } from '@/shared/ui/image';
import { MapPinIcon } from '@/shared/ui/icons/MapPinIcon';
import { PAGE4_MEMORIES, PAGE4_CONTENT } from '../constants/onboardingData';
import { memoryVariants } from '../constants/motionVariants';

export function OnboardingPage4() {
  return (
    <>
      {/* Connected map visualization */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[320px]">
        {PAGE4_MEMORIES.map((memory) => (
          <MapMemoryCard key={memory.id} {...memory} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-end text-center max-w-[340px] pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-[32px] font-bold leading-[1.4] text-[#101828] mb-6 break-keep">
            {PAGE4_CONTENT.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < PAGE4_CONTENT.title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#6a7282] break-keep">
            {PAGE4_CONTENT.subtitle.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < PAGE4_CONTENT.subtitle.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </motion.div>
      </div>
    </>
  );
}

function MapMemoryCard({
  src,
  delay,
  x,
  y,
  size = 1,
}: (typeof PAGE4_MEMORIES)[0]) {
  return (
    <motion.div
      className="absolute rounded-[12px] overflow-hidden shadow-xl"
      style={{ left: x, top: y, width: 80 * size, height: 80 * size }}
      variants={memoryVariants}
      custom={delay}
      initial="initial"
      animate="animate"
      transition={{ delay }}
    >
      <ImageWithFallback
        src={src}
        alt=""
        className="w-full h-full object-cover"
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
      >
        <div className="bg-[#FF8904] rounded-full p-1.5 shadow-lg">
          <MapPinIcon className="w-3.5 h-3.5 text-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}
