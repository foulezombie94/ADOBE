import MediaBin from '../components/edit/MediaBin';
import Monitors from '../components/edit/Monitors';
import TimelineToolbar from '../components/edit/TimelineToolbar';
import TimelineCanvas from '../components/edit/TimelineCanvas';
import { useTimelineShortcuts } from '../hooks/useTimelineShortcuts';

export default function EditWorkspace() {
  useTimelineShortcuts();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      <div className="flex-1 flex min-h-0 border-b border-outline-variant/10">
        <MediaBin />
        <Monitors />
      </div>
      <section className="h-[40%] min-h-[200px] bg-surface-container-low flex flex-col">
        <TimelineToolbar />
        <TimelineCanvas />
      </section>
    </div>
  );
}
