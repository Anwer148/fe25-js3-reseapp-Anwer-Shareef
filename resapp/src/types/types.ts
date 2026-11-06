export interface CountryData {
  name: string;
  officialName?: string;
  region: string;
  subregion?: string;
  capital?: string;
  population?: number;
  languages: string[];
  currency: string[];
  flagUrl?: string;
  latlng?: [number, number];
  cca3: string;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
}

export interface WikiData {
  extract: string;
  url: string;
}

export interface CountryImage {
  url: string;
  alt: string;
}