import { motion } from 'motion/react';
import { ImageWithFallback } from '@/shared/ui/image';
import { PAGE2_RECORD_CARDS, PAGE2_CONTENT } from '../constants/onboardingData';
import { recordVariants } from '../constants/motionVariants';

export function OnboardingPage2() {
  return (
    <>
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[320px]">
        {PAGE2_RECORD_CARDS.map((card) => (
          <RecordCard key={card.id} {...card} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-end text-center max-w-[340px] pb-9 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-[30px] font-medium leading-[1.4] text-[#101828] mb-6 break-keep">
            {PAGE2_CONTENT.title}
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#6a7282] break-keep">
            {PAGE2_CONTENT.subtitle.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < PAGE2_CONTENT.subtitle.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </motion.div>
      </div>
    </>
  );
}

function RecordCard({
  src,
  title,
  delay,
  x,
  y,
  rotation,
  scale = 1,
}: (typeof PAGE2_RECORD_CARDS)[0]) {
  return (
    <motion.div
      className="absolute bg-white rounded-[20px] overflow-hidden shadow-2xl"
      style={{ left: x, top: y, width: 160 * scale }}
      variants={recordVariants}
      custom={rotation}
      initial="initial"
      animate="animate"
      transition={{ delay }}
    >
      <div className="w-full h-[110px] overflow-hidden">
        <ImageWithFallback
          src={src}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 pb-4">
        <p className="text-[13px] text-[#101828] mb-1 font-medium">{title}</p>
        <p className="text-[11px] text-[#6a7282]">2024.01.18</p>
      </div>
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF8904] shadow-lg border-2 border-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.4 }}
      />
    </motion.div>
  );
}
