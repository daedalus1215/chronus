import api from "../axios.interceptor";

export const convertTextToSpeech = async (assetId: number) => {
  const response = await api.post(`/audio/text-to-speech`, { assetId });
  return response.data;
};

export const downloadAudio = async (assetId: string) => {
  const response = await api.get(`/audio/download/${assetId}`, {
    responseType: 'blob'
  });
  return response.data;
};
