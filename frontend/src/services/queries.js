import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
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

export function useUserProfileQuery({ username, enabled=true }) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await api.get(`u/${username}`);
      return res.data;
    },
    enabled,
    retry:1
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

export function useMePostDetailQuery({slug}){
  return useQuery({
    queryKey: ['me', 'posts', slug],
    queryFn: async () => {
      const res = await api.get(`/me/posts/${slug}`)
      return res.data
    }
  })
}


export function useFeedQuery(){
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await api.get(`feed/`)
      return res.data
    },
    initialPageParam: '',
    getNextPageParam: (lastPage, pages) => lastPage.next
  })
}


export function usePublicPostListQuery({username}){
  return useQuery({
    queryKey: ['public', username],
    queryFn: async() => {
      const res = await api.get(`u/${username}/posts/`)
      return res.data
    }
  })
}

export function usePublicPostDetailQuery({username, postSlug}){
  return useQuery({
    queryKey: ['public', username, postSlug],
    queryFn: async() => {
      const res = await api.get(`u/${username}/posts/${postSlug}/`)
      return res.data
    }
  })
}