"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
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

interface PairingData {
  cuisines: Cuisine[];
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

export function FoodPairingExpandable() {
  const [active, setActive] = useState<{ dish: Dish; cuisine: Cuisine } | null>(null);
  const [pairings, setPairings] = useState<{ dish: Dish; cuisine: Cuisine }[]>([]);
  const [relatedContent, setRelatedContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const searchWeb = useAction(api.perplexityAPI.searchWebContent);

  useEffect(() => {
    fetch("/sake_pairing_database.json")
      .then((res) => res.json())
      .then((data: PairingData) => {
        const allPairings: { dish: Dish; cuisine: Cuisine }[] = [];
        data.cuisines.forEach((c) => {
          c.dishes.forEach((d) => allPairings.push({ dish: d, cuisine: c }));
        });
        const shuffled = allPairings.sort(() => Math.random() - 0.5);
        setPairings(shuffled.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (active) {
      setLoadingContent(true);
      setRelatedContent(null);
      const sakeType = sakeTypeNames[active.dish.recommendedSakeTypes[0]] || active.dish.recommendedSakeTypes[0];
      searchWeb({ 
        query: `${active.dish.name} paired with ${sakeType} sake food pairing tips`,
        focus: "reviews"
      })
        .then((result) => {
          setRelatedContent(result.answer);
        })
        .catch(() => {
          setRelatedContent(null);
        })
        .finally(() => {
          setLoadingContent(false);
        });
    }
  }, [active, searchWeb]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  if (pairings.length === 0) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-sakura-light/50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setActive(null)}
            />
            <div className="fixed inset-0 z-50 grid place-items-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={ref}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white border-3 border-ink shadow-retro-lg sm:rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-sake-warm to-sakura-light p-6 flex items-center gap-4 relative flex-shrink-0">
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white rounded-full border-2 border-ink shadow-retro-sm hover:shadow-retro transition-shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-5xl">
                    {cuisineEmoji[active.cuisine.id] || "🍽️"}
                  </span>
                  <div>
                    <h3 className="font-bold text-xl text-ink">
                      {active.dish.name}
                    </h3>
                    <p className="text-gray-600">{active.cuisine.name}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                  <p className="text-gray-700">{active.dish.shortDescription}</p>

                  {/* Flavor Profile */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
                      Flavor Profile
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.dish.flavorProfile.map((f) => (
                        <Badge key={f} variant="secondary" size="sm">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Sake */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
                      Best Sake Pairings
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.dish.recommendedSakeTypes.map((s) => (
                        <Badge key={s} variant="primary" size="sm">
                          🍶 {sakeTypeNames[s] || s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pairing Notes */}
                  <div className="bg-sakura-light/50 p-3 rounded-xl border-2 border-sakura-pink/30">
                    <p className="text-xs text-plum-dark uppercase tracking-wide mb-1 font-semibold">
                      Why It Works
                    </p>
                    <p className="text-gray-700 italic text-sm">
                      "{active.dish.pairingNotes}"
                    </p>
                  </div>

                  {/* Perplexity Content */}
                  <div className="bg-sake-mist/30 p-3 rounded-xl border-2 border-sake-mist">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                        Expert Tips
                      </p>
                    </div>
                    {loadingContent ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Finding pairing tips...</span>
                      </div>
                    ) : relatedContent ? (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {relatedContent.slice(0, 350)}
                        {relatedContent.length > 350 && "..."}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Pairing tips unavailable
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Card List */}
      <ul className="w-full space-y-2">
        {pairings.map((pairing) => (
          <li
            key={pairing.dish.id}
            onClick={() => setActive(pairing)}
            className="p-3 flex items-center gap-3 bg-white hover:bg-sakura-light/30 border-2 border-ink rounded-xl cursor-pointer shadow-retro-sm hover:shadow-retro transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sake-warm to-sakura-light rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">
                {cuisineEmoji[pairing.cuisine.id] || "🍽️"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink text-sm truncate">
                {pairing.dish.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {pairing.cuisine.name}
              </p>
            </div>
            <Badge variant="primary" size="sm" className="text-[10px]">
              {sakeTypeNames[pairing.dish.recommendedSakeTypes[0]] ||
                pairing.dish.recommendedSakeTypes[0]}
            </Badge>
          </li>
        ))}
      </ul>
    </>
  );
}
