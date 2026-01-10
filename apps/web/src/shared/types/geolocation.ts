export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: GeolocationPositionError | null;
  isLoading: boolean;
}
