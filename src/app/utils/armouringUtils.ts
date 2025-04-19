import { WirePosition } from "./strandingUtils";

export function getArmouringPositions(
  ArmouringNoofWires: number,
  ArmouringWireDiam: number,
  armourRadius: number,
  armourColor: string,
  centerX: number,
  centerY: number,
  getWirePositions: (
    wireRadius: number,
    wireCount: number,
    layerRadius: number,
    color: string,
    centerX: number,
    centerY: number
  ) => WirePosition[]
): WirePosition[] {
  const positions: WirePosition[] = [];

  if (ArmouringNoofWires <= 4) {
    if (ArmouringNoofWires === 1) {
      positions.push({
        x: centerX,
        y: centerY - armourRadius,
        color: armourColor,
      });
    } else if (ArmouringNoofWires === 2) {
      positions.push(
        {
          x: centerX,
          y: centerY - armourRadius,
          color: armourColor,
        },
        {
          x: centerX,
          y: centerY + armourRadius,
          color: armourColor,
        }
      );
    } else if (ArmouringNoofWires === 3) {
      const angleOffset = Math.PI / 2;
      const angleStep = (2 * Math.PI) / 3;
      for (let i = 0; i < 3; i++) {
        const angle = i * angleStep + angleOffset;
        positions.push({
          x: centerX + armourRadius * Math.cos(angle),
          y: centerY + armourRadius * Math.sin(angle),
          color: armourColor,
        });
      }
    } else {
      const angleStep = (2 * Math.PI) / 4;
      const angleOffset = -Math.PI / 2;
      for (let i = 0; i < 4; i++) {
        const angle = i * angleStep + angleOffset;
        positions.push({
          x: centerX + armourRadius * Math.cos(angle),
          y: centerY + armourRadius * Math.sin(angle),
          color: armourColor,
        });
      }
    }
  } else {
    // Use the provided function for >4 wires
    return getWirePositions(
      ArmouringWireDiam / 2,
      ArmouringNoofWires,
      armourRadius,
      armourColor,
      centerX,
      centerY
    );
  }

  return positions;
}
