import * as d3 from "d3";

export const defineGradients = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
  const defs = svg.append("defs");

  /** 🎨 Radial Polished Copper Gradient */
  const radialGradient = defs.append("radialGradient")
    .attr("id", "radial-copper-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#B87333"); // Deep Copper Center

  radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#D79766"); // Lighter Copper Reflection

  radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#C27D52"); // Mid-tone

  radialGradient.append("stop")
    .attr("offset", "900%")
    .attr("stop-color", "#8D4E2C"); // Dark Edge

  return "radial-copper-gradient";
};

/** Function to get the color gradient */
export const getColorFunction = (colorFuncName: string): string => {
  // Check if the color is a valid CSS color (hex, rgb, rgba, or named colors)
  const isValidColor = (color: string) => {
    const testElement = document.createElement("div");
    testElement.style.color = color;
    return testElement.style.color !== "";
  };

  // If it's a valid CSS color, return it directly
  if (isValidColor(colorFuncName)) {
    return colorFuncName;
  }

  // Check for gradients in the predefined list
  const colorFunctions: Record<string, string> = {
    "copperGradient": "url(#radial-copper-gradient)",
  };

  if (colorFunctions[colorFuncName]) {
    return colorFunctions[colorFuncName];
  }

  // Default fallback if it's not a valid color or gradient
  return "rgb(255, 255, 255)";
};

