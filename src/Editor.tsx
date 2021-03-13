import React, { RefObject, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from './test_data.json';
import type { BaseType } from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}
interface Link extends d3.SimulationLinkDatum<Node> {
  //source: string;
  //target: string;
  value: number;
}

export const Editor = () => {
  const ref: RefObject<SVGSVGElement> = useRef(null);
  useEffect(() => {
    if (ref.current === null) return;
    const svg = d3.select(ref.current);
    const [width, height] = [800, 500];
    svg.attr('width', width).attr('height', height);

    // d3 overloads the Object prototype, including Object.create
    // I don't like it but it's not my fault
    const links: Link[] = data.links.map((d) => Object.create(d));
    const nodes: Node[] = data.nodes.map((d) => Object.create(d));

    const simulation: d3.Simulation<Node, Link> = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink<Node, Link>(links).id((d) => d.id),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const drag = (simulation: d3.Simulation<Node, Link>) => {
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
      return d3
        .drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };

    // need a root group on which to apply global transformations, e.g. zoom
    const root = svg.append('g');
    const link: d3.Selection<
      SVGLineElement | BaseType,
      Link,
      SVGGElement,
      unknown
    > = root
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#triangle)')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = root
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll<SVGCircleElement, Node>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', 'tomato') // TODO add color func
      .call(drag(simulation));

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (e: any) => root.attr('transform', e.transform));

    svg.call(zoom);

    node.append('title').text((d) => d.id);

    simulation.on('tick', () => {
      // yeah this is horrible but also necessary
      // technically Link.source and Link.target have type Node | number | string
      // so we have to convinvce the compiler that it is Node
      // also, we have to null coalesce from undefined to null
      link
        .attr('x1', (d) =>
          typeof d.source === 'object' ? d.source.x ?? null : null,
        )
        .attr('y1', (d) =>
          typeof d.source === 'object' ? d.source.y ?? null : null,
        )
        .attr('x2', (d) =>
          typeof d.target === 'object' ? d.target.x ?? null : null,
        )
        .attr('y2', (d) =>
          typeof d.target === 'object' ? d.target.y ?? null : null,
        );

      // more null coalescing from undefined to null
      node.attr('cx', (d) => d.x ?? null).attr('cy', (d) => d.y ?? null);
    });

    // cleanup func, remove all children and stop simulation
    return () => {
      svg.selectAll('g').remove();
      simulation.stop();
    };
  }, []);

  return (
    <div>
      <svg ref={ref}>
        <defs>
          <marker
            id="triangle"
            markerUnits="userSpaceOnUse"
            markerWidth="10"
            markerHeight="7"
            refX="15" // offset arrow by its length (10) + node radius (5)
            refY="3.5" // offset arrow by half its width (7)
            orient="auto"
            // match stroke params for links
            stroke="#999"
            strokeOpacity="0.6"
            fill="#999"
            fillOpacity="0.6"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};
