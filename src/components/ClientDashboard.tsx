import React from 'react';
// ... existing imports and component setup ...

function ClientDashboard() {
  // ... existing code ...
  {{ // ... buscar dados do cliente, carteira, etc. ...

  // Supondo que você tenha:
  // - plannedDistribution: dados do plano de investimentos
  // - currentWallet: dados da carteira atual

  // Calcular distribuição real (exemplo simplificado)
  // const realDistribution = calcularDistribuicaoReal(currentWallet);

  return (
    <div>
      {/* ... outras informações do dashboard ... */}

      <h2>Comparativo Planejado vs. Real</h2>

      {/* Exibir gráfico ou tabela comparando plannedDistribution e realDistribution */}
      {/* <ComparisonChart planned={plannedDistribution} real={realDistribution} /> */}

      {/* Ou em tabela: */}
      <table>
        <thead>
          <tr>
            <th>Categoria/Subcategoria</th>
            <th>Planejado (%)</th>
            <th>Real (%)</th>
          </tr>
        </thead>
        <tbody>
          {/* Object.keys(plannedDistribution).map(categoria => (
            <tr key={categoria}>
              <td>{categoria}</td>
              <td>{plannedDistribution[categoria]}%</td>
              <td>{realDistribution[categoria]}%</td>
            </tr>
          )) */}
        </tbody>
      </table>
    </div>
  ); }}
  // ... existing code ...
}

export default ClientDashboard; 