import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import demoData from '../data/demoData.json';

const CytoscapeGraph = () => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Función para determinar la categoría de prioridad basada en el score
    const getPriorityCategory = (score) => {
      if (score >= 0.371) return 'primary';           // Top 1
      if (score >= 0.329) return 'secondary';         // Top 2-5
      if (score >= 0.292) return 'tertiary';          // Top 6-15
      return 'quaternary';                            // Top 16-20
    };

    // Función para obtener el color según la categoría
    const getCategoryColor = (category) => {
      const colors = {
        primary: '#e74c3c',     // Rojo
        secondary: '#f39c12',   // Naranja
        tertiary: '#3498db',    // Azul
        quaternary: '#27ae60'   // Verde
      };
      return colors[category] || '#95a5a6';
    };

    // Función para obtener el tamaño según la categoría
    const getCategorySize = (category) => {
      const sizes = {
        primary: 50,      // Más grande
        secondary: 40,    // Grande
        tertiary: 30,     // Mediano
        quaternary: 22    // Pequeño
      };
      return sizes[category] || 18;
    };

    // Crear elementos para Cytoscape
    const elements = demoData.results.map((item, index) => {
      const category = getPriorityCategory(item.score);

      return {
        data: {
          id: `node-${item.id}`,
          label: item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title,
          fullTitle: item.title,
          score: item.score,
          category: category,
          priority: index + 1
        }
      };
    });

    // Agregar algunas conexiones entre nodos relacionados
    const edges = [];
    for (let i = 0; i < elements.length - 1; i++) {
      // Conectar cada nodo con algunos nodos cercanos en score
      if (i < 5) {
        // Los primeros 5 se conectan entre sí
        for (let j = i + 1; j < Math.min(i + 3, 5); j++) {
          edges.push({
            data: {
              id: `edge-${i}-${j}`,
              source: `node-${demoData.results[i].id}`,
              target: `node-${demoData.results[j].id}`
            },
            style: {
              'line-color': '#95a5a6',
              'width': 2,
              'opacity': 0.6,
              'curve-style': 'bezier'
            }
          });
        }
      } else if (i >= 5 && i < 15) {
        // Los nodos del medio se conectan con algunos vecinos
        if (i + 1 < 15) {
          edges.push({
            data: {
              id: `edge-${i}-${i+1}`,
              source: `node-${demoData.results[i].id}`,
              target: `node-${demoData.results[i+1].id}`
            },
            style: {
              'line-color': '#7f8c8d',
              'width': 1.5,
              'opacity': 0.4,
              'curve-style': 'bezier'
            }
          });
        }
      }
    }

    // Conectar algunos nodos de alta prioridad con los de menor prioridad
    edges.push({
      data: {
        id: 'edge-primary-secondary',
        source: `node-${demoData.results[0].id}`,
        target: `node-${demoData.results[1].id}`
      },
      style: {
        'line-color': '#e67e22',
        'width': 3,
        'opacity': 0.8,
        'curve-style': 'bezier'
      }
    });

    // Inicializar Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...elements, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'ellipse',
            'background-color': function(node) {
              return getCategoryColor(node.data('category'));
            },
            'width': function(node) {
              return getCategorySize(node.data('category'));
            },
            'height': function(node) {
              return getCategorySize(node.data('category'));
            },
            'label': 'data(label)',
            'font-size': function(node) {
              const size = getCategorySize(node.data('category'));
              return Math.max(8, size * 0.25) + 'px';
            },
            'color': '#ffffff',
            'text-valign': 'bottom',  // Labels DEBAJO de los nodos
            'text-halign': 'center',
            'text-margin-y': 8,       // Separación del nodo
            'text-wrap': 'wrap',
            'text-max-width': function(node) {
              return getCategorySize(node.data('category')) * 3;
            },
            'text-outline-color': '#000000',
            'text-outline-width': 1.5,
            'border-width': 2,
            'border-color': '#2c3e50',
            'border-opacity': 0.6,
            'overlay-padding': '3px',
            'z-index': 10
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#f1c40f',
            'border-opacity': 1
          }
        },
        {
          selector: 'edge',
          style: {
            'target-arrow-shape': 'triangle-backcurve',
            'target-arrow-color': '#95a5a6',
            'arrow-scale': 1.2,
            'curve-style': 'bezier',
            'control-point-step-size': 40
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#f39c12',
            'target-arrow-color': '#f39c12',
            'width': 3,
            'opacity': 1
          }
        }
      ],
      layout: {
        name: 'cose',  // Layout más natural y orgánico como en la imagen
        animate: true,
        animationDuration: 2500,
        animationEasing: 'ease-out-cubic',
        refresh: 20,
        fit: true,
        padding: 60,
        boundingBox: undefined,
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: function(node) {
          const category = node.data('category');
          const repulsions = {
            'primary': 8000,
            'secondary': 6000,
            'tertiary': 4000,
            'quaternary': 2000
          };
          return repulsions[category] || 1000;
        },
        nodeOverlap: 20,
        idealEdgeLength: function() {
          return 80;
        },
        edgeElasticity: function() {
          return 100;
        },
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      minZoom: 0.1,          // Zoom mínimo más pequeño
      maxZoom: 8,            // Zoom máximo más grande  
      wheelSensitivity: 0.8, // Mayor sensibilidad al wheel
      motionBlur: true,
      motionBlurOpacity: 0.2,
      pixelRatio: 'auto'
    });

    // Mejorar la interactividad del zoom con mayor sensibilidad
    cy.on('zoom', function() {
      const zoom = cy.zoom();
      
      // Ajustar tamaño de fuente según el zoom
      cy.nodes().forEach(function(node) {
        const baseSize = getCategorySize(node.data('category'));
        const fontSize = Math.max(6, (baseSize * 0.25 * Math.sqrt(zoom)));
        node.style('font-size', fontSize + 'px');
        
        // Ajustar grosor del borde según zoom
        const borderWidth = Math.max(1, 2 * Math.sqrt(zoom));
        node.style('border-width', borderWidth);
      });
      
      // Ajustar grosor de edges según zoom
      cy.edges().forEach(function(edge) {
        const edgeWidth = Math.max(1, 2 * Math.sqrt(zoom));
        edge.style('width', edgeWidth);
      });
    });

    // Eventos de interacción mejorados
    cy.on('tap', 'node', function(event) {
      const node = event.target;
      const data = node.data();
      
      // Seleccionar el nodo
      cy.elements().removeClass('highlighted');
      node.addClass('highlighted');
      
      // Animar el nodo seleccionado
      const originalSize = getCategorySize(data.category);
      node.animate({
        style: {
          'width': originalSize * 1.3,
          'height': originalSize * 1.3
        }
      }, {
        duration: 200,
        complete: function() {
          node.animate({
            style: {
              'width': originalSize,
              'height': originalSize
            }
          }, {
            duration: 200
          });
        }
      });

      console.log(`📊 ${data.fullTitle || data.label}`);
      console.log(`🎯 Score: ${data.score} | Prioridad: ${data.priority}`);
    });

    // Efectos de hover mejorados
    cy.on('mouseover', 'node', function(event) {
      const node = event.target;
      node.style({
        'border-width': 4,
        'border-color': '#ffffff',
        'border-opacity': 1
      });
      
      // Mostrar título completo en hover si existe
      const fullTitle = node.data('fullTitle');
      if (fullTitle && fullTitle !== node.data('label')) {
        node.style('label', fullTitle);
      }
      
      containerRef.current.style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node', function(event) {
      const node = event.target;
      node.style({
        'border-width': 2,
        'border-color': '#2c3e50',
        'border-opacity': 0.6
      });
      
      // Restaurar label corto
      node.style('label', node.data('label'));
      containerRef.current.style.cursor = 'default';
    });

    // Drag functionality con restricción por prioridad
    cy.on('grab', 'node', function(event) {
      const node = event.target;
      const priority = node.data('priority');
      
      // Solo permitir arrastrar los nodos de mayor prioridad (top 10)
      if (priority > 10) {
        event.preventDefault();
        return false;
      }
      
      node.style('cursor', 'grabbing');
    });

    cy.on('free', 'node', function(event) {
      const node = event.target;
      node.style('cursor', 'grab');
    });

    cyRef.current = cy;

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <h2 style={{ color: '#333', marginBottom: '15px' }}>
        �️ NASA Research Network - Biology Papers Ecosystem
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          📊 Organic layout with labels below nodes • 🎯 Priority-based dragging • 🔍 Enhanced zoom sensitivity
        </div>
        <div style={{ fontSize: '12px', color: '#555', display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}>
          <span><strong style={{color: '#e74c3c', fontSize: '16px'}}>●</strong> Primary (Score: 0.371)</span>
          <span><strong style={{color: '#f39c12', fontSize: '16px'}}>●</strong> Secondary (0.299-0.337)</span>
          <span><strong style={{color: '#3498db', fontSize: '16px'}}>●</strong> Tertiary (0.292-0.323)</span>
          <span><strong style={{color: '#27ae60', fontSize: '16px'}}>●</strong> Quaternary (0.289-0.294)</span>
        </div>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '700px',
          backgroundColor: 'transparent',
          borderRadius: '15px',
          position: 'relative',
          margin: '0 auto',
        }}
      />

      {/* Controls */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={() => cyRef.current?.fit(undefined, 50)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🎯 Fit View
        </button>
        <button
          onClick={() => cyRef.current?.center()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🏠 Center
        </button>
        <button
          onClick={() => cyRef.current?.layout({ 
            name: 'circle', 
            animate: true, 
            animationDuration: 1500,
            radius: Math.min(700, 700) / 3
          }).run()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🔄 Circle Layout
        </button>
        <button
          onClick={() => cyRef.current?.layout({ 
            name: 'cose',
            animate: true,
            animationDuration: 2000,
            randomize: true
          }).run()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🌐 Organic Layout
        </button>
      </div>
    </div>
  );
};

export default CytoscapeGraph;