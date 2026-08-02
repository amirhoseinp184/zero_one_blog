import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

import { useAuth } from '../providers/AuthProvider'


export function useUserQuery() {
  const { isAuthLoading } = useAuth()

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("auth/settings/");
      return res.data;
    },
    enabled: !isAuthLoading,
  });
}

export function useUserProfileQuery({ username, enabled = true }) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await api.get(`auth/user/${username}`);
      return res.data;
    },
    enabled
  });
}


export function useMePostsQuery(){
  return useQuery({
      queryKey: ['me', 'posts'],
      queryFn: async () => {
        const res = await api.get(`/me/posts/`)
        return res.data
      }
  })
}