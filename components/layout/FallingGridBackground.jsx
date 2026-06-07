const GRID_SIZE = 42;
const lightColumns = [2, 5, 8, 11, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58];

export default function FallingGridBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(0,0,0,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.14) 1px, transparent 1px)",
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_55%)]" />

            {lightColumns.map((column, index) => (
                <span
                    key={column}
                    className="ts-falling-light absolute top-[-28%] block w-px bg-gradient-to-b from-transparent via-black/80 to-transparent"
                    style={{
                        left: `${column * GRID_SIZE}px`,
                        height: `${140 + (index % 4) * 36}px`,
                        animationDuration: `${3.6 + (index % 3) * 0.9}s`,
                        animationDelay: `${index * 0.45}s`,
                    }}
                />
            ))}
        </div>
    );
}