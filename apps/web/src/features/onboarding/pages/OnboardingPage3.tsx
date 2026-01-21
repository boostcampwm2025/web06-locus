import { motion } from 'motion/react';
import { ImageWithFallback } from '@/shared/ui/image';
import { PAGE3_STEPS, PAGE3_CONTENT } from '../constants/onboardingData';
import type { FlowStepProps } from '../types/onboarding';
import {
  listContainerVariants,
  stepVariants,
  iconVariants,
} from '../constants/motionVariants';

export function OnboardingPage3() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-[340px] px-4">
      {/* Decorative Background Gradients */}
      <div className="absolute top-[10%] left-0 w-32 h-32 bg-[#FF8904]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-40 h-40 bg-[#FFD230]/10 blur-3xl rounded-full pointer-events-none" />

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-[28px] font-bold leading-[1.4] text-[#101828] mb-10 text-center break-keep"
      >
        {PAGE3_CONTENT.title.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < PAGE3_CONTENT.title.split('\n').length - 1 && <br />}
          </span>
        ))}
      </motion.h1>

      <motion.div
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center w-full"
      >
        {PAGE3_STEPS.map((step, index) => (
          <div key={step.id} className="w-full">
            <FlowStep
              icon={step.icon}
              text={step.text}
              imageSrc={step.imageSrc}
            />
            {index < PAGE3_STEPS.length - 1 && <ConnectingDot />}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function FlowStep({ icon: Icon, text, imageSrc }: FlowStepProps) {
  return (
    <motion.div variants={stepVariants} className="relative w-full">
      <div className="relative bg-white rounded-[20px] overflow-hidden shadow-xl p-5 border border-gray-50">
        {/* Background Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <ImageWithFallback
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#FF8904]/5 to-[#FFD230]/10" />
        </div>

        {/* Content */}
        <div className="relative flex items-center gap-4">
          <motion.div
            variants={iconVariants}
            className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-linear-to-br from-[#FF8904]/15 to-[#FFD230]/20"
          >
            <Icon className="w-7 h-7 text-[#FF8904]" strokeWidth={2} />

            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-linear-to-br from-[#FF8904]/30 to-[#FFD230]/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </motion.div>

          <p className="text-[16px] text-[#101828] font-medium flex-1 break-keep">
            {text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectingDot() {
  return (
    <motion.div
      className="flex items-center justify-center h-8"
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF8904]/30" />
        ))}
      </div>
    </motion.div>
  );
}
