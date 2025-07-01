export type Note = {
    notes: {name: string, id: number, isMemo: number}[];
    hasMore: boolean;
    nextCursor: number;
  }