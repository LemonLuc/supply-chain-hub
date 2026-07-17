import type { OperationalBarChart } from "@/lib/chat-visuals";

export function OperationalBarChartView({ chart }: { chart: OperationalBarChart }) {
  const width = 760;
  const labelWidth = 205;
  const plotWidth = 430;
  const rowHeight = 72;
  const height = 52 + chart.bars.length * rowHeight;
  const maximum = Math.max(...chart.bars.map((bar) => bar.value), 1);

  return (
    <section className="operational-chart" aria-labelledby={`operational-chart-${chart.id}`}>
      <div className="chat-visual-heading">
        <div>
          <p className="eyebrow">Decision support</p>
          <h3 id={`operational-chart-${chart.id}`}>{chart.title}</h3>
        </div>
        <span>{chart.unit}</span>
      </div>
      <svg
        className="operational-bar-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={chart.title}
      >
        <title>{chart.title}</title>
        <desc>{chart.description} Values are shown in {chart.unit}.</desc>
        {chart.bars.map((bar, index) => {
          const y = 30 + index * rowHeight;
          const barWidth = Math.max(3, (bar.value / maximum) * plotWidth);
          return (
            <g key={bar.id} className="operational-bar-row">
              <text x="0" y={y + 24} className="operational-bar-label">{bar.label}</text>
              <rect x={labelWidth} y={y} width={plotWidth} height="38" rx="5" className="operational-bar-track" />
              <rect x={labelWidth} y={y} width={barWidth} height="38" rx="5" className="operational-bar-value" />
              <text x={labelWidth + plotWidth + 16} y={y + 25} className="operational-bar-number">
                {bar.displayValue} {chart.unit}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chat-visual-description">{chart.description}</p>
    </section>
  );
}
