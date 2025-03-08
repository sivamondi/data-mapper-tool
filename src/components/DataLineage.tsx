import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './DataLineage.module.css';

interface Node {
  id: string;
  name: string;
  type: 'source' | 'destination' | 'mapping';
}

interface Link {
  source: string;
  target: string;
}

export function DataLineage() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Sample data
    const nodes: Node[] = [
      { id: '1', name: 'Source CSV', type: 'source' },
      { id: '2', name: 'firstName', type: 'source' },
      { id: '3', name: 'lastName', type: 'source' },
      { id: '4', name: 'Mapping Layer', type: 'mapping' },
      { id: '5', name: 'first_name', type: 'destination' },
      { id: '6', name: 'last_name', type: 'destination' },
      { id: '7', name: 'Destination CSV', type: 'destination' },
    ];

    const links: Link[] = [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '4', target: '6' },
      { source: '5', target: '7' },
      { source: '6', target: '7' },
    ];

    const width = 1200;
    const height = 800;

    // Clear previous svg content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create the force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create the links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', styles.link);

    // Create the nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', (d) => `${styles.node} ${styles[d.type]}`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 30);

    // Add labels to nodes
    node.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em');

    // Update positions on each tick
    simulation
      .nodes(nodes as any)
      .on('tick', ticked);

    (simulation.force('link') as any).links(links);

    function ticked() {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Data Lineage Visualization</h1>
      <svg ref={svgRef} className={styles.svg}></svg>
    </div>
  );
} 