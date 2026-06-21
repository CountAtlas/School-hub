import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import NotesPage from "./pages/NotesPage";
import PracticalsPage from "./pages/PracticalsPage";
import PracticalDetailPage from "./pages/PracticalDetailPage";
import ResourcesPage from "./pages/ResourcesPage";
import AboutPage from "./pages/AboutPage";
import SubmitPage from "./pages/SubmitPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSubmissionsPage from "./pages/AdminSubmissionsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><HomePage /></Layout>} />
      <Route path="/notes" component={() => <Layout><NotesPage /></Layout>} />
      <Route path="/practicals" component={() => <Layout><PracticalsPage /></Layout>} />
      <Route path="/practicals/:id" component={() => <Layout><PracticalDetailPage /></Layout>} />
      <Route path="/resources" component={() => <Layout><ResourcesPage /></Layout>} />
      <Route path="/about" component={() => <Layout><AboutPage /></Layout>} />
      <Route path="/submit" component={() => <Layout><SubmitPage /></Layout>} />
      <Route path="/admin/login" component={() => <Layout><AdminLoginPage /></Layout>} />
      <Route path="/admin/submissions" component={() => <Layout><AdminSubmissionsPage /></Layout>} />
      <Route component={() => (
        <Layout>
          <main className="min-h-screen px-6 py-10 text-white">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-5xl font-bold">404</h1>
              <p className="mt-4 text-zinc-400">Page not found.</p>
            </div>
          </main>
        </Layout>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
