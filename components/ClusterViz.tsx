import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { KeywordCluster } from '../types';

interface ClusterVizProps {
  clusters: KeywordCluster[];
  topic: string;
  isDark: boolean;
}

// Renamed to ClusterNode to avoid conflict with DOM Node interface
interface ClusterNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: 'seed' | 'cluster' | 'keyword';
  val: number; // radius
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<ClusterNode> {
  source: string | ClusterNode;
  target: string | ClusterNode;
}

export const ClusterViz: React.FC<ClusterVizProps> = ({ clusters, topic, isDark }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || clusters.length === 0) return;

    // 1. Prepare Data
    const width = containerRef.current.clientWidth;
    const height = 700;
    
    // Nodes
    const nodes: ClusterNode[] = [];
    // Links
    const links: Link[] = [];

    // Add Root Node (Seed)
    nodes.push({ id: 'root', name: topic, group: 'seed', val: 25 });

    clusters.forEach(cluster => {
      // Add Cluster Node
      nodes.push({ id: `c-${cluster.name}`, name: cluster.name, group: 'cluster', val: 15 });
      
      // Link Root -> Cluster
      links.push({ source: 'root', target: `c-${cluster.name}` });

      // Add Keyword Nodes
      cluster.keywords.forEach(kw => {
        // Only add if not exists (handle duplicates just in case)
        if (!nodes.find(n => n.id === kw.term)) {
           nodes.push({ id: kw.term, name: kw.term, group: 'keyword', val: 6 });
           // Link Cluster -> Keyword
           links.push({ source: `c-${cluster.name}`, target: kw.term });
        }
      });
    });

    // 2. Setup SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .style("background", isDark ? "#151518" : "#ffffff")
      .style("transition", "background-color 0.3s ease");

    // Add Zoom behavior
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 3. Force Simulation
    const simulation = d3.forceSimulation<ClusterNode>(nodes)
      .force("link", d3.forceLink<ClusterNode, Link>(links).id((d) => d.id).distance((d) => {
         // d.target becomes a node reference after initialization
         const target = d.target as ClusterNode;
         return target.group === 'keyword' ? 40 : 150; 
      }))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide().radius((d: any) => d.val + 5).iterations(2))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 4. Render Elements
    
    // Links
    const link = g.append("g")
      .attr("stroke", isDark ? "#374151" : "#e5e7eb")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Nodes
    const node = g.append("g")
      .attr("stroke", isDark ? "#151518" : "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.val)
      .attr("fill", d => {
        if (d.group === 'seed') return "#3b82f6"; // blue-500
        if (d.group === 'cluster') return "#a855f7"; // purple-500
        return isDark ? "#4b5563" : "#9ca3af"; // gray-600 dark, gray-400 light
      })
      .call(drag(simulation));

    // Labels
    const text = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", d => d.val + 5)
      .attr("dy", ".35em")
      .text(d => d.name)
      .attr("font-size", d => {
          if (d.group === 'seed') return "16px";
          if (d.group === 'cluster') return "12px";
          return "8px";
      })
      .attr("font-weight", d => d.group === 'keyword' ? "normal" : "bold")
      .attr("fill", d => {
          if (d.group === 'keyword') return isDark ? "#9ca3af" : "#6b7280"; // gray-400 dark, gray-500 light
          return isDark ? "#f3f4f6" : "#1f2937"; // white dark, gray-800 light
      })
      .style("pointer-events", "none")
      .style("opacity", d => d.group === 'keyword' ? 0.8 : 1);


    // 5. Tick Function
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      text
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [clusters, topic, isDark]);

  // Drag behavior
  const drag = (simulation: d3.Simulation<ClusterNode, undefined>) => {
    function dragstarted(event: any, d: ClusterNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: ClusterNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: ClusterNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag<SVGCircleElement, ClusterNode>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-charcoal/90 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm transition-colors">
         <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Seed</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Cluster</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Keyword</span>
            </div>
         </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move"></svg>
    </div>
  );
};