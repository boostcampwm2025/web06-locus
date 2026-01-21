import { useNavigate } from 'react-router-dom';
import OnboardingFlow from '../ui/OnboardingFlow';
import { ROUTES } from '@/router/routes';
import { setOnboardingCompleted } from '@/infra/storage/onboardingStorage';

export function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    setOnboardingCompleted();
    void navigate(ROUTES.HOME, { replace: true });
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    void navigate(ROUTES.HOME, { replace: true });
  };

  return <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />;
}
