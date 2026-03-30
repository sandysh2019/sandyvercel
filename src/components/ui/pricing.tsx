import React from 'react';
import { LiquidButton } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';

type FREQUENCY = 'normal' | 'exclusive';
const frequencies: FREQUENCY[] = ['normal', 'exclusive'];

interface Plan {
	id?: string;
	name: string;
	info: string;
	price: {
		normal: number;
		exclusive: number;
	};
	features: {
		normal: {
			text: string;
			tooltip?: string;
			limit?: string;
		}[];
		exclusive: {
			text: string;
			tooltip?: string;
			limit?: string;
		}[];
	};
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<'normal' | 'exclusive'>(
		'normal',
	);

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-12 p-4',
				props.className,
			)}
			{...props}
		>
			<div className="mx-auto max-w-2xl space-y-4">
				<h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
					{heading}
				</h2>
				{description && (
					<p className="text-muted-foreground text-center text-base md:text-lg">
						{description}
					</p>
				)}
			</div>

			<PricingFrequencyToggle
				frequency={frequency}
				setFrequency={setFrequency}
			/>

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
				{plans.map((plan) => (
					<PricingCard plan={plan} key={plan.name} frequency={frequency} />
				))}
			</div>
		</div>
	);
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
	frequency,
	setFrequency,
	...props
}: PricingFrequencyToggleProps) {
	return (
		<div
			className={cn(
				'glass-card p-1.5 flex w-fit rounded-full border border-border/50 shadow-sm mx-auto',
				props.className,
			)}
			{...props}
		>
			{frequencies.map((freq) => (
				<button
					key={freq}
					type="button"
					onClick={() => setFrequency(freq)}
					className={cn(
						"relative px-8 py-2.5 text-sm font-bold capitalize transition-colors duration-300",
						frequency === freq ? "text-foreground" : "text-muted-foreground hover:text-foreground"
					)}
				>
					<span className="relative z-10 font-bold tracking-wide">{freq === 'normal' ? 'Standard UI' : 'Exclusive UI'}</span>
					{frequency === freq && (
						<motion.span
							layoutId="frequency"
							transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
							className="bg-background shadow-md border border-border/50 inset-0 absolute z-0 rounded-full"
						/>
					)}
				</button>
			))}
		</div>
	);
}

type PricingCardProps = React.ComponentProps<'div'> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = frequencies[0],
	...props
}: PricingCardProps) {
	return (
		<div
			className={cn(
				'relative flex w-full flex-col rounded-2xl border bg-background/50 backdrop-blur-xl',
				plan.highlighted ? 'border-primary shadow-2xl scale-[1.02]' : 'border-border',
				className,
			)}
			{...props}
		>
			{plan.highlighted && (
				<BorderTrail
					style={{
						boxShadow:
							'0px 0px 60px 30px rgba(168,85,247,0.3), 0 0 100px 60px rgba(99,102,241,0.2)',
					}}
					size={120}
				/>
			)}

			<div
				className={cn(
					'rounded-t-2xl border-b p-8 relative',
					plan.highlighted ? 'bg-primary/5 dark:bg-primary/10' : 'bg-muted/10',
				)}
			>
				{/* Relative flow container to prevent absolute overlap with names */}
				<div className="flex items-center gap-2 h-8 mb-3">
					{plan.highlighted && (
						<p className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1 text-xs font-bold">
							<StarIcon className="h-3.5 w-3.5 fill-current" />
							Popular
						</p>
					)}

					{frequency === 'exclusive' && (
						<motion.p
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1 rounded-full border border-purple-500/20 px-3 py-1 text-xs font-bold"
						>
							Ultra Premium
						</motion.p>
					)}
				</div>

				<div className="text-2xl font-bold mb-1.5">{plan.name}</div>
				<p className="text-muted-foreground text-sm font-medium mb-4">{plan.info}</p>
				<h3 className="mt-4 flex items-end gap-1.5 overflow-hidden">
					<motion.span
						key={plan.price[frequency]}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
						className="text-5xl font-extrabold tracking-tight"
					>
						${plan.price[frequency]}
					</motion.span>
					<span className="text-muted-foreground font-medium mb-2 text-sm uppercase tracking-wider">
						{plan.name !== 'Custom' ? 'Base Price' : ''}
					</span>
				</h3>
			</div>

			<div
				className={cn(
					'space-y-4 px-8 py-8 text-sm flex-1',
					plan.highlighted && 'bg-primary/5 dark:bg-background/20',
				)}
			>
				{plan.features[frequency].map((feature, index) => (
					<div key={index} className="flex items-start gap-3">
						<CheckCircleIcon className="text-primary h-5 w-5 shrink-0 mt-0.5" />
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<p
										className={cn(
											"text-muted-foreground font-medium",
											feature.tooltip &&
											'cursor-help border-b border-dashed border-muted-foreground/50 hover:text-foreground hover:border-foreground transition-colors',
										)}
									>
										{feature.text} {feature.limit && `(${feature.limit})`}
									</p>
								</TooltipTrigger>
								{feature.tooltip && (
									<TooltipContent side="top" className="max-w-[200px] text-center">
										<p>{feature.tooltip}</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</div>
				))}
			</div>

			<div
				className={cn(
					'mt-auto w-full border-t p-6',
					plan.highlighted && 'bg-primary/5 dark:bg-background/20',
				)}
			>
				{plan.highlighted ? (
					<LiquidButton className="w-full text-base font-bold" variant="default" asChild>
						<a href={plan.btn.href}>{plan.btn.text}</a>
					</LiquidButton>
				) : (
					<LiquidButton className="w-full text-base font-semibold" variant="outline" asChild>
						<a href={plan.btn.href}>{plan.btn.text}</a>
					</LiquidButton>
				)}
			</div>
		</div>
	);
}

type BorderTrailProps = {
	className?: string;
	size?: number;
	transition?: Transition;
	delay?: number;
	onAnimationComplete?: () => void;
	style?: React.CSSProperties;
};

export function BorderTrail({
	className,
	size = 60,
	transition,
	delay,
	onAnimationComplete,
	style,
}: BorderTrailProps) {
	const BASE_TRANSITION: Transition = {
		repeat: Infinity,
		duration: 6,
		ease: "linear",
	};

	return (
		<div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
			<motion.div
				className={cn('absolute aspect-square bg-primary/50 blur-lg', className)}
				style={{
					width: size,
					offsetPath: `rect(0 auto auto 0 round ${size}px)`,
					...style,
				}}
				animate={{
					offsetDistance: ['0%', '100%'],
				}}
				transition={{
					...(transition ?? BASE_TRANSITION),
					delay: delay,
				}}
				onAnimationComplete={onAnimationComplete}
			/>
		</div>
	);
}
