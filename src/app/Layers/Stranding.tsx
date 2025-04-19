"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { defineGradients, getColorFunction } from "../Colors";
import {
  getStrandingWireLayout,
  drawCompactedArcs,
  drawHexagonCenter,
} from "../utils/strandingUtils";

interface SelectedLayer {
  wirediameter?: number;
  drawcolour1?: string;
  processName?: string;
  drawtype?: string;
  nowires?: number;
  wirelayers?: number[];
  subtype?: string;
}

interface StrandingProps {
  selectedLayer?: SelectedLayer;
}

const Stranding: React.FC<StrandingProps> = ({ selectedLayer }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!selectedLayer || !svgRef.current) return;

    const {
      wirediameter = 0,
      drawcolour1 = "",
      wirelayers = [],
      subtype = "",
    } = selectedLayer;

    const color = getColorFunction(drawcolour1);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    defineGradients(svg);

    const padding = 10;
    const maxRadius = (wirelayers.length + 1) * wirediameter;
    const viewBoxSize = 2 * maxRadius + padding;
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;

    svg
      .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g");

    if (subtype === "Compacted") {
      if (wirelayers[0] === 1) {
        drawHexagonCenter(svg, centerX, centerY, wirediameter, color);
      }
      drawCompactedArcs(g, wirelayers, wirediameter, centerX, centerY, color);
    } else {
      const allWirePositions = getStrandingWireLayout(
        wirediameter,
        wirelayers,
        color,
        centerX,
        centerY
      );

      g.selectAll("circle")
        .data(allWirePositions)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", wirediameter / 2)
        .attr("class", "wire")
        .style("fill", (d) => d.color);
    }
  }, [selectedLayer]);

  return <svg ref={svgRef} width="100%" height="100%" />;
};

export default Stranding;
