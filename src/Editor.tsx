import React, { RefObject, useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const Editor = () => {
  const ref: RefObject<SVGSVGElement> = useRef(null);
  useEffect(() => {
    d3.select(ref.current)
      .attr('width', 300)
      .attr('height', 300)
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'tomato');
  }, []);

  return (
    <div>
      <svg ref={ref}></svg>
    </div>
  );
};
