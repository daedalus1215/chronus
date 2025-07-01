import { useQuery } from "@tanstack/react-query";
import { fetchTags } from "../../../api/requests/fetchTags";

export const useAllTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}; 