// pages/clientes/[id].js
import React from 'react';
import { Typography, Box, Paper, Tabs, Tab, List, ListItem, ListItemText, Grid, Card, CardContent } from '@mui/material';
import Layout from '../../components/Layout';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ClientePage() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dados dummy para o cliente e suas carteiras
  const client = { id: 1, nome: 'Cliente A', cpf: '123.456.789-00' };
  const carteiras = [
    { id: 1, nome: 'Carteira 1', patrimonio: 'R$ 100.000' },
    { id: 2, nome: 'Carteira 2', patrimonio: 'R$ 200.000' },
  ];
  const selectedWallet = {
    plano: 'Plano Exemplo: 60% Ações, 40% Renda Fixa',
    estado: 'Estado atual com itens e quantidades',
    itens: [
      { id: 1, nome: 'Item 1', quantidade: 50 },
      { id: 2, nome: 'Item 2', quantidade: 100 },
    ],
    historico: [
      { data: '2025-03-01', patrimonio: 'R$ 90.000' },
      { data: '2025-03-15', patrimonio: 'R$ 100.000' },
      { data: '2025-03-26', patrimonio: 'R$ 110.000' },
    ],
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Cliente: {client.nome}
      </Typography>
      <Typography variant="subtitle1">CPF: {client.cpf}</Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Carteiras</Typography>
        <List>
          {carteiras.map((carteira) => (
            <ListItem key={carteira.id} button>
              <ListItemText primary={carteira.nome} secondary={`Patrimônio: ${carteira.patrimonio}`} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Paper sx={{ mt: 4 }}>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab label="Plano da Carteira" />
          <Tab label="Estado Atual" />
          <Tab label="Histórico" />
        </Tabs>
      </Paper>
      <TabPanel value={tabValue} index={0}>
        <Typography>{selectedWallet.plano}</Typography>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Typography>{selectedWallet.estado}</Typography>
        <List>
          {selectedWallet.itens.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.nome} secondary={`Quantidade: ${item.quantidade}`} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {selectedWallet.historico.map((hist, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{hist.data}</Typography>
                  <Typography variant="h6">{hist.patrimonio}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Layout>
  );
}
