import { GetTagsByUserIdProjection } from "src/tags/domain/transaction-scripts/get-tags-by-user-id.projection";

export const tagsByUserIdHydrator = (
  rows: [
    {
      tag_id: string;
      tag_name: string;
      noteCount: string;
    },
  ]
): GetTagsByUserIdProjection[] =>
  rows.map((row) => ({
    id: row.tag_id,
    name: row.tag_name,
    noteCount: parseInt(row.noteCount, 10),
  }));
