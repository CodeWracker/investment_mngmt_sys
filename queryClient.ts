import { QueryClient } from "react-query";
import config from './config'; // Importe o ficheiro de configuração

interface ApiRequestArgs {
  url: string;
  method?: string;
  data?: any;
}

export const apiRequest = async ({ url, method, data }: ApiRequestArgs) => {
  const res = await fetch(`${config.API_URL}${url}`, { // Use API_URL aqui e concatene com o resto do URL
    method: method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : null,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`${res.status} - ${res.statusText} - ${message} - url: ${url}`);
  }
  return res.json();
};


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        return apiRequest({ url });
      },
    },
  },
});

export default queryClient; 