import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import type { GeoLocation } from "../types/weather";

const suggestions: GeoLocation[] = [
  { name: "Paris", latitude: 48.8, longitude: 2.3, country: "France" },
  { name: "Paris", latitude: 33.6, longitude: -95.5, country: "United States", admin1: "Texas" },
];

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the user to pause typing before searching (debounce)", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onSelect={() => {}} suggestions={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Par" },
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(349);
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledWith("Par");
  });

  it("only fires once for fast typing, using the latest value", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onSelect={() => {}} suggestions={[]} />);
    const input = screen.getByPlaceholderText("Search for a city...");
    fireEvent.change(input, { target: { value: "P" } });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.change(input, { target: { value: "Pa" } });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.change(input, { target: { value: "Par" } });
    act(() => vi.advanceTimersByTime(350));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Par");
  });

  it("shows suggestions and lets the user pick one, including duplicate city names", () => {
    const onSelect = vi.fn();
    render(<SearchBar onSearch={() => {}} onSelect={onSelect} suggestions={suggestions} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Paris" },
    });
    act(() => vi.advanceTimersByTime(350));

    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Texas, United States")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Texas, United States"));
    expect(onSelect).toHaveBeenCalledWith(suggestions[1]);

    const input = screen.getByPlaceholderText("Search for a city...") as HTMLInputElement;
    expect(input.value).toBe("Paris, United States");
  });

  it("closes the dropdown when clicking outside", () => {
    render(<SearchBar onSearch={() => {}} onSelect={() => {}} suggestions={suggestions} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Paris" },
    });
    act(() => vi.advanceTimersByTime(350));
    expect(screen.getByText("France")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("France")).not.toBeInTheDocument();
  });

  it("searches with an empty string when the field is cleared", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onSelect={() => {}} suggestions={[]} />);
    const input = screen.getByPlaceholderText("Search for a city...");
    fireEvent.change(input, { target: { value: "Par" } });
    fireEvent.change(input, { target: { value: "" } });
    act(() => vi.advanceTimersByTime(350));
    expect(onSearch).toHaveBeenCalledWith("");
  });
});
