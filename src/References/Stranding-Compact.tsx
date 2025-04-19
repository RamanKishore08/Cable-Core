"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { defineGradients, getColorFunction } from "../app/Colors";
import { getStrandingWireLayout } from "../app/utils/strandingUtils"; // Import the utility functions

interface SelectedLayer {
  wirediameter?: number;
  drawcolour1?: string;
  processName?: string;
  drawtype?: string;
  nowires?: number;
  wirelayers?: number[];
  subtype?: string; // Add subtype to the interface
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
      subtype = "", // Get the subtype
    } = selectedLayer;

    const color = getColorFunction(drawcolour1);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    defineGradients(svg);

    const padding = 10;
    const maxRadius = wirelayers.length * wirediameter;
    const viewBoxSize = 2 * maxRadius + padding;

    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;

    svg
      .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const allWirePositions = getStrandingWireLayout(
      wirediameter,
      wirelayers,
      color,
      centerX,
      centerY
    );


    // Replace Compacted subtype rendering block with this:
    if (subtype === "Compacted") {
      let accumulatedRadius = 0;
    
      wirelayers.forEach((count, layerIndex) => {
        const innerRadius = accumulatedRadius;
        const outerRadius = accumulatedRadius + wirediameter;
        accumulatedRadius = outerRadius;
    
        const angleStep = (2 * Math.PI) / count;
    
        const arcGenerator = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .cornerRadius(1); // Optional: smooths edges
    
        const layerData = d3.range(count).map(i => {
          return {
            startAngle: i * angleStep,
            endAngle: (i + 1) * angleStep
          };
        });
    
        svg.selectAll(`.arc-layer-${layerIndex}`)
          .data(layerData)
          .enter()
          .append("path")
          .attr("d", d => arcGenerator(d as any)!)
          .attr("transform", `translate(${centerX}, ${centerY})`)
          .attr("fill", color);
      });
    }
    else {
      svg
        .selectAll("circle")
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