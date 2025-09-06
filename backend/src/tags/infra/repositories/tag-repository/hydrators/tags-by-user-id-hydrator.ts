import { TagWithCount } from "src/tags/domain/transaction-scripts/get-tags-by-user-id.transaction.script";

export const tagsByUserIdHydrator = (
  rows: [
    {
      tag_id: string;
      tag_name: string;
      noteCount: string;
    },
  ]
): TagWithCount[] =>
  rows.map((row) => ({
    id: row.tag_id,
    name: row.tag_name,
    noteCount: parseInt(row.noteCount, 10),
  }));
