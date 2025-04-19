import dynamic from "next/dynamic";

const WireDrawingChart = dynamic(() => import("./Layers/WireDrawing"), {
  ssr: false,
});
const StrandingChart = dynamic(() => import("./Layers/Stranding"), {
  ssr: false,
});
const InsulatingChart = dynamic(() => import("./Layers/Extrusion"), {
  ssr: false,
});
const LayingChart = dynamic(() => import("./Layers/Laying"), {
  ssr: false,
});
const BeddingChart = dynamic(() => import("./Layers/Bedding"), {
  ssr: false,
});
const ArmouringChart = dynamic(() => import("./Layers/Armouring"), {
  ssr: false,
});
const SheathingChart = dynamic(() => import("./Layers/Sheathing"), {
  ssr: false,
});

interface SelectedLayer {
  outerdiameter?: number;
  drawcolour1?: string;
  processName?: string;
  drawtype?: string;
  Layer?: string;
  layers?: number[];
  thickness?: number;
  subtype?: string;
  ArmouringNoofWires?: number;
  ArmouringOuterDiameter?: number;
  ArmouringWireDiam?: number;
}

interface CircleChartProps {
  selectedLayer?: SelectedLayer;
}

const CircleChart = ({ selectedLayer }: CircleChartProps) => {
  if (!selectedLayer) return null;

  switch (selectedLayer.processName) {
    case "WireDrawing":
      return <WireDrawingChart selectedLayer={selectedLayer} />;
    case "Stranding":
      return <StrandingChart selectedLayer={selectedLayer} />;
    case "Insulating":
      return <InsulatingChart selectedLayer={selectedLayer} />;
    case "Laying":
      return <LayingChart selectedLayer={selectedLayer} />;
    case "Bedding":
      return <BeddingChart selectedLayer={selectedLayer} />;
    case "Armouring":
      return <ArmouringChart selectedLayer={selectedLayer} />;
    case "Sheathing":
      return <SheathingChart selectedLayer={selectedLayer} />;
    default:
      return null;
  }
};

export default CircleChart;
