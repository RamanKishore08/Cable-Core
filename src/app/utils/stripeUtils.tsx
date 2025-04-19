import * as d3 from "d3";

export function drawStripes(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  cx: number,
  cy: number,
  radius: number,
  stripeType: string,
  baseColor: string,
  stripeColor: string | null
) {
  if (!stripeColor || stripeType === "none") return;

  let numStripes = 0;

  switch (stripeType.toLowerCase()) {
    case "stripe":
      numStripes = 1;
      break;
    case "bistripe":
      numStripes = 2;
      break;
    case "tristripe":
      numStripes = 3;
      break;
    case "quadstripe":
      numStripes = 4;
      break;
    default:
      return;
  }

  const totalParts = 12; // divide circle more finely for stripe clarity
  const angleStep = (2 * Math.PI) / totalParts;

  for (let i = 0; i < totalParts; i++) {
    const startAngle = i * angleStep;
    const endAngle = (i + 1) * angleStep;
    const isStripe = i % Math.floor(totalParts / numStripes) === 0;

    const arcPath = d3.arc()({
      innerRadius: radius * 0.8,
      outerRadius: radius,
      startAngle,
      endAngle,
    });

    svg.append("path")
      .attr("d", arcPath!)
      .attr("fill", isStripe ? stripeColor : baseColor)
      .attr("transform", `translate(${cx}, ${cy})`);
  }
}
