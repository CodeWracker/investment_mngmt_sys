import { useMutation, useQuery, useQueryClient } from "react-query";
import config from './config'; // Importe o ficheiro de configuração

const createClient = async (newClient: NewClient) => {
  return apiRequest({
    method: "POST",
    url: `${config.API_URL}/api/clients`, // Use API_URL aqui
    data: newClient,
  });
};

export function ClientList() {
    const { mutate: createNewClient } = useMutation({
      mutationFn: createClient,
      onSuccess: async () => {
        await queryClient.invalidateQueries(["clients"]);
      },
    });
} 