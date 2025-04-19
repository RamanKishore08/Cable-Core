// FetchAndRenderCableSvg.tsx
import React, { useState } from "react";

const FetchAndRenderCableSvg = () => {
  const [svgString, setSvgString] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSvg = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cable-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "layercode": "20",
            "processName": "Bedding",
            "drawtype": "Layup-7",
            "wirediameter": 2.62,
            "outerdiameter": 7.86,
            "nowires": 7,
            "wirelayers": [1, 6, 12, 18, 24, 30, 36],
            "drawcolour1": "copperGradient",
            "drawlabel": "Copper wire of 2.62 mm",
            "insulationColor": ["Black","Black","Black","Black","Black","Black", "Black"],
            "thickness": 1.2,
            "layup_outerdiameter": 19.47,
            "NoofCore":127,
            "coreLayers": [1, 6]
          }
                    ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const svgText = await response.text();
      console.log(svgText); // Log the raw SVG response
      setSvgString(svgText);
      
    } catch (e: any) {
      setError(e.message || "An error occurred fetching SVG.");
      setSvgString(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>SVG Generator</h1>
      <button onClick={fetchSvg} disabled={loading}>
        {loading ? "Loading..." : "Generate Cable SVG"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {svgString && (
        <div
          style={{
            maxWidth: "400px",
            maxHeight: "400px",
            overflow: "hidden",
            border: "1px solid black",
            margin: "10px 5px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: svgString }} />
        </div>
      )}
    </div>
    
  );
};

export default FetchAndRenderCableSvg;
