export interface AudioResponse {
  data: Buffer;
  headers: {
    [key: string]: string;
  };
}
