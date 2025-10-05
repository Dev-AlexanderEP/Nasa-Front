import React, { useEffect, useRef } from "react";
import GraphologyGraph from "graphology";
import Sigma from "sigma";
import demoData from "../data/demoData.json";

const SimpleGraph = ({ searchResults = null, searchTerm = "" }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Use API results if available, otherwise use demo data
  const dataToUse = searchResults && searchResults.results ? searchResults.results : demoData.results;

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Limpiar renderer existente si hay cambios en los datos
    if (rendererRef.current) {
      rendererRef.current.kill();
      rendererRef.current = null;
      isInitializedRef.current = false;
    }
    
    // Marcar como inicializado
    isInitializedRef.current = true;

    // Wait for container to be ready
    setTimeout(() => {
      try {
        // Limpiar cualquier contenido previo del contenedor
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        // Create a graph based on research data scores
        const graph = new GraphologyGraph();

        // Sort data by score (already sorted in demo data)
        const sortedResults = [...dataToUse];
        
        // Define node groups based on score ranking
        const getNodeGroup = (index) => {
          if (index === 0) return 'primary'; // El primero (más grande)
          if (index >= 1 && index <= 4) return 'secondary'; // Los siguientes 4
          if (index >= 5 && index <= 14) return 'tertiary'; // Los siguientes 10
          return 'quaternary'; // Los últimos 5
        };

        // Define node properties by group with better spacing
        const nodeProperties = {
          primary: { 
            size: 40, 
            color: "#e74c3c", 
            priority: 1,
            radius: 0 // Centro
          },
          secondary: { 
            size: 28, 
            color: "#f39c12", 
            priority: 2,
            radius: 140 // Círculo interior
          },
          tertiary: { 
            size: 18, 
            color: "#3498db", 
            priority: 3,
            radius: 220 // Círculo medio
          },
          quaternary: { 
            size: 12, 
            color: "#2ecc71", 
            priority: 4,
            radius: 300 // Círculo exterior
          }
        };

        // Add nodes based on research data
        sortedResults.forEach((item, index) => {
          const group = getNodeGroup(index);
          const props = nodeProperties[group];
          
          let x, y;
          
          if (group === 'primary') {
            // Nodo central
            x = 0;
            y = 0;
          } else {
            // Distribuir en círculos concéntricos con mejor espaciado
            const groupItems = sortedResults.filter((_, i) => getNodeGroup(i) === group);
            const groupIndex = groupItems.indexOf(item);
            const totalInGroup = groupItems.length;
            
            // Añadir offset aleatorio pequeño para evitar solapamientos exactos
            const baseAngle = (2 * Math.PI * groupIndex) / totalInGroup;
            const angleOffset = (Math.random() - 0.5) * 0.1; // Pequeña variación
            const angle = baseAngle + angleOffset;
            
            // Añadir variación en radio para hacer más orgánico
            const radiusVariation = (Math.random() - 0.5) * 30;
            const finalRadius = props.radius + radiusVariation;
            
            x = Math.cos(angle) * finalRadius;
            y = Math.sin(angle) * finalRadius;
          }

          // Crear etiqueta más corta para visualización
          const shortLabel = item.title.length > 30 ? 
            item.title.substring(0, 30) + "..." : 
            item.title;

          graph.addNode(item.id.toString(), {
            x,
            y,
            size: props.size,
            color: props.color,
            label: shortLabel,
            fullTitle: item.title,
            score: item.score.toFixed(3),
            group: group,
            priority: props.priority
          });
        });

        // Connect nodes - crear conexiones jerárquicas
        const primaryNode = sortedResults[0].id.toString();
        
        // Conectar nodo primario con secundarios
        for (let i = 1; i <= 4 && i < sortedResults.length; i++) {
          graph.addEdge(primaryNode, sortedResults[i].id.toString());
        }

        // Conectar algunos secundarios con terciarios
        for (let i = 1; i <= 4 && i < sortedResults.length; i++) {
          const secondaryNode = sortedResults[i].id.toString();
          // Cada secundario se conecta con 2-3 terciarios
          const startTertiary = 5 + ((i - 1) * 2);
          const endTertiary = Math.min(startTertiary + 2, 14);
          
          for (let j = startTertiary; j <= endTertiary && j < sortedResults.length; j++) {
            if (sortedResults[j]) {
              graph.addEdge(secondaryNode, sortedResults[j].id.toString());
            }
          }
        }

        // Conectar algunos terciarios con cuaternarios
        for (let i = 5; i <= 14 && i < sortedResults.length; i += 2) { // Solo algunos terciarios
          const tertiaryNode = sortedResults[i].id.toString();
          const quaternaryStart = 15 + Math.floor((i - 5) / 2);
          
          if (quaternaryStart < sortedResults.length && sortedResults[quaternaryStart]) {
            graph.addEdge(tertiaryNode, sortedResults[quaternaryStart].id.toString());
          }
        }
        const resetCameraState = true; // o false, según tu lógica

        // Create Sigma renderer with enhanced settings for static layout
        const renderer = new Sigma(graph, containerRef.current, {
          renderLabels: true,
          labelSize: 11,
          labelColor: { color: "#ecf0f1" },
          labelFont: "Arial, sans-serif",
          minCameraRatio: 0.2,
          maxCameraRatio: 3,
            cameraState: resetCameraState ? { x: 0.5, y: 0.5, angle: 0, ratio: 1 } : undefined,

          enableEdgeHoverEvents: true,
          defaultEdgeType: "line",
          defaultEdgeColor: "#95a5a6",
          defaultNodeType: "circle",
          labelDensity: 1,
          labelGridCellSize: 100,
          labelRenderedSizeThreshold: 0,
          zoomToSizeRatioFunction: (x) => x,
        });

        // Personalizar la posición de los labels para que aparezcan debajo de los nodos
        renderer.getSettings().labelRenderer = function(context, data, settings) {
          if (!data.label || data.hidden) return;

          const size = data.size || 10;
          const font = settings.labelFont || "Arial";
          const weight = settings.labelWeight || "normal";
          const fontSize = (data.size || 10) * 0.6;
          const color = settings.labelColor?.color || "#ecf0f1";
          
          context.font = `${weight} ${fontSize}px ${font}`;
          context.fillStyle = color;
          context.textAlign = "center";
          context.textBaseline = "top";
          
          // Posicionar el texto más abajo del nodo con mayor separación
          const yOffset = size + fontSize + 15; // Mayor separación (antes era size + fontSize * 0.3)
          context.fillText(data.label, data.x, data.y + yOffset);
        };

        // Guardar referencia para evitar duplicación
        rendererRef.current = renderer;

        // Remove automatic node creation - keep it static
        // Just show information when clicking on stage
        renderer.on("clickStage", () => {
          console.log("Clicked on empty space - Graph is static and organized by research scores");
        });

        // Add priority-based drag and drop
        let draggedNode = null;
        let isDragging = false;

        renderer.on("downNode", (e) => {
          const nodeAttrs = graph.getNodeAttributes(e.node);
          
          // Solo permitir arrastrar nodos según prioridad
          // Prioridad 1 (primary): Siempre se puede arrastrar
          // Prioridad 2 (secondary): Se puede arrastrar
          // Prioridad 3 (tertiary): Se puede arrastrar
          // Prioridad 4 (quaternary): No se puede arrastrar
          if (nodeAttrs.priority <= 3) {
            isDragging = true;
            draggedNode = e.node;
            graph.setNodeAttribute(draggedNode, "highlighted", true);
            
            // Cambiar cursor para indicar que se puede arrastrar
            containerRef.current.style.cursor = "grabbing";
          } else {
            // Mostrar feedback visual para nodos no arrastrables
            graph.setNodeAttribute(e.node, "color", "#ff9999");
            setTimeout(() => {
              graph.setNodeAttribute(e.node, "color", nodeAttrs.color);
            }, 300);
          }
        });

        renderer.on("moveBody", ({ event }) => {
          if (!isDragging || !draggedNode) return;

          const pos = renderer.viewportToGraph(event);
          graph.setNodeAttribute(draggedNode, "x", pos.x);
          graph.setNodeAttribute(draggedNode, "y", pos.y);

          event.preventSigmaDefault();
          event.original.preventDefault();
          event.original.stopPropagation();
        });

        // Enhanced hover effects
        renderer.on("enterNode", ({ node }) => {
          const nodeAttrs = graph.getNodeAttributes(node);
          
          // Cambiar cursor según si se puede arrastrar
          if (nodeAttrs.priority <= 3) {
            containerRef.current.style.cursor = "grab";
          } else {
            containerRef.current.style.cursor = "not-allowed";
          }
          
          // Efecto hover - aumentar tamaño ligeramente
          graph.setNodeAttribute(node, "size", nodeAttrs.size * 1.2);
        });

        renderer.on("leaveNode", ({ node }) => {
          containerRef.current.style.cursor = "default";
          
          // Restaurar tamaño original
          const nodeAttrs = graph.getNodeAttributes(node);
          const originalSize = nodeProperties[nodeAttrs.group]?.size || nodeAttrs.size;
          graph.setNodeAttribute(node, "size", originalSize);
        });

        // Click para mostrar información del nodo
        renderer.on("clickNode", ({ node }) => {
          const nodeAttrs = graph.getNodeAttributes(node);
          
          // Crear tooltip o información del nodo
          console.log(`
            Title: ${nodeAttrs.fullTitle}
            Score: ${nodeAttrs.score}
            Group: ${nodeAttrs.group}
            Priority: ${nodeAttrs.priority}
          `);
          
          // Efecto visual al hacer click
          const originalColor = nodeAttrs.color;
          graph.setNodeAttribute(node, "color", "#ffd700");
          setTimeout(() => {
            graph.setNodeAttribute(node, "color", originalColor);
          }, 500);
        });

        const handleUp = () => {
          if (draggedNode) {
            graph.removeNodeAttribute(draggedNode, "highlighted");
          }
          isDragging = false;
          draggedNode = null;
          containerRef.current.style.cursor = "default";
        };

        renderer.on("upNode", handleUp);
        renderer.on("upStage", handleUp);

        // Return cleanup function
        return renderer;

      } catch (error) {
        console.error("Error initializing graph:", error);
        return null;
      }
    }, 200);

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.kill();
        rendererRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [searchResults, searchTerm, dataToUse]);

  const getTitle = () => {
    if (searchTerm) {
      return `🛰️ Search Results: "${searchTerm}"`;
    }
    return "🛰️ NASA Research Network - Score-Based Hierarchy";
  };

  const getResultsCount = () => {
    return dataToUse ? dataToUse.length : 0;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#333", marginBottom: "15px" }}>
        {getTitle()}
      </h2>
      {searchTerm && (
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
          Found {getResultsCount()} results • Relevance score sorted
        </p>
      )}
      
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
          📊 Nodes sized by research relevance score • 🎯 Priority-based dragging • 🔍 Use mouse wheel to zoom
        </div>
        <div style={{ fontSize: "12px", color: "#555", display: "flex", justifyContent: "center", gap: "25px", flexWrap: "wrap" }}>
          <span><strong style={{color: "#e74c3c", fontSize: "16px"}}>●</strong> Primary (Score: 0.371)</span>
          <span><strong style={{color: "#f39c12", fontSize: "16px"}}>●</strong> Secondary (0.299-0.337)</span>
          <span><strong style={{color: "#3498db", fontSize: "16px"}}>●</strong> Tertiary (0.292-0.323)</span>
          <span><strong style={{color: "#2ecc71", fontSize: "16px"}}>●</strong> Quaternary (0.289-0.294)</span>
        </div>
      </div>
      
      <div
        ref={containerRef}
        style={{
          width: "1000px",
          height: "700px",
          border: "none",
          borderRadius: "15px",
          display: "block",
          backgroundColor: "transparent",
          position: "relative",
          margin: "0 auto",
        }}
      />
    </div>
  );
};

export default SimpleGraph;