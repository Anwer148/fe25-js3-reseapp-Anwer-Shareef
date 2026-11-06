
import React from "react";
import { useNavigate } from "react-router-dom";
import type { CountryData } from "../types/types";

interface CountryCardProps {
  country: CountryData;
}


const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/country/${country.cca3}`);
  };

// Tailwind

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border border-yellow-500 bg-black text-yellow-400 rounded shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-300 p-4 flex flex-col transition duration-300"
    >
      <img
        src={country.flagUrl}
        alt={`Flag of ${country.name}`}
        className="w-full h-32 object-cover rounded mb-4"
      />
      <h2 className="text-lg font-semibold text-yellow-300 mb-1">
        {country.name}
      </h2>
      {country.capital && (
        <p className="text-yellow-300 mb-1">Huvudstad: {country.capital}</p>
      )}
      <p className="text-yellow-300 mb-1">Region: {country.region}</p>
      {country.population && (
        <p className="text-yellow-300">Befolkning: {country.population}</p>
      )}
    </div>
  );
};

export default CountryCard;
