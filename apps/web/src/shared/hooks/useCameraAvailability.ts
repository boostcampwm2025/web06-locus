import { useState, useEffect } from 'react';

/**
 * 카메라 존재 여부 훅
 * enumerateDevices 사용으로 권한 팝업 없이 비디오 입력 기기 유무만 확인합니다.
 * 구형 태블릿·카메라 없는 기기 걸러내기용입니다.
 */
export function useCameraAvailability(): { hasCamera: boolean } {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    const checkDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setHasCamera(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        );
        setHasCamera(videoDevices.length > 0);
      } catch {
        setHasCamera(false);
      }
    };

    void checkDevices();
  }, []);

  return { hasCamera };
}
