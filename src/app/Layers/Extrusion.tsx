import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  defineGradients,
  getColorFunction
} from "../Colors";
import {
  calculateLayerRadius,
  getWirePositions,
  WirePosition,
  drawCompactedArcs,
  drawHexagonCenter
} from "../utils/strandingUtils";
import { drawStripes } from "../utils/stripeUtils"; // ✅ NEW IMPORT

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
  filledColor?: string;
  nowires?: number;
  stripe?: string;
  insulationColor?: StripeColorInfo[];
  wirelayers?: number[];
  thickness?: number;
  subtype?: string;
}

interface ExtrusionProps {
  selectedLayer?: SelectedLayer;
}

const Extrusion: React.FC<ExtrusionProps> = ({ selectedLayer }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!selectedLayer || !svgRef.current) return;

    const {
      wirediameter = 0,
      drawcolour1 = "",
      processName = "",
      drawtype = "",
      nowires = 0,
      wirelayers = [],
      thickness = 0,
      subtype = "",
      stripe = "none",
      filledColor = "",
      insulationColor = [],
    } = selectedLayer;

    if (processName !== "Insulating" || drawtype !== "Extrusion") return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    defineGradients(svg);
    const color = getColorFunction(drawcolour1);

    const Dw = wirediameter / 2;
    const padding = 10;
    const maxRadius = wirelayers.length * wirediameter;
    const viewBoxSize = 2 * maxRadius + padding;
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;

    svg
      .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g");
    const layerRadius: number[] = [];
    let allWirePositions: WirePosition[] = [];

    wirelayers.forEach((numWires: number, index: number) => {
      const prevLayerWires = index > 0 ? wirelayers[index - 1] : 0;
      const prevLayerRadius = index > 0 ? layerRadius[index - 1] : 0;

      const radius = calculateLayerRadius(
        Dw,
        index,
        numWires,
        prevLayerRadius,
        prevLayerWires
      );

      layerRadius.push(radius);

      const positions = getWirePositions(
        Dw,
        numWires,
        radius,
        color,
        centerX,
        centerY
      );

      allWirePositions = [...allWirePositions, ...positions];
    });

    const outerRadius = Math.max(...layerRadius) + Dw * 2;

    const drawInsulationLayer = (baseRadius: number) => {
      if (thickness <= 0 || !insulationColor[0]?.defaultColor) return;

      const arcGen = d3.arc();
      const innerRadius = baseRadius;
      const outer = baseRadius + thickness;

      g.append("path")
        .attr(
          "d",
          arcGen({
            innerRadius,
            outerRadius: outer,
            startAngle: 0,
            endAngle: 2 * Math.PI,
          })!
        )
        .attr("fill", insulationColor[0]?.defaultColor)
        .attr("transform", `translate(${centerX}, ${centerY})`);
    };

    const drawCompactedStructure = () => {
      const insulatedLayerPositions: WirePosition[] = [];
      const compactLayerRadius: number[] = [];
    
      // Step 1: Calculate wire layer positions and radii
      wirelayers.forEach((numWires, layerIndex) => {
        const prevWires = layerIndex > 0 ? wirelayers[layerIndex - 1] : 0;
        const prevRadius = layerIndex > 0 ? compactLayerRadius[layerIndex - 1] : 0;
    
        const radius = calculateLayerRadius(Dw, layerIndex, numWires, prevRadius, prevWires);
        compactLayerRadius.push(radius);
    
        const positions = getWirePositions(Dw, numWires, radius, color, centerX, centerY);
        insulatedLayerPositions.push(...positions);
      });
    
      // 💡 Compute the *actual* outer radius of all wire layers (outermost wire radius)
      const outerMostWireRadius = compactLayerRadius[compactLayerRadius.length - 1] + Dw;
    
      // Optional: for additional spacing between the insulation and the wires
      const padding = thickness > 0 ? thickness * 1.2 : Dw * 1.5;
    
      // Final outer radius of the insulation layer (it should snugly fit the wires)
      const finalOuterRadius = outerMostWireRadius + padding;
    
      // Step 2: Draw stranding wires first
      // Draw the wires (stranding arcs)
      drawCompactedArcs(g, wirelayers, wirediameter, centerX, centerY, color);
    
      // Draw hexagon center if there is a single wire
      if (wirelayers[0] === 1) {
        drawHexagonCenter(svg, centerX, centerY, wirediameter, color);
      }
    
      // Step 3: Draw insulation layer with stripes on top of stranding wires
      const arcGen = d3.arc();
      const innerRadius = outerMostWireRadius; // The outermost radius of the wires
      const outerRadius = finalOuterRadius; // The outer radius of the insulation layer
    
    
      // Step 4: Draw stripes on the insulation layer if needed
      const mainIns = insulationColor[0];
      if (mainIns?.stripe === "yes") {
        // Dynamic stripe padding (just in case the thickness is small)
        const stripePadding = Math.max(thickness * 1.2, Dw * 1.5);
    
        drawStripes(
          svg as d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
          centerX,
          centerY,
          finalOuterRadius*1.27,
          mainIns.stripeType?.toLowerCase() || "none",
          mainIns.defaultColor,
          mainIns.stripeColor
        );
      }
    };
    
    
      // Step 4: Draw stripes on the insulation layer if needed

    
    
    
    const drawFilledCore = () => {
      svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", outerRadius)
        .attr("fill", filledColor);

      svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", outerRadius - wirediameter - 0.25)
        .attr("fill", "white");

      insulationColor?.forEach((info) => {
        if (info.stripe === "yes") {
          drawStripes(
            svg as d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
            centerX,
            centerY,
            outerRadius + 0.5,
            info.stripeType?.toLowerCase() || "none",
            info.defaultColor,
            info.stripeColor
          );
        }
      });

      drawInsulationLayer(outerRadius - thickness);
    };

    const drawBlankWithStripes = () => {
      const adjustedRadius = Math.max(...layerRadius) + Dw;

      insulationColor?.forEach((info) => {
        if (info.stripe === "yes") {
          drawStripes(
            svg as d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
            centerX,
            centerY,
            adjustedRadius + thickness + 0.5,
            (info.stripeType ?? "none").toLowerCase(),
            (info.defaultColor ?? "none").toLowerCase(),
            (info.stripeColor ?? "none").toLowerCase(),
            // info.defaultColor,
            // info.stripeColor
          );
        }
      });

      drawInsulationLayer(adjustedRadius);
    };

    if (subtype?.startsWith("Compacted")) {
      drawCompactedStructure();
    } else if (subtype === "filled" || subtype === "Solid") {
      drawFilledCore();
    } else if (subtype === "blank") {
      drawBlankWithStripes();
    }

    if (!subtype?.startsWith("Compacted")) {
      svg.selectAll("circle.wire")
        .data(allWirePositions)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", Dw)
        .attr("class", "wire")
        .style("fill", getColorFunction(drawcolour1));
    }

  }, [selectedLayer]);

  return <svg ref={svgRef} width="100%" height="100%" />;
};

export default Extrusion;
