import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GraphNode } from '@locus/shared';
import type { GraphEdgeResponse } from '@/infra/types/connection';

export interface ConnectionNetworkViewProps {
  nodes: GraphNode[];
  edges: GraphEdgeResponse[];
  baseRecordPublicId?: string;
  width?: number;
  height?: number;
  onNodeClick?: (publicId: string) => void;
  className?: string;
  theme?: 'tech-blueprint' | 'default';
}

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  displayTitle: string;
  title?: string;
  publicId: string;
}

export default function ConnectionNetworkView({
  nodes,
  edges,
  baseRecordPublicId,
  width: initialWidth,
  height: initialHeight,
  onNodeClick,
  className = '',
  theme = 'tech-blueprint',
}: ConnectionNetworkViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualWidth, setActualWidth] = useState(initialWidth ?? 400);
  const [actualHeight, setActualHeight] = useState(initialHeight ?? 300);

  // width/height 미지정 시 부모(컨테이너) 크기 측정
  useEffect(() => {
    if (
      (initialWidth != null && initialHeight != null) ||
      !containerRef.current
    )
      return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (initialWidth == null) setActualWidth(Math.floor(width));
        if (initialHeight == null) setActualHeight(Math.floor(height));
      }
    });
    ro.observe(el);
    if (initialWidth == null) setActualWidth(Math.floor(el.clientWidth));
    if (initialHeight == null) setActualHeight(Math.floor(el.clientHeight));
    return () => ro.disconnect();
  }, [initialWidth, initialHeight]);

  useEffect(() => {
    const w = initialWidth ?? actualWidth;
    const h = initialHeight ?? actualHeight;
    if (
      !nodes ||
      nodes.length === 0 ||
      !containerRef.current ||
      w <= 0 ||
      h <= 0
    )
      return;

    const container = containerRef.current;
    d3.select(container).selectAll('svg').remove();

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('viewBox', [0, 0, w, h])
      .style('cursor', 'grab');

    const graphContainer = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (ev: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        graphContainer.attr('transform', ev.transform.toString());
      });
    svg.call(zoom);

    const simulationNodes: SimulationNode[] = nodes.map((n) => {
      const node = n as GraphNode & { title?: string };
      return {
        ...node,
        id: node.publicId,
        displayTitle: node.title ?? '제목 없음',
      };
    });

    const simulationLinks: d3.SimulationLinkDatum<SimulationNode>[] = edges.map(
      (e) => ({
        source: e.fromRecordPublicId,
        target: e.toRecordPublicId,
      }),
    );

    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, d3.SimulationLinkDatum<SimulationNode>>(
            simulationLinks,
          )
          .id((d) => d.id)
          .distance(110),
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force(
        'collision',
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => (d.id === baseRecordPublicId ? 60 : 40)),
      );

    const link = graphContainer
      .append('g')
      .selectAll('line')
      .data(simulationLinks)
      .join('line')
      .attr('stroke', theme === 'tech-blueprint' ? '#E2E8F0' : '#FE891622')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', theme === 'tech-blueprint' ? '4,4' : 'none');

    const nodeGroup = graphContainer
      .append('g')
      .selectAll<SVGGElement, SimulationNode>('g')
      .data(simulationNodes)
      .join('g')
      .attr('cursor', 'grab')
      .on('click', (_event, d) => {
        onNodeClick?.(d.id);
      })
      .call(
        d3
          .drag<SVGGElement, SimulationNode>()
          .on(
            'start',
            (
              event: d3.D3DragEvent<
                SVGGElement,
                SimulationNode,
                SimulationNode
              >,
              d,
            ) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            },
          )
          .on(
            'drag',
            (
              event: d3.D3DragEvent<
                SVGGElement,
                SimulationNode,
                SimulationNode
              >,
              d,
            ) => {
              d.fx = event.x;
              d.fy = event.y;
            },
          )
          .on(
            'end',
            (
              event: d3.D3DragEvent<
                SVGGElement,
                SimulationNode,
                SimulationNode
              >,
              d,
            ) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = undefined;
              d.fy = undefined;
            },
          ),
      );

    nodeGroup
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#FFFFFF')
      .attr('stroke', (d) =>
        d.id === baseRecordPublicId ? '#FE8916' : '#94A3B8',
      )
      .attr('stroke-width', 3);

    nodeGroup
      .append('text')
      .attr('x', 15)
      .attr('dy', 4)
      .attr('fill', '#475569')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text((d) =>
        d.displayTitle.length > 8
          ? d.displayTitle.slice(0, 7) + '…'
          : d.displayTitle,
      );

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimulationNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimulationNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimulationNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimulationNode).y ?? 0);
      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [
    nodes,
    edges,
    baseRecordPublicId,
    theme,
    initialWidth,
    actualWidth,
    initialHeight,
    actualHeight,
    onNodeClick,
  ]);

  const h = initialHeight ?? actualHeight;
  const fillParent = initialHeight == null;
  const wrapperStyle = fillParent
    ? { width: '100%' as const, height: '100%' as const }
    : { width: '100%' as const, height: h };

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-inner ${className}`}
      style={wrapperStyle}
    >
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden opacity-30"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
