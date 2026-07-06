import { MobileLayout } from '../components/dashboard/MobileLayout';
import { TasksPanel } from '../components/tasks/TasksPanel';

export default function TasksPage() {
  return (
    <MobileLayout>
      <div className="dashboard-panel" style={{ minHeight: 'calc(100dvh - 120px)', borderRadius: 'var(--radius-lg)' }}>
        <TasksPanel />
      </div>
    </MobileLayout>
  );
}
