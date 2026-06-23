export function useApiFetch<T>(path: string) {
  return useFetch<T>(path, {
    baseURL: '/api',
    headers: {
      accept: 'application/json',
    },
  })
}
