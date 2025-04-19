"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { defineGradients, getColorFunction } from "../app/Colors";
import { getStrandingWireLayout } from "../app/utils/strandingUtils";

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

    const g = svg.append("g");

    if (subtype === "Compacted") {
      // Draw arcs for compacted wires
      wirelayers.forEach((numWires, layerIndex) => {
        const innerRadius = layerIndex * wirediameter;
        const outerRadius = (layerIndex + 1) * wirediameter;

        if (layerIndex === 0 && numWires === 1) {
          const flatToFlat = wirediameter;
          const cornerRadius = flatToFlat / Math.cos(Math.PI / 6); // true radius from center to corner
        
          const hexPoints = Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i; // 0°, 60°, ..., 300°
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
          return;
        }
        
        
        

        const angleStep = (2 * Math.PI) / numWires;
        const arcGen = d3.arc();

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
    } else {
      // Default to drawing circles at calculated positions
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
