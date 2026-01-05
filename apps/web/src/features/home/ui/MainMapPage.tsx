import AppHeader from '../../../shared/ui/header/AppHeader';
import CategoryChips from '../../../shared/ui/category/CategoryChips';
import MapViewport from './MapViewport';
import BottomTabBar from '../../../shared/ui/navigation/BottomTabBar';

export default function MainMapPage() {
  return (
    <div className="flex flex-col h-screen bg-white relative">
      <AppHeader />
      <CategoryChips />
      <MapViewport />
      <BottomTabBar activeTab="home" />
    </div>
  );
}
