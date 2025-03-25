import { Switch, Route } from "wouter";
import Layout from "./components/layout/layout";
import Dashboard from "./pages/dashboard";
import ClientList from "./pages/client-list";
import ClientDashboard from "./pages/client-dashboard";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={ClientList} />
        <Route path="/clients/:id" component={ClientDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
