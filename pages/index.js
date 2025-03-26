// pages/index.js
import React from 'react';
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import Layout from '../components/Layout';

export default function Dashboard() {
  // Dados dummy para KPIs e lista de clientes
  const kpis = [
    { label: 'Total Clientes', value: 10 },
    { label: 'Total Carteiras', value: 25 },
    { label: 'Patrimônio Total', value: 'R$ 1.000.000' },
  ];

  const clients = [
    { id: 1, nome: 'Cliente A', cpf: '123.456.789-00' },
    { id: 2, nome: 'Cliente B', cpf: '987.654.321-00' },
    { id: 3, nome: 'Cliente C', cpf: '111.222.333-44' },
  ];

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{kpi.label}</Typography>
                <Typography variant="h4">{kpi.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Lista de Clientes
      </Typography>
      <List>
        {clients.map((client) => (
          <ListItem key={client.id} button onClick={() => {}}>
            <ListItemText primary={client.nome} secondary={`CPF: ${client.cpf}`} />
          </ListItem>
        ))}
      </List>
    </Layout>
  );
}
