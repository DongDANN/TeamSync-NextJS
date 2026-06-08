import ShuffleLoader from '@/components/ui/ShuffleLoader';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4 py-12">
      <ShuffleLoader label="Loading page…" />
    </div>
  );
}
