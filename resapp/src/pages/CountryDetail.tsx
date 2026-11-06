import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  CountryData,
  WeatherData,
  WikiData,
  CountryImage,
} from "../types/types";


 useEffect(() => {
    const fetchCountry = async () => {
      try {
        setLoading(true); //sätter igång laddningshjul
        setError("");

        //standard fetch mot  API:et
        const codeField = code?.length === 2 ? "codes.alpha_2" : "codes.alpha_3";
        const res = await fetch(
          `https://api.restcountries.com/countries/v5/${codeField}/${code}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error("Country fetch failed");
        const raw = await res.json();

        // Packar upp data från svaret
        const payload = raw?.data ?? raw;
        const list = Array.isArray(payload)
          ? payload
          : Object.values(payload || {}).find(Array.isArray) || [payload];

           const c: any = Array.isArray(list) ? list[0] : list;

        //koller om c är true och har egenskapen
        //språk och valuta,
        // om true tar vi alla values - annars
        //en tom array
        const languages: string[] = Array.isArray(c?.languages)
          ? c.languages.map((l: any) => l?.name || l)
          : c?.languages
          ? Object.values(c.languages)
          : [];
        const currency: string[] = Array.isArray(c?.currencies)
          ? c.currencies.map((cur: any) => cur?.code || cur?.name || cur)
          : c?.currencies
          ? Object.keys(c.currencies)
          : [];

        const coords = c?.capitals?.[0]?.coordinates || c?.coordinates;
        const latlng: [number, number] | undefined =
          coords && typeof coords.lat === "number" && typeof coords.lng === "number"
            ? [coords.lat, coords.lng]
            : c?.capitalInfo?.latlng || c?.latlng;
             //kollar om olika egenskaper finns i c
        //och hämtar dem, med vissa fallback
        //värden - borde kanske lägga till mer
    
        const countryData: CountryData = {
          name: c?.names?.common || c?.name?.common || "Okänt",
          officialName: c?.names?.official || c?.name?.official,
          region: c?.region || "Okänt",
          subregion: c?.subregion,
          capital: c?.capitals?.[0]?.name || c?.capital?.[0],
          population: c?.population,
          languages,
          currency,
          flagUrl: c?.flag?.url_png || c?.flag?.url_svg || c?.flags?.png,
          latlng,
          cca3: c?.codes?.alpha_3 || c?.cca3,
        };
        setCountry(countryData);

        //kollar om latlng finns och checkar om de är exakt 2
        if (countryData.latlng && countryData.latlng.length === 2) {
          const [lat, lon] = countryData.latlng;
          //gör API anrop med lat, lon och current weather som parametrar
          try {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            if (weatherRes.ok) {
              const weatherData = await weatherRes.json();
              if (weatherData?.current_weather) {
                //om datan finns anropar vi setWeather
                //och sätter temp samt windspeed värden
                //på plats
                setWeather({
                  temperature: weatherData.current_weather.temperature,
                  windspeed: weatherData.current_weather.windspeed,
                });
              }
            }
          } catch {}
        }

        try {
          //fetchar från wikipedias API, encodeblablabla betyder
          //bara att namnet på länder är mer foolproof att
          //använda i en url med hjälp av specialtecken
          const wikiRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              countryData.name
            )}`
          );
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            //här ändrar vi state på wiki, extract
            // wikidata innebär att vi extraherar
            //datan, alltså infon om true. - om den är false
            
            setWiki({
              extract: wikiData.extract || "",

              //validerar och hämtar wikipedia URL med en fallback
              //till wiki + countryData.name
              //förstår inte helt varför man ska använda API
              //länken och inte fallback länken som jag har

              url:
                wikiData?.content_urls?.desktop?.page ||
                `https://en.wikipedia.org/wiki/${encodeURIComponent(
                  countryData.name
                )}`,
            });
          }
        } catch {}
       setImages(placeholderImages);
      } catch (err) {
        setError("Kunde inte hämta landets information. Försök igen.");
        //finally körs alltid för att ändra setloading
        //till false
      } finally {
        setLoading(false);
      }
    };

    //om code finns och är giltig, fetcha landet
    //med den coden, annars - felmeddelande och
    //setloading (false)
    if (code) {
      fetchCountry();
    } else {
      setError("Ogiltig landkod.");
      setLoading(false);
    }
    //körs varje gång statet på code ändras
  }, [code]);

  if (loading) {
    return (
      <section
        className="min-h-screen flex items-center justify-center p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="text-center">
          <p className="mb-2">Laddar…</p>
          <div className="inline-block w-12 h-12 rounded-full animate-spin border-4 border-yellow-200 border-t-yellow-600" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Försök igen
          </button>
          <button
            className="px-4 py-2 bg-gray-100 rounded"
            onClick={() => navigate(-1)}
          >
            ← Tillbaka
          </button>
        </div>
      </section>
    );
  }

  if (!country) {
    return (
      <section className="min-h-screen flex items-center justify-center p-6">
        <p>Inga data att visa.</p>
      </section>
    );
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-yellow-200 rounded transition duration-200"
          aria-label="Gå tillbaka"
        >
          ← Tillbaka
        </button>
      </div>

      <article className="flex flex-col md:flex-row gap-6">
        <figure className="w-full md:w-1/3 shrink-0">
          {country.flagUrl ? (
            <img
              src={country.flagUrl}
              alt={`Flagga för ${country.name}`}
              className="w-full h-auto object-contain rounded shadow"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-40 md:h-52 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              Ingen flagga
            </div>
          )}
          <figcaption className="text-sm text-gray-600 mt-2 text-center">
            {country.name}
          </figcaption>
        </figure>

        <section className="flex-1 space-y-3">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {country.name}
            </h1>
            {country.officialName && (
              <p className="italic text-gray-600">{country.officialName}</p>
            )}
          </header>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <dt className="font-medium">Region</dt>
              <dd className="text-sm">
                {country.region}
                {country.subregion ? ` (${country.subregion})` : ""}
              </dd>
            </div>

            {country.capital && (
              <div>
                <dt className="font-medium">Huvudstad</dt>
                <dd className="text-sm">{country.capital}</dd>
              </div>
            )}

            {typeof country.population === "number" && (
              <div>
                <dt className="font-medium">Befolkning</dt>
                <dd className="text-sm">
                  {country.population.toLocaleString()}
                </dd>
              </div>
            )}

            <div>
              <dt className="font-medium">Språk</dt>
              <dd className="text-sm">
                {country.languages.length > 0
                  ? country.languages.join(", ")
                  : "N/A"}
              </dd>
            </div>

            <div>
              <dt className="font-medium">Valuta</dt>
              <dd className="text-sm">
                {country.currency.length > 0
                  ? country.currency.join(", ")
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </section>
      </article>

      {weather && (
        <section
          aria-labelledby="weather-heading"
          className="mt-6 p-4 rounded shadow bg-white"
        >
          <h2 id="weather-heading" className="text-lg font-semibold mb-2">
            Aktuellt väder
          </h2>
          <p className="text-sm">
            Temperatur: <strong>{weather.temperature}°C</strong>
          </p>
          <p className="text-sm">
            Vind: <strong>{weather.windspeed} km/h</strong>
          </p>
        </section>
      )}

      <section aria-labelledby="gallery-heading" className="mt-6">
        <h2 id="gallery-heading" className="sr-only">
          Bilder från landet
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <figure key={img.url} className="overflow-hidden rounded shadow">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-44 object-cover"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </section>

      {wiki && (
        <article
          aria-labelledby="about-heading"
          className="mt-6 p-4 bg-white rounded shadow"
        >
          <h2 id="about-heading" className="text-lg font-semibold mb-2">
            Om {country.name}
          </h2>
          <p className="text-sm leading-relaxed">{wiki.extract}</p>
          <a
            href={wiki.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm text-yellow-300 underline"
          >
            Läs mer på Wikipedia
          </a>
        </article>
      )}
    </main>
  );
};

export default CountryDetail;
