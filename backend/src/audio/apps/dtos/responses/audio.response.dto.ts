export type AudioResponse = {
  data: Buffer;
  headers: {
    [key: string]: string;
  };
};

export type AudioDownloadResult = {
  data: Buffer;
  contentType: string;
  contentDisposition: string;
  fileName: string;
};
