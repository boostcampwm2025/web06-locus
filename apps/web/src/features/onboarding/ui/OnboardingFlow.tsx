import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronLeftIcon } from '@/shared/ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '@/shared/ui/icons/ChevronRightIcon';
import {
  OnboardingPage1,
  OnboardingPage2,
  OnboardingPage3,
  OnboardingPage4,
} from '../pages';
import type { OnboardingFlowProps } from '../types';

export default function OnboardingFlow({
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 4;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return <OnboardingPage1 />;
      case 1:
        return <OnboardingPage2 />;
      case 2:
        return <OnboardingPage3 />;
      case 3:
        return <OnboardingPage4 />;
      default:
        return <OnboardingPage1 />;
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(114.8deg, rgb(255, 251, 235) 0%, rgb(255, 247, 237) 50%, rgb(253, 242, 248) 100%)',
      }}
    >
      {/* Decorative blurred circles */}
      <div className="absolute bg-[rgba(255,255,255,0.3)] h-[83.047px] left-[94.94px] rounded-full top-[4.15px] w-[47.922px] blur-sm" />
      <div className="absolute bg-[rgba(255,255,255,0.3)] h-[50.338px] left-[281.97px] rounded-full top-[152.39px] w-[92.108px] blur-sm" />
      <div className="absolute bg-[rgba(255,255,255,0.3)] h-[88.787px] left-[270.62px] rounded-full top-[689.25px] w-[74.508px] blur-sm" />
      <div className="absolute bg-[rgba(255,255,255,0.3)] h-[57.209px] left-[106.5px] rounded-full top-[682.98px] w-[59.855px] blur-sm" />

      {/* Skip button */}
      {onSkip && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSkip}
          className="absolute top-6 right-6 z-20 px-4 py-2.5 bg-white/80 backdrop-blur-sm text-[#6a7282] font-medium rounded-[12px] shadow-md hover:bg-white/90 hover:text-[#101828] transition-all duration-200 text-[14px]"
        >
          건너뛰기
        </motion.button>
      )}

      {/* Page content with animation */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex-1 flex flex-col items-center justify-between w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation controls */}
        <div className="w-full max-w-[340px] flex flex-col gap-6">
          {/* Page indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-2 justify-center"
          >
            {Array.from({ length: totalPages }, (_, index) => index).map(
              (index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? 'w-8 bg-linear-to-r from-[#FF8904] to-[#FFD230]'
                      : 'w-2 bg-[#d1d5db]'
                  }`}
                />
              ),
            )}
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevPage}
                className="w-14 h-14 bg-white/80 backdrop-blur-sm text-[#FF8904] rounded-[12px] shadow-md flex items-center justify-center"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
              whileTap={{ scale: 0.97 }}
              onClick={nextPage}
              className="flex-1 text-white font-['Noto_Sans_KR:Regular',sans-serif] text-[16px] py-4 rounded-[12px] shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgb(255, 137, 4) 0%, rgb(254, 154, 0) 50%, rgb(255, 210, 48) 100%)',
              }}
            >
              {currentPage === totalPages - 1 ? '첫 기록 남기기' : '다음'}
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
