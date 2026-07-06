import { MobileLayout } from '../components/dashboard/MobileLayout';
import { CalendarPanel } from '../components/calendar/CalendarPanel';

export default function CalendarPage() {
  return (
    <MobileLayout>
      <div className="dashboard-panel" style={{ minHeight: 'calc(100dvh - 120px)', borderRadius: 'var(--radius-lg)' }}>
        <CalendarPanel />
      </div>
    </MobileLayout>
  );
}
