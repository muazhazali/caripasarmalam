"use client";

// Shared state-grid picker used by the homepage first-visit dialog and the
// map page state prompt, so both stay visually identical.

const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

interface StatePickerGridProps {
  onSelect: (state: string) => void;
  dividerLabel: string;
}

export function StatePickerGrid({ onSelect, dividerLabel }: StatePickerGridProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{dividerLabel}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {MALAYSIAN_STATES.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => onSelect(state)}
            className="rounded-lg border border-border bg-muted/40 px-2 py-2.5 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors text-center leading-tight"
          >
            {state}
          </button>
        ))}
      </div>
    </>
  );
}

export default StatePickerGrid;
