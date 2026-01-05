"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/Badge";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ExternalLink, X } from "lucide-react";

const sakeTypeNames: Record<string, string> = {
  junmai: "Junmai",
  junmai_ginjo: "Junmai Ginjo",
  junmai_daiginjo: "Junmai Daiginjo",
  honjozo: "Honjozo",
  nigori: "Nigori",
  sparkling: "Sparkling",
};

interface Dish {
  id: string;
  name: string;
  shortDescription: string;
  flavorProfile: string[];
  recommendedSakeTypes: string[];
  pairingNotes: string;
}

interface Cuisine {
  id: string;
  name: string;
  dishes: Dish[];
}

const cuisineEmoji: Record<string, string> = {
  southern_soul: "🍗",
  italian: "🍝",
  mexican: "🌮",
  japanese: "🍣",
  chinese: "🥡",
  indian: "🍛",
  thai: "🍜",
  korean: "🥘",
  french: "🥐",
  american: "🍔",
};

// Separate Modal component to isolate re-renders
function PairingModal({ 
  pairing, 
  onClose 
}: { 
  pairing: { dish: Dish; cuisine: Cuisine }; 
  onClose: () => void;
}) {
  const [tips, setTips] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const getPairingTips = useAction(api.pairingTips.getPairingTips);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    const sakeType = sakeTypeNames[pairing.dish.recommendedSakeTypes[0]] || pairing.dish.recommendedSakeTypes[0];
    getPairingTips({ 
      dishId: pairing.dish.id,
      dishName: pairing.dish.name,
      sakeType
    })
      .then((r) => setTips(r || ""))
      .catch(() => setTips(""))
      .finally(() => setLoading(false));

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [pairing, getPairingTips, onClose]);

  const { dish, cuisine } = pairing;

  return createPortal(
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1rem",
          border: "3px solid #2D2D2D",
          boxShadow: "6px 6px 0px #2D2D2D",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #FFE5C4, #FFE4EC)",
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          position: "relative",
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              padding: "0.375rem",
              backgroundColor: "white",
              borderRadius: "9999px",
              border: "2px solid #2D2D2D",
              cursor: "pointer",
              display: "flex"
            }}
          >
            <X size={16} />
          </button>
          <span style={{ fontSize: "2.5rem" }}>
            {cuisineEmoji[cuisine.id] || "🍽️"}
          </span>
          <div>
            <h3 style={{ fontWeight: "bold", fontSize: "1.25rem", margin: 0 }}>{dish.name}</h3>
            <p style={{ color: "#666", margin: 0, fontSize: "0.875rem" }}>{cuisine.name}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>
          <p style={{ color: "#374151", marginBottom: "1rem" }}>{dish.shortDescription}</p>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: 600 }}>
              Flavor Profile
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {dish.flavorProfile.map((f) => (
                <Badge key={f} variant="secondary" size="sm">{f}</Badge>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: 600 }}>
              Best Sake Pairings
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {dish.recommendedSakeTypes.map((s) => (
                <Badge key={s} variant="primary" size="sm">🍶 {sakeTypeNames[s] || s}</Badge>
              ))}
            </div>
          </div>

          <div style={{ 
            backgroundColor: "rgba(255,228,236,0.5)", 
            padding: "0.75rem", 
            borderRadius: "0.75rem",
            border: "2px solid rgba(255,186,210,0.3)",
            marginBottom: "1rem"
          }}>
            <p style={{ fontSize: "0.75rem", color: "#6B4E71", textTransform: "uppercase", marginBottom: "0.25rem", fontWeight: 600 }}>
              Why It Works
            </p>
            <p style={{ color: "#374151", fontStyle: "italic", fontSize: "0.875rem", margin: 0 }}>
              "{dish.pairingNotes}"
            </p>
          </div>

          <div style={{ 
            backgroundColor: "rgba(232,244,248,0.3)", 
            padding: "0.75rem", 
            borderRadius: "0.75rem",
            border: "2px solid #E8F4F8"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <ExternalLink size={14} color="#6B7280" />
              <p style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 600, margin: 0 }}>
                Expert Tips
              </p>
            </div>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6B7280" }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: "0.875rem" }}>Finding tips...</span>
              </div>
            ) : tips ? (
              <p style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
                {tips.slice(0, 300)}{tips.length > 300 && "..."}
              </p>
            ) : (
              <p style={{ color: "#6B7280", fontSize: "0.875rem", fontStyle: "italic", margin: 0 }}>
                Tips unavailable
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function FoodPairingExpandable() {
  const [pairings, setPairings] = useState<{ dish: Dish; cuisine: Cuisine }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/sake_pairing_database.json")
      .then((res) => res.json())
      .then((data: { cuisines: Cuisine[] }) => {
        const all: { dish: Dish; cuisine: Cuisine }[] = [];
        data.cuisines.forEach((c) => {
          c.dishes.forEach((d) => all.push({ dish: d, cuisine: c }));
        });
        setPairings(all.sort(() => Math.random() - 0.5).slice(0, 2));
      })
      .catch(() => {});
  }, []);

  const closeModal = useCallback(() => setSelectedIndex(null), []);

  if (pairings.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-sakura-light/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {selectedIndex !== null && pairings[selectedIndex] && (
        <PairingModal pairing={pairings[selectedIndex]} onClose={closeModal} />
      )}

      <ul className="space-y-2">
        {pairings.map((pairing, idx) => (
          <li
            key={pairing.dish.id}
            onClick={() => setSelectedIndex(idx)}
            className="p-3 flex items-center gap-3 bg-white hover:bg-sakura-light/30 border-2 border-ink rounded-xl cursor-pointer shadow-retro-sm hover:shadow-retro transition-shadow"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sake-warm to-sakura-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{cuisineEmoji[pairing.cuisine.id] || "🍽️"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink text-sm truncate">{pairing.dish.name}</h3>
              <p className="text-xs text-gray-500 truncate">{pairing.cuisine.name}</p>
            </div>
            <Badge variant="primary" size="sm" className="text-[10px] flex-shrink-0">
              {sakeTypeNames[pairing.dish.recommendedSakeTypes[0]] || pairing.dish.recommendedSakeTypes[0]}
            </Badge>
          </li>
        ))}
      </ul>
    </>
  );
}
