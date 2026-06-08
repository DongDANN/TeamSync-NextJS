const rowOne = [
	"Task Planning",
	"Daily Priorities",
	"Focus Sessions",
	"Smart Scheduling",
	"Meeting Sync",
	"Deadline Tracking",
	"Team Alignment",
	"Goal Execution",
	"Deep Work",
	"Productivity Flow",
];

const rowTwo = [
	"Time Blocking",
	"Sprint Boards",
	"Project Milestones",
	"Workload Balance",
	"Calendar Planning",
	"Action Items",
	"Shared Notes",
	"Progress Reports",
	"Weekly Review",
	"Accountability",
];

type TrackProps = {
	items: string[];
	reverse?: boolean;
};

function Track({ items, reverse = false }: TrackProps) {
	const repeated = [...items, ...items];

	return (
		<div
			className="relative overflow-hidden border-y border-black/15 bg-white"
			style={{ transform: `rotate(${reverse ? "0.45deg" : "-0.45deg"})` }}
		>
			<div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
				{repeated.map((item, index) => (
					<div
						key={`${item}-${index}`}
						className="mx-1.5 inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/80 sm:mx-2 sm:px-4 sm:py-2 sm:text-sm"
					>
						<span className="h-2 w-2 rounded-full bg-black" />
						<span>{item}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default function Slider() {
	return (
		<section className="mt-5 space-y-1.5 overflow-x-hidden sm:mt-6 sm:space-y-2">
			<Track items={rowOne} />
			<Track items={rowTwo} reverse />

			<style>{`
				.marquee-track {
					display: flex;
					width: max-content;
					padding: 0.45rem 0;
					animation: marquee-left 26s linear infinite;
				}

				.marquee-reverse {
					animation-name: marquee-right;
					animation-duration: 28s;
				}

				@media (min-width: 640px) {
					.marquee-track {
						padding: 0.55rem 0;
					}
				}

				@keyframes marquee-left {
					from {
						transform: translateX(0);
					}
					to {
						transform: translateX(-50%);
					}
				}

				@keyframes marquee-right {
					from {
						transform: translateX(-50%);
					}
					to {
						transform: translateX(0);
					}
				}
			`}</style>
		</section>
	);
}
