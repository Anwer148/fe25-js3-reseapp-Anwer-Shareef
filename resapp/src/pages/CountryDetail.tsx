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

        //standard fetch mot nya v5 API:et med Authorization-header
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

        // Packar upp data från v5-svaret
        const payload = raw?.data ?? raw;
        const list = Array.isArray(payload)
          ? payload
          : Object.values(payload || {}).find(Array.isArray) || [payload];