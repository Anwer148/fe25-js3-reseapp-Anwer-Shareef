import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import type { CountryData } from "../types/types";

//skapar array regions
const regions = [
  "All",
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Antarctic",
];

const API_KEY = "rc_live_612932e0fa354223b97908bebe644496";

const Home: React.FC = () => {
 
  const [countries, setCountries] = useState<CountryData[]>([]);

  const [loading, setLoading] = useState(true);
  //error för ev errors
  const [error, setError] = useState("");
  //hur många länder som visas per sida
  const pageSize = 12;
  //URL parametrar läses och uppdateras här
  const [searchParams, setSearchParams] = useSearchParams();
  //hämtar värdet för query parametern med fallback
  const query = searchParams.get("query") || "";
  //hämtar värdet för region parametern med fallback
  const region = searchParams.get("region") || "All";
  //hämtar och värdet för sidonummer med fallback
  const page = Number(searchParams.get("page") || 1);

  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        //laddar medans vi fetchar
        setLoading(true);

        const allData: any[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
          const res = await fetch(
            `https://api.restcountries.com/countries/v5?limit=${limit}&offset=${offset}`,
            {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
            }
          );
          if (!res.ok) throw new Error("Fetch failed");
          const raw = await res.json();

          const payload = raw?.data ?? raw;
          const pageItems: any[] = Array.isArray(payload)
            ? payload
            : (Object.values(payload || {}).find(Array.isArray) as any[]) || [];

          allData.push(...pageItems);

          if (!raw?.data?.meta?.more || pageItems.length === 0) {
            break;
          }
          offset += limit;
        }

        // respektive data i vår response på
        //rätt plats i c, sparar det i mapped variabeln
        const mapped = allData.map((c: any) => {
          const coords = c?.capitals?.[0]?.coordinates || c?.coordinates;
          const latlng =
            coords && typeof coords.lat === "number" && typeof coords.lng === "number"
              ? [coords.lat, coords.lng]
              : c?.capitalInfo?.latlng || c?.latlng;

          return {
            name: c?.names?.common || c?.name?.common,
            officialName: c?.names?.official || c?.name?.official,
            region: c?.region,
            subregion: c?.subregion,
            capital: c?.capitals?.[0]?.name || c?.capital?.[0],
            flagUrl: c?.flag?.url_png || c?.flag?.url_svg || c?.flags?.png,
            latlng,
            cca3: c?.codes?.alpha_3 || c?.cca3,
            languages: Array.isArray(c?.languages)
              ? c.languages.map((l: any) => l?.name || l)
              : c?.languages
              ? Object.values(c.languages)
              : [],
            currency: Array.isArray(c?.currencies)
              ? c.currencies.map((cur: any) => cur?.code || cur?.name || cur)
              : c?.currencies
              ? Object.keys(c.currencies)
              : [],
          };
        });
        //ändrar countries till mapped variabeln
        setCountries(mapped);
      } catch {
        setError("Kunde inte hämta länder.");
        // om inga länder
      } finally {
        setLoading(false);
      }
    };
    //anropar fetchcountries, som igen, endast körs on mount
    fetchCountries();
  }, []);

 
  const filtered = countries.filter((c) => {
   
    const matchRegion = region === "All" || c.region === region;
    
    const matchQuery = c.name.toLowerCase().includes(query.toLowerCase());
    return matchRegion && matchQuery;
  });

  
  const totalPages = Math.ceil(filtered.length / pageSize);
  

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

 
  const handleRegionChange = (r: string) => {
    setSearchParams({ query, region: r, page: "1" });
  };

 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ query: e.target.value, region, page: "1" });
  };

  if (loading) return <p className="p-4">Laddar...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    // <main className="p-4 max-w-7xl mx-auto">
    <main className="grow p-4 max-w-7xl mx-auto flex flex-col justify-center items-center gap-4">
      <input
        type="text"
        placeholder="Sök land..."
        value={query}
        onChange={handleSearchChange}
        className="mb-4 p-2 border rounded w-full sm:w-1/2"
        aria-label="Sök land"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => handleRegionChange(r)}
            className={`px-4 py-2 rounded ${
              region === r
                ? "bg-yellow-300 text-white"
                : "bg-white hover:bg-gray-200 transition duration-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {paginated.length === 0 ? (
        <p>Inga länder matchar dina kriterier.</p>
      ) : (
        <div className="justify-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginated.map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
          <button
            onClick={() =>
              setSearchParams({ query, region, page: String(page - 1) })
            }
            disabled={page === 1}
            className="px-3 py-1 border shadow-md bg-white rounded disabled:opacity-50"
          >
            Föregående
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() =>
                setSearchParams({ query, region, page: String(i + 1) })
              }
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-yellow-300 text-white"
                  : "bg-white hover:bg-gray-200 border shadow-md transition duration-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setSearchParams({ query, region, page: String(page + 1) })
            }
            disabled={page === totalPages}
            className="px-3 py-1 bg-white rounded disabled:opacity-50"
          >
            Nästa
          </button>
        </div>
      )}
    </main>
  );
};

export default Home;
