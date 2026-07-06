import { MobileLayout } from '../components/dashboard/MobileLayout';
import { ShoppingPanel } from '../components/shopping/ShoppingPanel';

export default function ShoppingPage() {
  return (
    <MobileLayout>
      <div className="dashboard-panel" style={{ minHeight: 'calc(100dvh - 120px)', borderRadius: 'var(--radius-lg)' }}>
        <ShoppingPanel />
      </div>
    </MobileLayout>
  );
}
