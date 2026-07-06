import { MobileLayout } from '../components/dashboard/MobileLayout';
import { NotesPanel } from '../components/notes/NotesPanel';

export default function NotesPage() {
  return (
    <MobileLayout>
      <div className="dashboard-panel" style={{ minHeight: 'calc(100dvh - 120px)', borderRadius: 'var(--radius-lg)' }}>
        <NotesPanel />
      </div>
    </MobileLayout>
  );
}
