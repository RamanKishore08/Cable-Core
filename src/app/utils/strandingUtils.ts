import * as d3 from "d3";

export interface WirePosition {
  x: number;
  y: number;
  color: string;
}

export function calculateLayerRadius(
  Dw: number,
  layerIndex: number,
  numWires: number,
  prevLayerRadius: number,
  prevLayerWires: number
): number {
  if (layerIndex === 0) {
    if (numWires === 1) return 0;
    if (numWires === 2) return Dw;
    return Dw / Math.sin(Math.PI / numWires);
  } else {
    return prevLayerRadius + 1.98 * Dw;
  }
}

export function getWirePositions(
  Dw: number,
  n: number,
  layerRadius: number,
  color: string,
  centerX: number,
  centerY: number
): WirePosition[] {
  const positions: WirePosition[] = [];

  if (n === 1) {
    positions.push({ x: centerX, y: centerY, color });
  } else if (n === 2) {
    positions.push(
      { x: centerX, y: centerY - Dw, color },
      { x: centerX, y: centerY + Dw, color }
    );
  } else if (n === 3) {
    let h = Math.sqrt(3) * Dw;
    positions.push(
      { x: centerX - Dw, y: centerY - h / 3, color },
      { x: centerX + Dw, y: centerY - h / 3, color },
      { x: centerX, y: centerY + h / 1.5, color }
    );
  } else if (n === 4) {
    let h = Math.sqrt(2) * Dw;
    positions.push(
      { x: centerX, y: centerY - h, color },
      { x: centerX - h, y: centerY, color },
      { x: centerX + h, y: centerY, color },
      { x: centerX, y: centerY + h, color }
    );
  } else if (n === 5) {
    const angleOffset = Math.PI / 10;
    const angleStep = (2 * Math.PI) / 5;

    for (let i = 0; i < 5; i++) {
      const angle = i * angleStep + angleOffset;
      positions.push({
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        color,
      });
    }
  } else if (n === 6) {
    const angleOffset = Math.PI / 6;
    const angleStep = (2 * Math.PI) / 6;

    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep + angleOffset;
      positions.push({
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        color,
      });
    }
  } else if (n === 7) {
    const angleOffset = Math.PI / 15;
    const angleStep = (2 * Math.PI) / 7;

    for (let i = 0; i < 7; i++) {
      const angle = i * angleStep + angleOffset + Math.PI;
      positions.push({
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        color,
      });
    }
  } else if (n === 8) {
    const angleOffset = Math.PI;
    const angleStep = (2 * Math.PI) / 8;

    for (let i = 0; i < 8; i++) {
      const angle = i * angleStep + angleOffset;
      positions.push({
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        color,
      });
    }
  } else {
    const angleStep = (2 * Math.PI) / n;
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep;
      positions.push({
        x: centerX + layerRadius * Math.cos(angle),
        y: centerY + layerRadius * Math.sin(angle),
        color,
      });
    }
  }

  return positions;
}

export function getStrandingWireLayout(
  wirediameter: number,
  wirelayers: number[],
  color: string,
  centerX: number,
  centerY: number
): WirePosition[] {
  const Dw = wirediameter / 2;
  let layerRadius: number[] = [];
  let allWirePositions: WirePosition[] = [];

  wirelayers.forEach((numWires, index) => {
    const prevWires = index > 0 ? wirelayers[index - 1] : 0;
    const prevRadius = index > 0 ? layerRadius[index - 1] : 0;
    const radius = calculateLayerRadius(Dw, index, numWires, prevRadius, prevWires);
    layerRadius.push(radius);

    const positions = getWirePositions(Dw, numWires, radius, color, centerX, centerY);
    allWirePositions.push(...positions);
    
  });

  return allWirePositions;
}

/**
 * Draws compacted wire layout as arcs and a hexagon if center has 1 wire.
 * Can be reused for insulation, bedding, sheathing, etc.
 */
export function drawHexagonCenter(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  centerX: number,
  centerY: number,
  wirediameter: number,
  color: string
) {
  const flatToFlat = wirediameter;
  const cornerRadius = flatToFlat / Math.cos(Math.PI / 6);

  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return [
      centerX + cornerRadius * Math.cos(angle),
      centerY + cornerRadius * Math.sin(angle),
    ];
  });

  const hexPath = d3.line()(hexPoints as [number, number][])!;
  svg
    .append("path")
    .attr("d", hexPath + "Z")
    .attr("fill", color)
    .attr("stroke", "black")
    .attr("stroke-width", 0.1);
}

/**
 * Draws arcs for compacted wires around the center.
 */
export function drawCompactedArcs(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  wirelayers: number[],
  wirediameter: number,
  centerX: number,
  centerY: number,
  color: string
) {
  const arcGen = d3.arc();

  wirelayers.forEach((numWires, layerIndex) => {
    if (layerIndex === 0 && numWires === 1) return;

    const innerRadius = layerIndex * wirediameter;
    const outerRadius = (layerIndex + 1) * wirediameter;
    const angleStep = (2 * Math.PI) / numWires;

    for (let i = 0; i < numWires; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + angleStep;

      g.append("path")
        .attr(
          "d",
          arcGen({
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
          })!
        )
        .attr("fill", color)
        .attr("stroke", "black")
        .attr("stroke-width", 0.1)
        .attr("transform", `translate(${centerX}, ${centerY})`);
    }
  });
}