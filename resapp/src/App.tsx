import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CountryDetail from "./pages/CountryDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";


const App: React.FC = () => (
  <BrowserRouter>
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="grow p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/country/:code" element={<CountryDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  </BrowserRouter>
);

export default App;
