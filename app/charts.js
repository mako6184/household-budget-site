// Kakeibo Ledger — charts.
//
// charts.js draws every chart as inline SVG from plain numbers: a
// donut for the spending split, grouped bars for the six-month trend,
// and horizontal bars for actual spending against a reference. No
// library, no canvas, no network — the SVG is a string the views drop
// into the page.

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortYen(amount) {
  if (amount >= 100000) return `¥${Math.round(amount / 1000)}k`;
  if (amount >= 1000) return `¥${(amount / 1000).toFixed(0)}k`;
  return `¥${amount}`;
}

// --- donut: spending split by category ------------------------------------

export function donutChart(slices, size = 220) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 14;
  const inner = radius - 30;
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="No spending yet" class="chart-svg">`
      + `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e5ddcb" stroke-width="30"/>`
      + `<text x="${cx}" y="${cy}" text-anchor="middle" class="chart-centre">No spending</text></svg>`;
  }
  let angle = -Math.PI / 2;
  let paths = '';
  for (const slice of slices) {
    if (slice.value <= 0) continue;
    const share = slice.value / total;
    const sweep = share * Math.PI * 2;
    const large = sweep > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(angle);
    const y1 = cy + radius * Math.sin(angle);
    const x2 = cx + radius * Math.cos(angle + sweep);
    const y2 = cy + radius * Math.sin(angle + sweep);
    const ix1 = cx + inner * Math.cos(angle);
    const iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(angle + sweep);
    const iy2 = cy + inner * Math.sin(angle + sweep);
    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} `
      + `L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z" `
      + `fill="${slice.colour}"><title>${escapeXml(slice.label)}: ${Math.round(share * 100)}%</title></path>`;
    angle += sweep;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category" class="chart-svg">`
    + paths
    + `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="chart-centre">Total spent</text>`
    + `<text x="${cx}" y="${cy + 18}" text-anchor="middle" class="chart-centre-amount">¥${total.toLocaleString('en-US')}</text>`
    + `</svg>`;
}

// --- grouped bars: income vs spending across months ------------------------

export function trendBars(rows, width = 640, height = 260) {
  const padLeft = 56;
  const padBottom = 30;
  const padTop = 14;
  const plotWidth = width - padLeft - 8;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(...rows.map((row) => Math.max(row.income, row.spending)), 1);
  const top = Math.ceil(max / 100000) * 100000;
  const groupWidth = plotWidth / rows.length;
  const barWidth = Math.min(26, (groupWidth - 18) / 2);
  const y = (value) => padTop + plotHeight - (value / top) * plotHeight;

  let grid = '';
  for (let step = 0; step <= 5; step += 1) {
    const value = (top / 5) * step;
    const gy = y(value);
    grid += `<line x1="${padLeft}" y1="${gy}" x2="${width - 8}" y2="${gy}" class="chart-grid"/>`
      + `<text x="${padLeft - 8}" y="${gy + 4}" text-anchor="end" class="chart-axis">${shortYen(value)}</text>`;
  }

  let bars = '';
  rows.forEach((row, index) => {
    const gx = padLeft + index * groupWidth + groupWidth / 2;
    bars += `<rect x="${(gx - barWidth - 2).toFixed(1)}" y="${y(row.income).toFixed(1)}" width="${barWidth}" height="${(padTop + plotHeight - y(row.income)).toFixed(1)}" rx="3" fill="#2e6f5e">`
      + `<title>${row.label} income ¥${row.income.toLocaleString('en-US')}</title></rect>`;
    bars += `<rect x="${(gx + 2).toFixed(1)}" y="${y(row.spending).toFixed(1)}" width="${barWidth}" height="${(padTop + plotHeight - y(row.spending)).toFixed(1)}" rx="3" fill="#c65a2e">`
      + `<title>${row.label} spending ¥${row.spending.toLocaleString('en-US')}</title></rect>`;
    bars += `<text x="${gx.toFixed(1)}" y="${height - 10}" text-anchor="middle" class="chart-axis">${escapeXml(row.label)}</text>`;
  });

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly income and spending" class="chart-svg chart-wide">`
    + grid + bars + `</svg>`;
}

// --- horizontal bars: this household vs the national average ----------------

export function compareBars(rows, width = 640) {
  const rowHeight = 44;
  const labelWidth = 110;
  const valueWidth = 74;
  const height = rows.length * rowHeight + 16;
  const max = Math.max(...rows.map((row) => Math.max(row.mine, row.average)), 1);
  const barArea = width - labelWidth - valueWidth - 8;
  const bar = (value) => Math.max(2, (value / max) * barArea);

  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Spending compared with the national average" class="chart-svg chart-wide">`;
  rows.forEach((row, index) => {
    const y = 8 + index * rowHeight;
    out += `<text x="0" y="${y + 13}" class="chart-label">${escapeXml(row.label)}</text>`;
    out += `<rect x="${labelWidth}" y="${y}" width="${bar(row.mine).toFixed(1)}" height="13" rx="3" fill="#2e6f5e">`
      + `<title>Your household: ¥${row.mine.toLocaleString('en-US')}</title></rect>`;
    out += `<text x="${labelWidth + bar(row.mine) + 6}" y="${y + 11}" class="chart-value">¥${row.mine.toLocaleString('en-US')}</text>`;
    out += `<rect x="${labelWidth}" y="${y + 17}" width="${bar(row.average).toFixed(1)}" height="13" rx="3" fill="#d9c9a8">`
      + `<title>National average: ¥${row.average.toLocaleString('en-US')}</title></rect>`;
    out += `<text x="${labelWidth + bar(row.average) + 6}" y="${y + 28}" class="chart-value chart-value-dim">¥${row.average.toLocaleString('en-US')}</text>`;
  });
  return `${out}</svg>`;
}
