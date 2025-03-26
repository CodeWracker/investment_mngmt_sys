// pages/clientes/index.js
import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function ClientesList() {
  const router = useRouter();
  const clients = [
    { id: 1, nome: 'Cliente A', cpf: '123.456.789-00' },
    { id: 2, nome: 'Cliente B', cpf: '987.654.321-00' },
  ];

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>
      <List>
        {clients.map((client) => (
          <ListItem key={client.id} button onClick={() => router.push(`/clientes/${client.id}`)}>
            <ListItemText primary={client.nome} secondary={`CPF: ${client.cpf}`} />
          </ListItem>
        ))}
      </List>
    </Layout>
  );
}
