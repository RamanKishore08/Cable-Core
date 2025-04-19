import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { defineGradients, getColorFunction } from "../Colors";

interface SelectedLayer {
  outerdiameter?: number;
  drawcolour1?: string;
  processName?: string;
}

interface WireDrawingChartProps {
  selectedLayer?: SelectedLayer;
}

const WireDrawingChart: React.FC<WireDrawingChartProps> = ({ selectedLayer }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!selectedLayer || !svgRef.current) return;

    const { outerdiameter = 0, drawcolour1 = "", processName = "" } = selectedLayer; 

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    const padding = 10;
    const viewBoxSize = outerdiameter  + padding; 
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;

    svg
      .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    if (processName === "WireDrawing") {
      defineGradients(svg); 

      const color = getColorFunction(drawcolour1); 
      const circleRadius = outerdiameter / 2; 

      svg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", circleRadius)
        .attr("fill", color);
    }
  }, [selectedLayer]);

  return <svg ref={svgRef} width="100%" height="100%" />;
};

export default WireDrawingChart;
