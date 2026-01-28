export type GraphRowType =
  | {
      row_type: 'node';
      node_public_id: string;
      latitude: number;
      longitude: number;
      from_public_id: null;
      to_public_id: null;
    }
  | {
      row_type: 'edge';
      node_public_id: null;
      latitude: null;
      longitude: null;
      from_public_id: string;
      to_public_id: string;
    };
