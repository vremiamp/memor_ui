import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ChatBot from './ChatBot';

interface Node {
  id: string;
  name: string;
  group: number;
  val?: number;
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  value?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const KnowledgeGraph: React.FC = () => {
  const fgRef = useRef<any>(null);

  // Helper function to generate initial positions in a circle
  const generateInitialPositions = (nodes: Node[]) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.2; // Reduced radius for tighter initial layout
    
    return nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  };

  // Sample knowledge graph data with initial positions
  const graphData: GraphData = {
    nodes: generateInitialPositions([
      { id: 'React', name: 'React', group: 1, val: 30 },
      { id: 'JavaScript', name: 'JavaScript', group: 1, val: 25 },
      { id: 'TypeScript', name: 'TypeScript', group: 1, val: 20 },
      { id: 'Node.js', name: 'Node.js', group: 2, val: 22 },
      { id: 'Express', name: 'Express', group: 2, val: 18 },
      { id: 'MongoDB', name: 'MongoDB', group: 3, val: 15 },
      { id: 'PostgreSQL', name: 'PostgreSQL', group: 3, val: 17 },
      { id: 'GraphQL', name: 'GraphQL', group: 4, val: 16 },
      { id: 'REST API', name: 'REST API', group: 4, val: 14 },
      { id: 'Docker', name: 'Docker', group: 5, val: 12 },
      { id: 'AWS', name: 'AWS', group: 5, val: 20 },
      { id: 'Git', name: 'Git', group: 6, val: 10 },
      { id: 'Machine Learning', name: 'Machine Learning', group: 7, val: 25 },
      { id: 'Python', name: 'Python', group: 7, val: 28 },
      { id: 'Data Science', name: 'Data Science', group: 7, val: 22 }
    ]),
    links: [
      { source: 'React', target: 'JavaScript', value: 5 },
      { source: 'React', target: 'TypeScript', value: 4 },
      { source: 'JavaScript', target: 'Node.js', value: 6 },
      { source: 'Node.js', target: 'Express', value: 8 },
      { source: 'Express', target: 'MongoDB', value: 3 },
      { source: 'Express', target: 'PostgreSQL', value: 4 },
      { source: 'Node.js', target: 'GraphQL', value: 3 },
      { source: 'Node.js', target: 'REST API', value: 5 },
      { source: 'Node.js', target: 'Docker', value: 2 },
      { source: 'Docker', target: 'AWS', value: 4 },
      { source: 'JavaScript', target: 'Git', value: 2 },
      { source: 'Python', target: 'Machine Learning', value: 7 },
      { source: 'Python', target: 'Data Science', value: 6 },
      { source: 'Machine Learning', target: 'Data Science', value: 8 },
      { source: 'JavaScript', target: 'Python', value: 2 },
      { source: 'TypeScript', target: 'Node.js', value: 3 }
    ]
  };

  useEffect(() => {
    if (fgRef.current) {
      // Set initial zoom to be more zoomed in
      setTimeout(() => {
        fgRef.current.zoomToFit(100); // Reduced from 400 to 100 for more zoom
      }, 100);
    }
  }, []);

  const getNodeColor = (node: Node) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    return colors[node.group % colors.length];
  };

  const handleNodeClick = (nodeId: string) => {
    if (fgRef.current) {
      // Get the current graph data with positions
      const currentGraphData = fgRef.current.graphData();
      const node = currentGraphData.nodes.find((n: any) => n.id === nodeId);
      
      if (node && node.x !== undefined && node.y !== undefined) {
        // Center the view on the node
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2, 1000);
      } else {
        // Fallback: just zoom to fit if node position not available
        fgRef.current.zoomToFit(100);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a2e', position: 'relative' }}>
      {/* ChatBot Component */}
      <ChatBot onNodeClick={handleNodeClick} />
      
      {/* Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={getNodeColor}
        nodeRelSize={3}
        nodeVal={(node: any) => Math.sqrt(node.val || 1) * 2}
        linkColor={() => 'rgba(255,255,255,0.4)'}
        linkWidth={1.5}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1}
        backgroundColor="#1a1a2e"
        width={window.innerWidth}
        height={window.innerHeight}
        onNodeClick={(node: any) => {
          console.log('Node clicked:', node);
        }}
        onNodeHover={(node: any) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        cooldownTicks={100}
        // Force simulation parameters for better spacing
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.4}
      />
    </div>
  );
};

export default KnowledgeGraph; 