import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard – Clientes
      </Typography>
      <List>
        {clientes.map((cliente) => (
          <ListItem key={cliente.id_cliente}>
            <ListItemText
              primary={cliente.nome}
              secondary={`CPF: ${cliente.cpf || '-'} | CNPJ: ${cliente.cnpj || '-'}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
