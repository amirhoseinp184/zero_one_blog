import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export function useUpdateSettingsMutations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => {
      return api.post("auth/settings/", settings);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useCreatePostMutations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => {
      return api.post("me/posts/", settings);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] });
    },
  });
}
