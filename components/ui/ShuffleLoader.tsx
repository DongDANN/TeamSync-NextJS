type ShuffleLoaderProps = {
  label?: string;
  className?: string;
};

export default function ShuffleLoader({ label = "", className = "" }: ShuffleLoaderProps) {
  return (
    <div
      className={`ts-shuffle-wrap ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      <div className="ts-shuffle-loader" aria-hidden="true">
        <span className="ts-shuffle-tile" />
        <span className="ts-shuffle-tile" />
        <span className="ts-shuffle-tile" />
        <span className="ts-shuffle-tile" />
        <span className="ts-shuffle-tile" />
      </div>
      {label ? <span className="ts-shuffle-label">{label}</span> : null}
    </div>
  );
}
