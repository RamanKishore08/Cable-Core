"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import layerData from "../../src/data/layerData.json";
import cableDrawing from "../../src/data/cableWire.json";

import CircleChart from "./Drawing";
import "./Colors";

interface Layer {
  processName?: string;
  layerNames?:string;
  strandingLayers?: string[];
  fill?: string[];
  core?: string[];
  subtypes?: string[];
  stripe?: string; 
  [key: string]: unknown;
}

interface SidebarProps {
  onSelect: (layer: Layer | string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  const handleLayerClick = (layer: Layer) => {
    if (
      layer.processName === "Stranding" ||
      layer.processName === "Insulating" ||
      layer.processName === "Laying" ||
      layer.processName === "Bedding" ||
      layer.processName === "Armouring" ||
      layer.processName === "Sheathing"
    ) {
      setExpandedLayer(
        expandedLayer === layer.processName ? null : layer.processName
      );
    } else {
      onSelect(layer);
    }
  };
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatStripe = (stripe: string) => {
  if (stripe === "singlestripe") return "Stripe";
  if (stripe === "bistripe") return "Bistripe";
  if (stripe === "tristripe") return "Tristripe";
  if (stripe === "quadstripe") return "Quadstripe";
  return stripe;
};


  return (
    <div
      className={`left-region w-[230px] flex-none p-[8px] ml-[12px] mr-[12px] mb-[12px] mt-[10px] rounded-[12px] shadow-sm flex flex-col justify-between bg-gradient-to-b from-red-600 to-pink-500 transition-all duration-300 max-h-[calc(100vh-24px)] overflow-auto`}
    >
      <nav>
        <ul className="text-white">
          <div className="relative w-full max-w-[170px] h-[24px] my-2 text-center">
            <Image src="/LOGO.png" alt="Logo" fill className="cbject-contain" />
          </div>

          {layerData.layerNames?.map((layer, index) => (
            <li key={index} className="flex flex-col">
              <div
                className="flex items-center gap-2 p-2 my-1 cursor-pointer text-white"
                onClick={() => handleLayerClick(layer)}
              >
                <Image
                  src="/Addnew.png"
                  alt={layer.processName}
                  width={24}
                  height={24}
                />
                <span>{layer.processName}</span>
              </div>

              {/* Stranding Layers */}
              {layer.processName === "Stranding" &&
                expandedLayer === "Stranding" && (
                  <ul className="ml-6 text-gray-200">
                    {layer.strandingLayers?.map((subLayer: string, subIndex: number) => (
                      <li
                        key={subIndex}
                        className="p-1 cursor-pointer"
                        onClick={() => onSelect(subLayer)}
                      >
                        - {subLayer}
                      </li>
                    ))}
                  </ul>
                )}

{layer.processName === "Insulating" &&
  expandedLayer === "Insulating" && (
    <ul className="ml-6 text-gray-200">
      {[...new Set(
        cableDrawing.layers
          .filter(l => l.processName === "Insulating")
          .map(l => {
            const subtype = l.subtype?.toLowerCase() ?? "blank";
            const stripe = "stripe" in l && typeof l.stripe === "string" ? l.stripe.toLowerCase() : "none";

            if (stripe === "none") return `${capitalize(subtype)}`;
            return `${capitalize(subtype)} and ${formatStripe(stripe)}`;
          })
      )].map((entry, idx) => (
        <li
          key={idx}
          className="p-1 cursor-pointer"
          onClick={() => onSelect(entry)}
        >
          - {entry}
        </li>
      ))}
    </ul>
)}

              {/* Laying Layers */}
              {layer.processName === "Laying" && expandedLayer === "Laying" && (
                <ul className="ml-6 text-gray-200">
                  {layer.core?.map((subLayer: string, subIndex: number) => (
                    <li
                      key={subIndex}
                      className="p-1 cursor-pointer"
                      onClick={() => onSelect(subLayer)}
                    >
                      - {subLayer}
                    </li>
                  ))}
                </ul>
              )}
              {/* Bedding Subtypes */}
              {layer.processName === "Bedding" && expandedLayer === "Bedding" && (
  <ul className="ml-6 text-gray-200">
    {layer.subtypes?.map((subtype: string, subIndex: number) => (
      <li
        key={subIndex}
        className="p-1 cursor-pointer"
        onClick={() => onSelect(subtype)}
      >
        - {subtype}
      </li>
    ))}
  </ul>
)}

              {/* Armouring Subtypes */}
              {layer.processName === "Armouring" && expandedLayer === "Armouring" && (
                <ul className="ml-6 text-gray-200">
                  {layer.subtypes?.map((subtype: string, subIndex: number) => (
                    <li
                      key={subIndex}
                      className="p-1 cursor-pointer"
                      onClick={() => onSelect(subtype)}
                    >
                      - {subtype}
                    </li>
                  ))}
                </ul>
              )}
              {/* Sheathing Subtypes */}
              {layer.processName === "Sheathing" && expandedLayer === "Sheathing" && (
                <ul className="ml-6 text-gray-200">
                  {layer.subtypes?.map((subtype: string, subIndex: number) => (
                    <li
                      key={subIndex}
                      className="p-1 cursor-pointer"
                      onClick={() => onSelect(subtype)}
                    >
                      - {subtype}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="logout flex items-center gap-2 p-2 cursor-pointer text-black">
        <Image src="/logout.png" alt="Logout" width={24} height={24} />
        <span>Logout</span>
      </div>
    </div>
  );
};

interface SelectedLayer {
  processName?: string;
  Layer?: string;
  nowires?: number;
  subtype?: string; // Added subtype to SelectedLayer
  subtype2?: string;
  [key: string]: unknown;
}

interface DashboardProps {
  selectedLayer?: SelectedLayer;
  setSelectedLayer: (layer: SelectedLayer) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedLayer, setSelectedLayer }) => {
  const [editableJson, setEditableJson] = useState<string>("");

  useEffect(() => {
    if (selectedLayer) {
      setEditableJson(JSON.stringify(selectedLayer, null, 2));
    }
  }, [selectedLayer]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableJson(e.target.value);
  };

  const applyJsonChanges = () => {
    try {
      const parsed = JSON.parse(editableJson);
      setSelectedLayer(parsed);
    } catch (err) {
      alert("Invalid JSON format.");
    }
  };

  useEffect(() => {
    console.log("Selected Layer in Dashboard:", selectedLayer); // Added console log
  }, [selectedLayer]);

  return (
    <div className="w-full flex">
      <div className="right-region flex-1 mr-3 mb-3 mt-3 rounded-[12px] shadow-sm bg-white overflow-y-auto h-[calc(100vh-24px)]">
        <div className="main-content flex flex-row">
          <div className="sticky top-0 drawing-content bg-white flex items-center justify-center h-[calc(100vh-24px)] w-2/3">
            <CircleChart selectedLayer={selectedLayer} />
          </div>
          <div className="code-content bg-gray-200 text-black mr-3 p-3 min-h-full overflow-y-auto w-1/3 flex flex-col">
            {selectedLayer ? (
              <>
                <textarea
                  className="text-sm text-black p-2 border border-gray-400 rounded resize-none flex-grow bg-white"
                  value={editableJson}
                  onChange={handleJsonChange}
                  rows={20}
                />
                <button
                  onClick={applyJsonChanges}
                  className="mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Apply Changes
                </button>
              </>
            ) : (
              <p className="text-black">
                Select a process from the sidebar to view details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer | undefined>(undefined);

  const handleSelect = (layer: string | SelectedLayer) => {
    if (!layer) return;
  
    const layerDetails = cableDrawing.layers.find((item) => {
      if (typeof layer === "string") {
        const lower = layer.toLowerCase();
  
        // Stranding
        if (lower.endsWith("-stranding") && item.processName === "Stranding") {
          return item.subtype?.toLowerCase() === lower.replace("-stranding", "");
        }
  
        // Armouring
        if (lower.endsWith("-armouring") && item.processName === "Armouring") {
          return item.subtype?.toLowerCase() === lower.replace("-armouring", "");
        }
  
        // Sheathing
        if (lower.endsWith("-sheathing") && item.processName === "Sheathing") {
          return item.subtype?.toLowerCase() === lower.replace("-sheathing", "");
        }
  
        // Bedding
        if (lower.endsWith("-bedding") && item.processName === "Bedding") {
          return item.subtype?.toLowerCase() === lower.replace("-bedding", "");
        }
  
        // Insulating
        if (item.processName === "Insulating") {
          return item.subtype?.toLowerCase() === layer.toLowerCase();
        }
  
        // Laying
        if (item.processName === "Laying") {
          const coreCount = parseInt(lower);
          if (!isNaN(coreCount)) return item.NoofCore === coreCount;
          if (lower.endsWith("-laying")) {
            return item.subtype?.toLowerCase() === lower.replace("-laying", "");
          }
          return item.Layer === layer;
        }
  
        return false;
      }
  
      // If already a SelectedLayer object
      return (
        item.processName === layer.processName ||
        (item.processName === "Stranding" &&
          Array.isArray(layer.strandingLayers) &&
          layer.strandingLayers.includes(item.Layer)) ||
        (item.processName === "Laying" && item.NoofCore === layer.NoofCore) ||
        (item.processName === "Bedding" && item.subtype === layer.subtype) ||
        (item.processName === "Armouring" && item.subtype === layer.subtype) ||
        (item.processName === "Sheathing" && item.subtype === layer.subtype)
      );
    });
  
    setSelectedLayer(
      layerDetails ?? (typeof layer === "string" ? { processName: layer } : layer)
    );
  };
  
  
  


  return (
    <div className="bg-gray-100 min-h-screen font-[Poppins, sans-serif] text-black flex">
      <Sidebar onSelect={handleSelect} />
      <div className="w-full flex-col">
        {/* <Header /> */}
        <Dashboard selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
      </div>
    </div>
  );
}