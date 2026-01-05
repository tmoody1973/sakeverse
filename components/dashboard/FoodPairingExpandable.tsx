"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Badge } from "@/components/ui/Badge";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ExternalLink } from "lucide-react";

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
  const id = useId();
  
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

  // Fetch related content when card expands
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
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-${active.dish.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-8 w-8 border-2 border-ink shadow-retro-sm z-10"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.dish.id}-${id}`}
              ref={ref}
              className="w-full max-w-[600px] max-h-[85vh] flex flex-col bg-white border-3 border-ink shadow-retro-lg rounded-2xl overflow-hidden"
            >
              {/* Header with emoji */}
              <motion.div
                layoutId={`image-${active.dish.id}-${id}`}
                className="w-full h-24 bg-gradient-to-br from-sake-warm to-sakura-light flex items-center justify-center flex-shrink-0"
              >
                <span className="text-5xl">
                  {cuisineEmoji[active.cuisine.id] || "🍽️"}
                </span>
              </motion.div>

              <div className="p-5 overflow-y-auto flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.dish.id}-${id}`}
                      className="font-bold text-2xl text-ink"
                    >
                      {active.dish.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.dish.id}-${id}`}
                      className="text-gray-600"
                    >
                      {active.cuisine.name}
                    </motion.p>
                  </div>
                  <motion.div layoutId={`button-${active.dish.id}-${id}`}>
                    <Badge variant="primary" className="text-sm px-3 py-1">
                      {sakeTypeNames[active.dish.recommendedSakeTypes[0]] ||
                        active.dish.recommendedSakeTypes[0]}
                    </Badge>
                  </motion.div>
                </div>

                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <p className="text-gray-700 text-lg">{active.dish.shortDescription}</p>

                  {/* Flavor Profile */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">
                      Flavor Profile
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {active.dish.flavorProfile.map((f) => (
                        <Badge key={f} variant="secondary" className="text-sm">
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
                    <div className="flex flex-wrap gap-2">
                      {active.dish.recommendedSakeTypes.map((s) => (
                        <Badge key={s} variant="primary" className="text-sm">
                          🍶 {sakeTypeNames[s] || s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Pairing Notes */}
                  <div className="bg-sakura-light/50 p-4 rounded-xl border-2 border-sakura-pink/30">
                    <p className="text-xs text-plum-dark uppercase tracking-wide mb-2 font-semibold">
                      Why It Works
                    </p>
                    <p className="text-gray-700 italic text-base">
                      "{active.dish.pairingNotes}"
                    </p>
                  </div>

                  {/* Perplexity Related Content */}
                  <div className="bg-sake-mist/30 p-4 rounded-xl border-2 border-sake-mist">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
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
                        {relatedContent.slice(0, 400)}
                        {relatedContent.length > 400 && "..."}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Pairing tips unavailable
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Card List */}
      <ul className="w-full space-y-2">
        {pairings.map((pairing) => (
          <motion.li
            layoutId={`card-${pairing.dish.id}-${id}`}
            key={pairing.dish.id}
            onClick={() => setActive(pairing)}
            className="p-3 flex items-center gap-3 bg-white hover:bg-sakura-light/30 border-2 border-ink rounded-xl cursor-pointer shadow-retro-sm hover:shadow-retro transition-all"
          >
            <motion.div
              layoutId={`image-${pairing.dish.id}-${id}`}
              className="w-10 h-10 bg-gradient-to-br from-sake-warm to-sakura-light rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <span className="text-xl">
                {cuisineEmoji[pairing.cuisine.id] || "🍽️"}
              </span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.h3
                layoutId={`title-${pairing.dish.id}-${id}`}
                className="font-semibold text-ink text-sm truncate"
              >
                {pairing.dish.name}
              </motion.h3>
              <motion.p
                layoutId={`description-${pairing.dish.id}-${id}`}
                className="text-xs text-gray-500 truncate"
              >
                {pairing.cuisine.name}
              </motion.p>
            </div>
            <motion.div layoutId={`button-${pairing.dish.id}-${id}`}>
              <Badge variant="primary" size="sm" className="text-[10px]">
                {sakeTypeNames[pairing.dish.recommendedSakeTypes[0]] ||
                  pairing.dish.recommendedSakeTypes[0]}
              </Badge>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
