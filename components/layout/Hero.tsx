'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CELL_SIZE = 56;

type TrailMap = Record<string, number>;

export default function Hero() {
	const gridRef = useRef<HTMLElement | null>(null);
	const [trail, setTrail] = useState<TrailMap>({});

	useEffect(() => {
		const decayTimer = setInterval(() => {
			setTrail((prev) => {
				const next: TrailMap = {};

				for (const [key, alpha] of Object.entries(prev)) {
					const nextAlpha = alpha - 0.06;
					if (nextAlpha > 0.02) next[key] = nextAlpha;
				}

				return next;
			});
		}, 40);

		return () => clearInterval(decayTimer);
	}, []);

	const handlePointerMove = (clientX: number, clientY: number) => {
		if (!gridRef.current) return;

		const rect = gridRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		const snappedX = Math.floor(x / CELL_SIZE) * CELL_SIZE;
		const snappedY = Math.floor(y / CELL_SIZE) * CELL_SIZE;

		setTrail((prev: TrailMap) => ({
			...prev,
			[`${snappedX}:${snappedY}`]: 1,
		}));
	};

	return (
		<section
			ref={gridRef}
			onMouseMove={(event) => handlePointerMove(event.clientX, event.clientY)}
			onTouchMove={(event) => {
				const touch = event.touches[0];
				if (!touch) return;
				handlePointerMove(touch.clientX, touch.clientY);
			}}
			className="relative overflow-hidden rounded-2xl border-2 border-black bg-white px-4 py-14 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] sm:px-10 sm:py-20"
		>
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-size-[56px_56px]" />

			<div className="pointer-events-none absolute inset-0">
				{Object.entries(trail).map(([key, alpha]) => {
					const [x, y] = key.split(":").map(Number);

					return (
						<div
							key={key}
							className="absolute bg-black transition-opacity duration-75"
							style={{
								opacity: alpha,
								left: x + 1,
								top: y + 1,
								width: CELL_SIZE - 2,
								height: CELL_SIZE - 2,
							}}
						/>
					);
				})}
			</div>

			<div className="relative z-10 mx-auto max-w-4xl text-center">
				<p className="mb-4 inline-flex rounded-full border border-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/70">
					TEAMSYNC
				</p>
				<h1 className="text-[clamp(1.9rem,10vw,6rem)] font-extrabold uppercase leading-[0.9] text-black">
					Sync Your Team
				</h1>
				<p className="mx-auto mt-5 mb-5 max-w-2xl text-sm text-black/60 sm:mt-6 sm:text-xl">
					Build stronger teams with TeamSync - the ultimate collaboration tool for seamless communication, project management, and team bonding. Join our waitlist today and experience the future of teamwork!
				</p>
				<Link href="/auth/signup" className="group relative mt-7 w-full overflow-hidden rounded-full border border-black bg-white px-7 py-3 text-sm font-bold uppercase tracking-wider text-black transition sm:mt-8 sm:w-auto no-underline">
					<span className="pointer-events-none absolute inset-0.75 origin-left scale-x-0 rounded-full bg-black transition-transform duration-300 group-hover:scale-x-100" />
					<span className="relative cursor-pointer z-10 transition-colors duration-300 group-hover:text-white">
						Get Started
					</span>
				</Link>
			</div>
		</section>
	);
}
