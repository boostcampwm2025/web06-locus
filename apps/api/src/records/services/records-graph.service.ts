import { PrismaService } from '@/prisma/prisma.service';
import { TagsService } from '@/tags/tags.services';
import { Injectable } from '@nestjs/common';
import { GraphResponseDto } from '../dto/graph.response.dto';
import { GraphRowType } from '../type/graph.type';
import { GRAPH_NEIGHBOR_RAWS_SQL, GRAPH_RAWS_SQL } from '../sql/graph.raw.sql';
import { GraphRecordDto } from '../dto/graph-details.response.dto';
import { RecordRowType } from '../type/record.type';
import { RecordNotFoundException } from '../exceptions/record.exceptions';
import { GraphEdgeDto, GraphNodeDto } from '../dto/graph.dto';

@Injectable()
export class RecordGraphService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagsService: TagsService,
  ) {}

  async getGraph(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphResponseDto> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    const rows = await this.prisma.$queryRaw<GraphRowType[]>(
      GRAPH_RAWS_SQL(startRecordId, BigInt(userId)),
    );

    const { nodes, edges } = this.buildGraphFromRows(rows);

    return {
      nodes,
      edges,
      meta: {
        start: startRecordPublicId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        truncated: false,
      },
    };
  }

  async getGraphNeighborDetail(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphRecordDto[]> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    const records = await this.prisma.$queryRaw<RecordRowType[]>(
      GRAPH_NEIGHBOR_RAWS_SQL(startRecordId),
    );

    if (records.length === 0) return [];

    const recordIds = records.map((r) => r.id);
    const tags = await this.tagsService.findManyByRecordIds(userId, recordIds);
    const tagsByRecordId = this.buildTagsByRecordId(tags);

    return records.map((record) =>
      GraphRecordDto.Of(record, tagsByRecordId.get(record.id) ?? []),
    );
  }

  private async getRecordIdByPublicId(publicId: string): Promise<bigint> {
    const recordId = await this.prisma.record.findUnique({
      where: { publicId },
      select: { id: true },
    });

    if (!recordId) throw new RecordNotFoundException(publicId);

    return recordId.id;
  }

  private buildGraphFromRows(rows: GraphRowType[]): {
    nodes: GraphNodeDto[];
    edges: GraphEdgeDto[];
  } {
    const nodes: GraphNodeDto[] = [];
    const edges: GraphEdgeDto[] = [];

    for (const row of rows) {
      if (row.row_type === 'node') {
        nodes.push({
          publicId: row.node_public_id,
          location: { latitude: row.latitude, longitude: row.longitude },
        });
      } else {
        edges.push({
          fromRecordPublicId: row.from_public_id,
          toRecordPublicId: row.to_public_id,
        });
      }
    }

    return { nodes, edges };
  }

  private buildTagsByRecordId(
    tags: { recordId: bigint; tagPublicId: string; tagName: string }[],
  ): Map<bigint, { tagPublicId: string; tagName: string }[]> {
    const tagsByRecordId = new Map<
      bigint,
      { tagPublicId: string; tagName: string }[]
    >();
    for (const t of tags) {
      const arr = tagsByRecordId.get(t.recordId);
      if (arr) arr.push({ tagPublicId: t.tagPublicId, tagName: t.tagName });
      else
        tagsByRecordId.set(t.recordId, [
          { tagPublicId: t.tagPublicId, tagName: t.tagName },
        ]);
    }
    return tagsByRecordId;
  }
}
