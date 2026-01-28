import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingFlow from '../ui/OnboardingFlow';
import { ROUTES } from '@/router/routes';
import { setOnboardingCompleted } from '@/infra/storage/onboardingStorage';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 온보딩으로 이동할 때 전달된 returnPath를 가져옴
  const returnPath =
    (location.state as { returnPath?: string } | null)?.returnPath ??
    ROUTES.HOME;

  const handleComplete = () => {
    setOnboardingCompleted();
    void navigate(returnPath, { replace: true });
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    void navigate(returnPath, { replace: true });
  };

  return <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />;
}
