import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { defineGradients, getColorFunction } from "../Colors";
import {
  calculateLayerRadius,
  getWirePositions,
  WirePosition,
  drawCompactedArcs,
  drawHexagonCenter,
  getStrandingWireLayout, // Import the function
} from "../utils/strandingUtils";
import { drawStripes } from "../utils/stripeUtils";

interface StripeColorInfo {
  stripe: string;
  defaultColor: string;
  stripeColor: string | null;
  stripeType: string | null;
}

interface SelectedLayer {
  wirediameter?: number;
  drawcolour1?: string;
  processName?: string;
  drawtype?: string;
  wirelayers?: number[];
  coreLayers?: number[];
  subtype?: string;
  insulationColor?: StripeColorInfo[];
  insulationType?:string;
  thickness?: number;
  stripe?:string;
}

interface LayingProps {
  selectedLayer?: SelectedLayer;
}

// ... imports and interfaces remain unchanged

const Laying: React.FC<LayingProps> = ({ selectedLayer }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!selectedLayer || !svgRef.current) return;

    const {
      wirediameter = 0,
      drawcolour1 = "",
      wirelayers = [],
      coreLayers = [],
      insulationColor = [],
      insulationType="",
      thickness = 0,
      subtype = "",
      stripe = "",
    } = selectedLayer;

    const svg = d3.select(svgRef.current as SVGSVGElement);
    svg.selectAll("*").remove();

    defineGradients(svg);

    const Dw = wirediameter / 2;
    const wireColor = getColorFunction(drawcolour1);

    const insulatedLayerPositions: WirePosition[] = [];
    const layerRadius: number[] = [];

    wirelayers.forEach((numWires, layerIndex) => {
      const prevWires = layerIndex > 0 ? wirelayers[layerIndex - 1] : 0;
      const prevRadius = layerIndex > 0 ? layerRadius[layerIndex - 1] : 0;
      const radius = calculateLayerRadius(Dw, layerIndex, numWires, prevRadius, prevWires);
      layerRadius.push(radius);

      const positions = getWirePositions(Dw, numWires, radius, wireColor, 0, 0);
      insulatedLayerPositions.push(...positions);
    });

    const insulatedRadius = Math.max(...layerRadius) + Dw * 2;

    const finalCorePositions: WirePosition[] = [];
    const coreLayerRadius: number[] = [];

    coreLayers.forEach((numBundles, layerIndex) => {
      const prevCores = layerIndex > 0 ? coreLayers[layerIndex - 1] : 0;
      const prevR = layerIndex > 0 ? coreLayerRadius[layerIndex - 1] : 0;

      let coreRadius = calculateLayerRadius(insulatedRadius, layerIndex, numBundles, prevR, prevCores);
      let coreSpacingFactor = insulatedRadius;

      if (subtype?.toLowerCase().startsWith("compacted")) {
        const adjustedRadius = insulatedRadius * 1.1;
        coreRadius = calculateLayerRadius(adjustedRadius + thickness * 1.8, layerIndex, numBundles, prevR, prevCores);
        coreSpacingFactor = Math.max(insulatedRadius, (adjustedRadius + thickness) * 1.11 * (numBundles > 1 ? 1 : 0.8));
      }

      coreLayerRadius.push(coreRadius);

      const corePositions = getWirePositions(coreSpacingFactor, numBundles, coreRadius, "", 0, 0);
      finalCorePositions.push(...corePositions);
    });

    const layoutRadius =
      coreLayerRadius.length > 0
        ? coreLayerRadius[coreLayerRadius.length - 1]
        : insulatedRadius + 50;

    const viewBoxSize = layoutRadius * 2 + 70;
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;

    svg
      .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const isCompactedFinal = subtype?.toLowerCase().startsWith("compacted");

    finalCorePositions.forEach((corePos, coreIndex) => {
      const insulation =
        coreIndex < insulationColor.length
          ? insulationColor[coreIndex]
          : {
              defaultColor: "black",
              stripeColor: null,
              stripeType: null,
              stripe: "none",
            };

      const { defaultColor, stripeColor, stripeType } = insulation;
      const stripeTypeSafe = typeof stripeType === "string" ? stripeType.toLowerCase() : "none";

      if (isCompactedFinal) {
        const adjustedRadius = insulatedRadius * 1.1;
        const stripeRadius = adjustedRadius + thickness;

        svg
          .append("circle")
          .attr("cx", centerX + corePos.x)
          .attr("cy", centerY + corePos.y)
          .attr("r", adjustedRadius + thickness)
          .attr("fill", defaultColor)
          .attr("stroke", defaultColor)
          .attr("stroke-width", thickness * 1.5);


        if (insulation.stripe === "yes") {
          drawStripes(
            svg as d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
            corePos.x + centerX,
            corePos.y + centerY,
            stripeRadius+0.7,
            stripeTypeSafe,
            defaultColor,
            stripeColor
          );
        }

        const compactedGroup = svg.append("g").attr("transform", `translate(${corePos.x + centerX}, ${corePos.y + centerY})`);
        drawCompactedArcs(compactedGroup as any, wirelayers, wirediameter, 0, 0, wireColor);

        if (wirelayers[0] === 1) {
          drawHexagonCenter(svg, corePos.x + centerX, corePos.y + centerY, wirediameter, wireColor);
        }



      } else {
        svg
          .append("circle")
          .attr("cx", corePos.x + centerX)
          .attr("cy", corePos.y + centerY)
          .attr("r", insulatedRadius)
          .attr("fill", defaultColor);

          if (insulation.stripe === "yes") {
            drawStripes(
              svg as d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
              corePos.x + centerX,
              corePos.y + centerY,
              insulatedRadius,
              stripeTypeSafe,
              defaultColor,
              stripeColor
            );
          }
if(insulationType==="blank") {
  svg
  .append("circle")
  .attr("cx", corePos.x + centerX)
  .attr("cy", centerY + corePos.y)
  .attr("r", insulatedRadius - wirediameter + 1.3)
  .attr("fill", "white");

}
else {
        svg
          .append("circle")
          .attr("cx", corePos.x + centerX)
          .attr("cy", centerY + corePos.y)
          .attr("r", insulatedRadius - wirediameter - 0.25)
          .attr("fill", "white");
        }

        insulatedLayerPositions.forEach((wire) => {
          svg
            .append("circle")
            .attr("cx", wire.x + centerX + corePos.x)
            .attr("cy", wire.y + centerY + corePos.y)
            .attr("r", Dw)
            .attr("fill", wire.color);
        });

      }
    });
  }, [selectedLayer]);

  return <svg ref={svgRef} width="100%" height="100%" />;
};

export default Laying;