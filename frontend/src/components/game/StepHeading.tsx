export default function StepHeading({
  step,
  title,
}: {
  step: number;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary font-mono text-sm font-semibold text-white">
        {step}
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
    </div>
  );
}
