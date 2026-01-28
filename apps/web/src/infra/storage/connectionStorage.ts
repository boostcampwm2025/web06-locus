import { getStoredRecordPins } from './recordStorage';
import type { StoredConnection } from '../types/connection';
import { getCurrentUserScopedKey } from './userScopedStorage';

const STORAGE_KEY_BASE = 'locus_connections';

/**
 * localStorage에서 연결 목록 가져오기
 */
export function getStoredConnections(): StoredConnection[] {
  try {
    const key = getCurrentUserScopedKey(STORAGE_KEY_BASE);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as StoredConnection[];
  } catch (error) {
    console.error('연결 불러오기 실패:', error);
    return [];
  }
}

/**
 * localStorage에 연결 추가
 */
export function addStoredConnection(connection: StoredConnection): void {
  try {
    const existing = getStoredConnections();
    // 중복 체크 (같은 from-to 쌍이 이미 있는지)
    const isDuplicate = existing.some(
      (c) =>
        (c.fromRecordPublicId === connection.fromRecordPublicId &&
          c.toRecordPublicId === connection.toRecordPublicId) ||
        (c.fromRecordPublicId === connection.toRecordPublicId &&
          c.toRecordPublicId === connection.fromRecordPublicId),
    );
    if (!isDuplicate) {
      existing.push(connection);
      const key = getCurrentUserScopedKey(STORAGE_KEY_BASE);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch (error) {
    console.error('연결 저장 실패:', error);
  }
}

/**
 * localStorage에서 연결 삭제
 */
export function removeStoredConnection(publicId: string): void {
  try {
    const existing = getStoredConnections();
    const filtered = existing.filter((c) => c.publicId !== publicId);
    const key = getCurrentUserScopedKey(STORAGE_KEY_BASE);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('연결 삭제 실패:', error);
  }
}

/**
 * 특정 기록과 연결된 모든 기록의 publicId 목록 가져오기
 */
export function getConnectedRecordIds(publicId: string): string[] {
  const connections = getStoredConnections();
  const connectedIds = new Set<string>();

  connections.forEach((conn) => {
    if (conn.fromRecordPublicId === publicId) {
      connectedIds.add(conn.toRecordPublicId);
    } else if (conn.toRecordPublicId === publicId) {
      connectedIds.add(conn.fromRecordPublicId);
    }
  });

  return Array.from(connectedIds);
}

/**
 * localStorage의 연결 정보로 그래프 데이터 생성
 */
export function buildGraphFromStoredConnections(startPublicId: string): {
  nodes: {
    publicId: string;
    location: { latitude: number; longitude: number };
  }[];
  edges: { fromRecordPublicId: string; toRecordPublicId: string }[];
} | null {
  const connections = getStoredConnections();
  const storedPins = getStoredRecordPins();

  // 시작 노드 찾기
  const startPin = storedPins.find((pin) => pin.publicId === startPublicId);
  if (!startPin?.coordinates) return null;

  // 연결된 모든 노드 찾기 (BFS)
  const visited = new Set<string>([startPublicId]);
  const queue = [startPublicId];
  const nodes = new Map<
    string,
    { publicId: string; location: { latitude: number; longitude: number } }
  >();
  const edges: { fromRecordPublicId: string; toRecordPublicId: string }[] = [];

  // 시작 노드 추가
  nodes.set(startPublicId, {
    publicId: startPublicId,
    location: {
      latitude: startPin.coordinates.lat,
      longitude: startPin.coordinates.lng,
    },
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    connections.forEach((conn) => {
      let nextId: string | null = null;
      if (conn.fromRecordPublicId === currentId) {
        nextId = conn.toRecordPublicId;
      } else if (conn.toRecordPublicId === currentId) {
        nextId = conn.fromRecordPublicId;
      }

      if (nextId && !visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);

        // 노드 찾기
        const nextPin = storedPins.find((pin) => pin.publicId === nextId);
        if (nextPin?.coordinates) {
          nodes.set(nextId, {
            publicId: nextId,
            location: {
              latitude: nextPin.coordinates.lat,
              longitude: nextPin.coordinates.lng,
            },
          });
        }

        // 엣지 추가
        edges.push({
          fromRecordPublicId: currentId,
          toRecordPublicId: nextId,
        });
      }
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}
