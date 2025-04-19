import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import WireDrawing from "../app/Layers/WireDrawing";
import Stranding from "../app/Layers/Stranding";
import Extrusion from "../app/Layers/Extrusion";
import Laying from "../app/Layers/Laying";
import Bedding from "../app/Layers/Bedding";
import Sheathing from "../app/Layers/Sheathing";
import Armouring from "../app/Layers/Armouring";

// Mapping processName to components
const componentsMap: { [key: string]: React.FC<any> } = {
  WireDrawing,
  Stranding,
  Extrusion,
  Laying,
  Bedding,
  Sheathing,
  Armouring,
};

export default function SvgRenderPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!searchParams) return;

    const jsonData = searchParams.get("data");
    if (jsonData) {
      try {
        setData(JSON.parse(jsonData));
      } catch (error) {
        console.error("Invalid JSON data:", error);
      }
    }
  }, [searchParams]);

  if (!data || !componentsMap[data.processName]) {
    return <p>Invalid or missing processName</p>;
  }

  const Component = componentsMap[data.processName];
  return <Component selectedLayer={data} />;
}
