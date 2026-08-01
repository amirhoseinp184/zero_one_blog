import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export function useUpdateSettingsMutations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => {
      return api.post("auth/settings/", settings)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
