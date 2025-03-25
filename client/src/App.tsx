import { Switch, Route } from "wouter";
import Layout from "./components/layout/layout";
import Dashboard from "./pages/dashboard";
import ClientList from "./pages/client-list";
import ClientDashboard from "./pages/client-dashboard";
import ClientCheckpoints from "./pages/client-checkpoints";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/client" component={ClientList} />
        <Route path="/client/:id" component={ClientDashboard} />
        <Route path="/checkpoints/:clientId" component={ClientCheckpoints} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
