import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ChatBot from './ChatBot';
import knowledgeGraphData from './data.json';

interface Node {
  id: string;
  type: string;
  name: string;
  aliases: string[];
  description?: string;
  provenance: {
    row_ids: number[];
    first_seen: string;
  };
  x?: number;
  y?: number;
  expanded?: boolean;
  fx?: number; // Fixed x position
  fy?: number; // Fixed y position
}

interface GraphData {
  nodes: Node[];
  links: Array<{
    source: string;
    target: string;
    value?: number;
    confidence?: number;
    type?: string;
  }>;
}

const KnowledgeGraph: React.FC = () => {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [hasExpandedNode, setHasExpandedNode] = useState(false);

  // Helper function to generate initial positions in a circle
  const generateInitialPositions = (nodes: Node[]) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.2;
    
    return nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        expanded: false,
        fx: undefined,
        fy: undefined
      };
    });
  };

  // Transform the knowledge graph data
  useEffect(() => {
    const transformedData: GraphData = {
      nodes: generateInitialPositions(knowledgeGraphData.nodes),
      links: knowledgeGraphData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.signals.similarity * 10,
        confidence: edge.confidence,
        type: edge.type
      }))
    };
    setGraphData(transformedData);
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(100);
      }, 100);
    }
  }, [graphData]);

  const getNodeColor = (node: Node) => {
    // Even lighter blue color scheme
    const typeColors: { [key: string]: string } = {
      'Concept': '#F0F8FF',      // Alice blue - very light
      'Entity': '#F5F9FF',       // Even lighter blue
      'Process': '#FAFCFF',      // Almost white with blue tint
      'Technology': '#F2F7FF',   // Very light blue
      'Method': '#F7FBFF',       // Very light blue
      'Framework': '#F4F8FF',    // Very light blue
      'Protocol': '#EFF4FF'      // Very light blue
    };
    return typeColors[node.type] || '#FAFCFF'; // Default to almost white
  };

  const getNodeSize = (node: Node) => {
    const aliasCount = node.aliases.length;
    const connectionCount = graphData.links.filter(
      link => link.source === node.id || link.target === node.id
    ).length;
    return Math.sqrt(aliasCount + connectionCount + 1) * 3;
  };

  const getLinkColor = (link: any) => {
    const confidence = link.confidence || 0;
    if (confidence > 0.8) return 'rgba(100, 149, 237, 0.8)'; // Cornflower blue for high confidence
    if (confidence > 0.6) return 'rgba(135, 206, 250, 0.8)'; // Light sky blue for medium confidence
    return 'rgba(173, 216, 230, 0.8)'; // Light blue for low confidence
  };

  const getLinkWidth = (link: any) => {
    const confidence = link.confidence || 0;
    return Math.max(1, confidence * 3);
  };

  const handleNodeClick = (nodeId: string) => {
    if (fgRef.current) {
      // Find the node in our current graph data
      const node = graphData.nodes.find((n: any) => n.id === nodeId);
      
      if (node && node.x !== undefined && node.y !== undefined) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2, 1000);
      } else {
        fgRef.current.zoomToFit(100);
      }
    }
  };

  const handleNodeClickInternal = (node: any) => {
    setGraphData(prevData => {
      const newNodes = prevData.nodes.map(n => {
        if (n.id === node.id) {
          // Toggle expansion for clicked node
          const newExpanded = !n.expanded;
          return {
            ...n,
            expanded: newExpanded,
            // Fix position when expanding to prevent movement
            fx: newExpanded ? n.x : undefined,
            fy: newExpanded ? n.y : undefined
          };
        } else {
          // Close other expanded nodes and unfix their positions
          return {
            ...n,
            expanded: false,
            fx: undefined,
            fy: undefined
          };
        }
      });
      
      return {
        ...prevData,
        nodes: newNodes
      };
    });
    
    // Update expanded state
    const newExpanded = !node.expanded;
    setHasExpandedNode(newExpanded);
    
    console.log('Node clicked:', node);
  };

  // Custom node renderer to create expandable boxes
  const customNodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const expandedFontSize = 10 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Calculate dimensions
    const textWidth = ctx.measureText(label).width;
    const baseBoxWidth = textWidth + 20;
    const baseBoxHeight = 28;
    const borderRadius = 4;
    
    let boxWidth = baseBoxWidth;
    let boxHeight = baseBoxHeight;
    let content = [label];
    
    // If expanded, show more content
    if (node.expanded) {
      const description = node.description || 'No description available yet.';
      const typeText = `Type: ${node.type}`;
      const aliasesText = node.aliases.length > 0 ? `Aliases: ${node.aliases.join(', ')}` : '';
      
      content = [label, typeText, aliasesText, description];
      
      // Calculate expanded dimensions
      ctx.font = `${expandedFontSize}px Sans-Serif`;
      const maxTextWidth = Math.max(
        ...content.map(text => ctx.measureText(text).width)
      );
      
      boxWidth = Math.max(maxTextWidth + 20, 200); // Minimum width for expanded
      boxHeight = content.length * (expandedFontSize + 4) + 16; // Height based on content
    }
    
    // Set node size for collision detection (but don't let it affect positioning)
    node.__size = Math.max(boxWidth, boxHeight) / 2;
    
    // Draw rounded rectangle background
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.roundRect(node.x - boxWidth/2, node.y - boxHeight/2, boxWidth, boxHeight, borderRadius);
    ctx.fill();
    
    // Draw rounded rectangle border
    ctx.strokeStyle = node.expanded ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)';
    ctx.lineWidth = (node.expanded ? 2 : 1) / globalScale;
    ctx.beginPath();
    ctx.roundRect(node.x - boxWidth/2, node.y - boxHeight/2, boxWidth, boxHeight, borderRadius);
    ctx.stroke();
    
    // Draw content
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    
    if (node.expanded) {
      // Draw expanded content
      ctx.font = `${expandedFontSize}px Sans-Serif`;
      const lineHeight = expandedFontSize + 4;
      const startY = node.y - (content.length - 1) * lineHeight / 2;
      
      content.forEach((text, index) => {
        const y = startY + index * lineHeight;
        if (index === 0) {
          // Title in bold
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          ctx.fillText(text, node.x, y);
          ctx.font = `${expandedFontSize}px Sans-Serif`;
        } else {
          ctx.fillText(text, node.x, y);
        }
      });
    } else {
      // Draw normal content
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillText(label, node.x, node.y);
    }
  };

  if (graphData.nodes.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        background: '#1a1a2e', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading knowledge graph...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a2e', position: 'relative' }}>
      {/* ChatBot Component */}
      <ChatBot onNodeClick={handleNodeClick} />
      
      {/* Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={customNodeCanvasObject}
        nodeVal={(node: any) => getNodeSize(node)}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        backgroundColor="#1a1a2e"
        width={window.innerWidth}
        height={window.innerHeight}
        onNodeClick={handleNodeClickInternal}
        onNodeHover={(node: any) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        cooldownTicks={hasExpandedNode ? 0 : 100} // Disable simulation when expanded
        d3AlphaDecay={hasExpandedNode ? 1 : 0.02} // Stop simulation immediately when expanded
        d3VelocityDecay={0.4}
      />
    </div>
  );
};

export default KnowledgeGraph; 