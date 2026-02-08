export interface AudioResponse {
  data: Buffer;
  headers: {
    [key: string]: string;
  };
}

export interface AudioDownloadResult {
  data: Buffer;
  contentType: string;
  contentDisposition: string;
  fileName: string;
}
