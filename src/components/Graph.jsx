import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const Graph = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current, // contenedor del grafo

      elements: [
        { data: { id: "a", label: "Node A" } },
        { data: { id: "b", label: "Node B" } },
        { data: { id: "c", label: "Node C" } },
        { data: { source: "a", target: "b" } },
        { data: { source: "b", target: "c" } },
      ],

      style: [
        {
          selector: "node",
          style: {
            "background-color": "#007bff",
            label: "data(label)",
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#999",
            "target-arrow-color": "#999",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],

      layout: {
        name: "grid",
        rows: 2,
      },
    });

    return () => cy.destroy(); // limpia al desmontar
  }, []);

  return (
    <div
      id="cy"
      ref={containerRef}
      style={{
        width: "600px",
        height: "400px",
        border: "2px solid #ccc",
        borderRadius: "10px",
        display: "block",
      }}
    />
  );
};

export default Graph;
