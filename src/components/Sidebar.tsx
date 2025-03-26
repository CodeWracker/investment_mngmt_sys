function Sidebar() {
  return (
    <div>
      <ul>
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/investimentos">Investimentos</a>
        </li>
        {{ <li>
          <a href="/checkpoints">Histórico de Checkpoints</a>
        </li> }}
      </ul>
    </div>
  );
}

export default Sidebar; 