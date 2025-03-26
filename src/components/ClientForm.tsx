import React from 'react';
// ... existing imports and component setup ...

function ClientForm() {
  // ... existing code ...
  return (
    <form>
      {/* ... campos de dados do cliente (nome, etc.) ... */}

      {{ <h2>Plano de Investimentos</h2>

      <div>
        <label htmlFor="reservaEmergencia">Reserva de Emergência:</label>
        <input type="number" id="reservaEmergencia" name="reservaEmergencia" />
      </div>

      <h3>Distribuição de Investimentos</h3>
      {/* Aqui você pode adicionar campos dinâmicos para categorias e subcategorias
         e suas respectivas porcentagens. Pode ser um loop que renderiza
         campos para cada categoria/subcategoria. */}
      <div>
        {/* Exemplo simplificado - você precisará adaptar para sua estrutura de dados */}
        <label htmlFor="categoria1">Categoria 1 (%):</label>
        <input type="number" id="categoria1" name="categoria1" />

        <label htmlFor="subcategoria1">Subcategoria 1 (%):</label>
        <input type="number" id="subcategoria1" name="subcategoria1" />
        {/* ... mais campos de categoria/subcategoria ... */}
      </div> }}

      <button type="submit">Criar Cliente</button>
    </form>
  );
}

export default ClientForm; 