import { getUserInfo } from "@/services/userService";
import { getDOInfoByWorkItemId } from "@/services/workService";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
  });
};

export const userDOInfoByWorkItem = (workItemId: string) => {
  return useQuery({
    queryKey: ["userDOInfoByWorkItem", workItemId],
    queryFn: () => getDOInfoByWorkItemId(workItemId),
    enabled: !!workItemId, // Only run the query if workItemId is provided
  });
};
