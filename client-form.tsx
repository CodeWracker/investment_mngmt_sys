import React from "react";
// ... outras importações ...
import config from './config'; // Importe o ficheiro de configuração

interface ClientFormProps {
  onSubmit: (values: NewClient) => void;
}

export const apiRequest = async ({ url, method, data }: ApiRequestArgs) => {
  const res = await fetch(url, {
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


export const fetchClients = async (): Promise<Client[]> => {
  const res = await fetch(`${config.API_URL}/api/clients`); // Use API_URL aqui
  if (!res.ok) {
    throw new Error("Failed to fetch clients");
  }
  return res.json();
};


export function ClientForm({ onSubmit }: ClientFormProps) {
    // ... código existente ...

    const handleSubmit = async (values: NewClient) => {
      try {
        await onSubmit(values);
        reset();
      } catch (e) {
        console.error(e);
        alert(e);
      }
    };

    // ... código existente ...
} 