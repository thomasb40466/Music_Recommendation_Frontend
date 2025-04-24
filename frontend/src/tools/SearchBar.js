// SearchBar.js
import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { loadSongs } from "./LoadSongs";
import "./css/SearchBar.css";                    

const API = "http://127.0.0.1:5000/api";

/* ── autosuggest helpers ───────────────────────────────────────── */
const getSuggestionValue = s => {
  const artists = Array.isArray(s.artists) ? s.artists.join(", ") : String(s.artists);
  return `${s.name} – ${artists}`;          
};

const renderSuggestion = s => {
  const artists = Array.isArray(s.artists)
    ? s.artists.join(", ")
    : String(s.artists);

  return (
    <div className="suggestion-item">
      <div className="sugg-title">{s.name}</div>
      <div className="sugg-artists">{artists}</div>
    </div>
  );
};

const getLocalSuggestions = (value, songs) => {
  const q = value.trim().toLowerCase();
  return !q
    ? []
    : songs.filter(s => s.name.toLowerCase().includes(q)).slice(0, 20);
};

/* ── component ─────────────────────────────────────────────────── */
export default function SearchBar() {
  const [value, setValue]         = useState("");
  const [suggestions, setSuggs]   = useState([]);
  const [localSongs, setLocal]    = useState([]);
  const [recs, setRecs]           = useState([]);

  /* preload local fallback list (optional) */
  useEffect(() => {
    loadSongs().then(setLocal);
  }, []);

  /* fetch suggestions from Neo4j */
  const fetchNeo4jSuggestions = async query => {
    if (!query.trim()) return [];
    try {
      const res = await fetch(
        `${API}/suggestions?songName=${encodeURIComponent(query)}`
      );
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    let list = await fetchNeo4jSuggestions(value);
    if (!list.length) list = getLocalSuggestions(value, localSongs);
    setSuggs(list.slice(0, 20));
  };

  const onSuggestionsClearRequested = () => setSuggs([]);

  const onChange = (_e, { newValue }) => setValue(newValue);

  /* ── when user picks a suggestion → fetch recommendations ────── */
  const onSuggestionSelected = async (_e, { suggestion }) => {
    setValue(suggestion.name);
    setSuggs([]);
    setRecs([]); // clear old list

    if (!suggestion.track_id) return; // backend must return it!

    try {
      const params = new URLSearchParams({
        trackId: suggestion.track_id,
        k: 20,
        window: 25
      });
      const res = await fetch(`${API}/recommendations?${params}`);
      if (res.ok) setRecs(await res.json());
    } catch (err) {
      console.error("Recommendation fetch failed:", err);
    }
  };

  const inputProps = {
    placeholder: "Search songs…",
    value,
    onChange
  };

  return (
    <div className="searchbar">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
  
        {recs.length > 0 && (
        <div className="recs-wrapper">
          {recs.map(r => {
            const artists = Array.isArray(r.artists) ? r.artists : [String(r.artists)];
            return (
              <a
                key={`${r.name}-${r.score}`}
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `${r.name} ${artists.join(" ")}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="recs-card-link"
              >
                <div className="recs-card">
                  <div className="recs-title">{r.name}</div>
                  <div className="recs-artists">{artists.join(", ")}</div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
  
}
