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

export function useEditPostMutations(){
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => {
      return api.patch(`me/posts/${payload.slug}/`, payload.data)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["me", "posts"] })
    }
  })
}


export function useDeletePostMutations(){
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug) => {
      return api.delete(`me/posts/${slug}/`)
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["me", "posts"]})
    },
    retry:1
  })
}

export function useFollowMutation({username}){
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`u/${username}/follow/`)
      return res.data
    },
    onSuccess: ()=> {
      queryClient.invalidateQueries({queryKey: ["profile", username]})
    }
  })
}

export function useUnfollowMutation({username}){
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`u/${username}/unfollow/`)
      return res.data
    },
    onSuccess: ()=> {
      queryClient.invalidateQueries({queryKey: ["profile", username]})
    }
  })
}