import { ChartBlock } from './types.js';

export const CHART_SERIES_COLORS = [
  '#0071e3',
  '#34c759',
  '#ff9500',
  '#af52de',
  '#ff2d55',
  '#5ac8fa'
];

export interface ChartJsDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth?: number;
  borderRadius?: number;
  tension?: number;
  pointRadius?: number;
  fill?: boolean;
}

export interface ChartJsConfig {
  type: 'bar' | 'line' | 'pie';
  data: {
    labels: string[];
    datasets: ChartJsDataset[];
  };
  options: Record<string, unknown>;
}

export interface ChartConfigOptions {
  /** Concrete color for the primary series. Canvas can't read CSS vars, so pass a resolved hex. */
  primaryColor?: string;
}

const baseOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  plugins: {
    legend: { display: false, labels: { boxWidth: 10, font: { size: 11 } } },
    tooltip: { enabled: true }
  }
});

const axisOptions = (showLegend: boolean) => ({
  ...baseOptions(),
  plugins: {
    ...baseOptions().plugins,
    legend: { ...baseOptions().plugins.legend, display: showLegend, position: 'bottom' }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { beginAtZero: true, grid: { color: '#e5e5ea' }, ticks: { font: { size: 10 } } }
  }
});

const pieOptions = () => ({
  ...baseOptions(),
  plugins: {
    ...baseOptions().plugins,
    legend: { ...baseOptions().plugins.legend, display: true, position: 'right' }
  }
});

export const toChartJsConfig = (block: ChartBlock, options?: ChartConfigOptions): ChartJsConfig => {
  const primary = options?.primaryColor || CHART_SERIES_COLORS[0];
  const palette = [primary, ...CHART_SERIES_COLORS.filter((c) => c !== primary)];
  const colorAt = (index: number) => palette[index % palette.length];

  if (block.chartType === 'pie') {
    const values = block.datasets[0]?.values ?? [];
    return {
      type: 'pie',
      data: {
        labels: block.labels,
        datasets: [
          {
            label: block.datasets[0]?.label ?? 'Value',
            data: values,
            backgroundColor: values.map((_, i) => colorAt(i)),
            borderColor: '#ffffff',
            borderWidth: 1
          }
        ]
      },
      options: pieOptions()
    };
  }

  const datasets: ChartJsDataset[] = block.datasets.map((dataset, i) => {
    const color = dataset.color || colorAt(i);
    if (block.chartType === 'line') {
      return {
        label: dataset.label,
        data: dataset.values,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
        fill: false
      };
    }
    return {
      label: dataset.label,
      data: dataset.values,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 0,
      borderRadius: 4
    };
  });

  return {
    type: block.chartType,
    data: { labels: block.labels, datasets },
    options: axisOptions(block.datasets.length > 1)
  };
};
