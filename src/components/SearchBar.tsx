import { useState, useRef, useEffect } from "react";
import type { GeoLocation } from "../types/weather";

interface Props {
  onSearch: (query: string) => void;
  onSelect: (location: GeoLocation) => void;
  suggestions: GeoLocation[];
}

export function SearchBar({ onSearch, onSelect, suggestions }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(q);
      setOpen(true);
    }, 350);
  }

  function handleSelect(loc: GeoLocation) {
    setValue(`${loc.name}, ${loc.country}`);
    setOpen(false);
    onSelect(loc);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search for a city..."
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((loc, i) => (
            <li key={i} onMouseDown={() => handleSelect(loc)}>
              <span className="suggestion-name">{loc.name}</span>
              <span className="suggestion-sub">
                {loc.admin1 ? `${loc.admin1}, ` : ""}
                {loc.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
