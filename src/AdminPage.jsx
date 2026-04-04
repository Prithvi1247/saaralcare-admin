import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./AdminPage.css";

// ─── Supabase client (initialized once, outside the component) ────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkoutRecord() {
  // ── State ──
  const [zone_name, setZone]                     = useState("");
  const [rainfall_mm, setRainfall]               = useState("");
  const [rainfall_duration_hrs, setDuration]     = useState("");
  const [message, setMessage]                    = useState("");
  const [isError, setIsError]                    = useState(false);
  const [loading, setLoading]                    = useState(false);
  const [zones, setZones]                        = useState([]);
  const [station_id, setStationId]               = useState(null);

  // ── Fetch zones on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchZones = async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*");

      if (error) {
        console.error("Error fetching zones:", error);
      } else {
        console.log("Zones loaded:", data);
        setZones(data);
      }
    };

    fetchZones();
  }, []);

  // ── Fetch station_id when a zone is selected ──────────────────────────────
  const fetchStationId = async (selectedZone) => {
    if (!selectedZone) return;

    const { data, error } = await supabase
      .from("zone_station_map")
      .select("station_id")
      .eq("zone_name", selectedZone)
      .single();

    if (error) {
      console.error("Error fetching station_id:", error);
    } else {
      console.log("Station ID resolved:", data.station_id);
      setStationId(data.station_id);
    }
  };

  // ── Handle zone selection change ──────────────────────────────────────────
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    setZone(selectedZone);
    fetchStationId(selectedZone);
  };

  // ── Insert record into rainfall_events ───────────────────────────────────
  // ── Insert record into rainfall_events ───────────────────────────────────
  const handleAddRecord = async () => {
    setMessage("");
    setIsError(false);

    // Validation
    if (!zone_name || !rainfall_mm.toString().trim() || !rainfall_duration_hrs.toString().trim()) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      // FIX: Added zone_name to the payload here 👇
      const payload = { zone_name, station_id, rainfall_mm, rainfall_duration_hrs };
      console.log("Inserting payload:", payload);

      const { data, error } = await supabase
        .from("rainfall_events")
        .insert([payload])
        .select(); // Required in Supabase v2 to return inserted rows

      if (error) {
        console.error("Supabase insert error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        if (error.code === "42501") {
          setMessage("Permission denied. Enable INSERT policy in Supabase → RLS Policies.");
        } else if (error.code === "42P01") {
          setMessage("Table 'rainfall_events' not found. Check the table name in Supabase.");
        } else {
          setMessage(`Error: ${error.message}`);
        }
        setIsError(true);
      } else {
        console.log("Insert successful:", data);
        setMessage("✓ Record saved successfully!");
        setIsError(false);
        // Reset form
        setZone("");
        setRainfall("");
        setDuration("");
        setStationId(null);
      }
    } catch (unexpectedError) {
      console.error("Unexpected error:", unexpectedError);
      setMessage(`Unexpected error: ${unexpectedError.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  // ── Derived class for result message ──────────────────────────────────────
  const resultClass = `result${isError ? " error" : message ? " success" : ""}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <main className="card">

        {/* Header */}
        <div className="card-header">
          <div className="card-icon">🛡️</div>
          <div>
            <div className="title">SaaralCareAI</div>
            <div className="subtitle">Log the details</div>
          </div>
        </div>

        <div className="divider" />

        {/* Zone select — populated from "zones" table */}
        <div className="form-group">
          <label htmlFor="zone_name">
            <span className="label-dot" />
            Zone
          </label>
          <div className="select-wrapper">
            <select
              id="zone_name"
              value={zone_name}
              onChange={handleZoneChange}
            >
              <option value="">Select Zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.zone_name}>
                  {z.zone_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rainfall input */}
        <div className="form-group">
          <label htmlFor="rainfall_mm">
            <span className="label-dot" />
            Rainfall (in mm)
          </label>
          <input
            id="rainfall_mm"
            type="number"
            placeholder="e.g. 7.2, 10.1"
            value={rainfall_mm}
            onChange={(e) => setRainfall(e.target.value)}
          />
        </div>

        {/* Duration input */}
        <div className="form-group">
          <label htmlFor="rainfall_duration_hrs">
            <span className="label-dot" />
            Duration (in hours)
          </label>
          <input
            id="rainfall_duration_hrs"
            type="number"
            placeholder="e.g. 1, 2.5"
            value={rainfall_duration_hrs}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          className="record-button"
          type="button"
          onClick={handleAddRecord}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add to Record"}
        </button>

        {/* Result message */}
        <div className={resultClass}>{message}</div>

      </main>
    </div>
  );
}
