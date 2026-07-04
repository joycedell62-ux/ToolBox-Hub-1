import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Layout from './components/Layout';
import Home from './pages/Home';
import PasswordGenerator from './pages/PasswordGenerator';
import QrCodeGenerator from './pages/QrCodeGenerator';
import WordCounter from './pages/WordCounter';
import BmiCalculator from './pages/BmiCalculator';
import AgeCalculator from './pages/AgeCalculator';
import LoanCalculator from './pages/LoanCalculator';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/password-generator" component={PasswordGenerator} />
        <Route path="/qr-code-generator" component={QrCodeGenerator} />
        <Route path="/word-counter" component={WordCounter} />
        <Route path="/bmi-calculator" component={BmiCalculator} />
        <Route path="/age-calculator" component={AgeCalculator} />
        <Route path="/loan-calculator" component={LoanCalculator} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;