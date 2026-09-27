# Future Stock Trend Visualization

## Goal
Make the searched stock's future direction immediately understandable with a clear projected price chart.

## Changes
- Upgrade the existing forecast visualization to percentage-only plotting and a price-path chart anchored at the stock's current price.
- Show the current price as the starting point, followed by each forecast timeframe in chronological order.
- Display projected price, expected percentage change, direction, and model confidence in the chart tooltip.
- Add a compact bullish/bearish/neutral trend summary and projected range above the chart.
- Keep the existing area/bar view switch, adapting both views to projected prices and positive/negative signals.
- Ensure the chart remains readable on mobile and desktop and handles missing current-price data gracefully.

## Technical details
- Update `ForecastChart` only; reuse the current prediction response and Recharts dependency.
- Normalize both short (`1W`, `1M`) and long (`1 week`, `3 months`) timeframe labels before sorting.
- Use existing semantic color tokens for chart colors and controls.
- Verify the generated analysis view in the browser and confirm the project remains error-free.
