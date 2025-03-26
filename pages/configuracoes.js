// pages/configuracoes.js
import React from 'react';
import { Typography, Box, Tabs, Tab, List, ListItem, ListItemText, Paper } from '@mui/material';
import Layout from '../components/Layout';

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

export default function Configuracoes() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dados dummy para configurações
  const eventoTipos = [
    { id: 1, nome: 'Compra' },
    { id: 2, nome: 'Venda' },
    { id: 3, nome: 'Dividendos' },
  ];

  const classes = [
    { id: 1, nome: 'Ações' },
    { id: 2, nome: 'Renda Fixa' },
  ];

  const subclasses = [
    { id: 1, nome: 'Blue Chips' },
    { id: 2, nome: 'Small Caps' },
  ];

  const corretoras = [
    { id: 1, nome: 'Corretora X' },
    { id: 2, nome: 'Corretora Y' },
  ];

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab label="Tipos de Evento" />
          <Tab label="Classes & Subclasses" />
          <Tab label="Corretoras" />
        </Tabs>
      </Paper>
      <TabPanel value={tabValue} index={0}>
        <List>
          {eventoTipos.map((tipo) => (
            <ListItem key={tipo.id}>
              <ListItemText primary={tipo.nome} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6">Classes</Typography>
        <List>
          {classes.map((cl) => (
            <ListItem key={cl.id}>
              <ListItemText primary={cl.nome} />
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" sx={{ mt: 2 }}>Subclasses</Typography>
        <List>
          {subclasses.map((sub) => (
            <ListItem key={sub.id}>
              <ListItemText primary={sub.nome} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <List>
          {corretoras.map((cor) => (
            <ListItem key={cor.id}>
              <ListItemText primary={cor.nome} />
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </Layout>
  );
}
