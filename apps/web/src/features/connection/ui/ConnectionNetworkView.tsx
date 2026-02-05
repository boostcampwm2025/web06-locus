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
  /** 토글: "더 넓게 탐색" ↔ "현재 기록에 집중" (부모에서 scope 전환 및 필요 시 API 재조회) */
  onToggleScope?: () => void;
  /** true면 전체 그래프 뷰(버튼 라벨 "현재 기록에 집중"), false면 1-depth(버튼 라벨 "더 넓게 탐색") */
  isExpanded?: boolean;
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
  onToggleScope,
  isExpanded = false,
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

  const showScopeToggle = !!onToggleScope;

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
      {showScopeToggle && (
        <div className="absolute top-4 left-4 z-20">
          <button
            type="button"
            onClick={onToggleScope}
            className={`
        group relative flex items-center gap-3
        px-5 py-2.5 rounded-2xl
        border transition-all duration-300 ease-out
        /* 그림자: 미세한 외곽선과 부드러운 하단 그림자 */
        shadow-[0_2px_8px_rgba(0,0,0,0.04),0_10px_20px_-5px_rgba(0,0,0,0.08)]
        hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.12)]
        hover:-translate-y-0.5 active:scale-95
        ${
          isExpanded
            ? 'bg-slate-900 border-slate-800 text-white' // 확장 시: 다크하고 묵직한 느낌
            : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900' // 집중 시: 깨끗한 화이트
        }
      `}
          >
            {/* 아이콘 배경 영역 */}
            <div
              className={`
        flex items-center justify-center
        w-8 h-8 rounded-xl transition-colors duration-300
        ${isExpanded ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-slate-100'}
      `}
            >
              <span className="text-lg leading-none">
                {isExpanded ? '📍' : '🌐'}
              </span>
            </div>

            {/* 텍스트: 자간과 두께 조절 */}
            <span className="text-sm font-semibold tracking-tight">
              {isExpanded ? '현재 기록 집중' : '전체 네트워크 탐색'}
            </span>

            {/* 우측 상단 인디케이터: 현재 활성화 상태를 점으로 표현 */}
            <div
              className={`
        absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white
        ${isExpanded ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-slate-300'}
      `}
            />
          </button>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
