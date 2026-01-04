# RAG-Optimized Guide: Recommending Sake Based on Wine Preferences

**Purpose:** This document provides a structured knowledge base for an AI agent to recommend sake to users based on their wine preferences. It is optimized for Retrieval-Augmented Generation (RAG) systems.

---

### CHUNK: WINE_CHARACTERISTICS

**Topic:** Key characteristics of wine.
**Keywords:** wine, characteristics, body, acidity, sweetness, tannin

| Characteristic | Description                                                                                                                                      |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Body**       | The perceived weight and texture of the wine in the mouth. It can be light, medium, or full-bodied.                                                |
| **Acidity**    | The tartness or sourness of the wine, which provides freshness and structure. Acidity can be low, medium, or high.                                    |
| **Sweetness**  | The level of residual sugar in the wine, ranging from bone-dry to very sweet.                                                                      |
| **Tannin**     | A compound found in red wines that creates a drying sensation in the mouth. Tannin levels can be low, medium, or high. Not a factor in most white wines. |

---

### CHUNK: SAKE_CHARACTERISTICS

**Topic:** Key characteristics of sake.
**Keywords:** sake, characteristics, body, acidity, sweetness, dryness, polishing ratio, aromatics, SMV, Nihonshudo

| Characteristic     | Description                                                                                                                                                                                                                                   |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Body**           | Similar to wine, sake can be light, medium, or full-bodied, affecting its mouthfeel.                                                                                                                                                          |
| **Acidity**        | Sake acidity contributes to its crispness and structure. It is often perceived as a balancing element to sweetness.                                                                                                                             |
| **Sweetness/Dryness** | The balance between sugar and alcohol in sake. This is often measured by the Sake Meter Value (SMV) or *Nihonshudo*. A positive SMV indicates a drier sake, while a negative SMV indicates a sweeter sake.                                     |
| **Polishing Ratio**  | The percentage of the rice grain remaining after polishing. A lower polishing ratio (e.g., 50%) means more of the outer layer has been polished away, generally resulting in a more refined, aromatic, and complex sake (e.g., Daiginjo). A higher ratio results in a more robust, rice-forward flavor (e.g., Junmai). |
| **Aromatics**      | Sake can have a wide range of aromatics, from fruity and floral (ginjo-ka) to savory and earthy.                                                                                                                                              |

---

### CHUNK: LIGHT_WHITE_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of light-bodied, crisp white wines.
**Keywords:** Sauvignon Blanc, Pinot Grigio, light white wine, Junmai Ginjo, Junmai Daiginjo, crisp, dry, aromatic

- **Wine Preference:** Light-bodied, crisp white wines (e.g., Sauvignon Blanc, Pinot Grigio).
- **Sake Recommendation:** Junmai Ginjo or Junmai Daiginjo.
- **Reasoning:** These sakes are typically light, aromatic, and have a clean, crisp finish, similar to the experience of drinking a refreshing white wine. They often have fruity notes of green apple, melon, and pear.

---

### CHUNK: FULL_WHITE_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of full-bodied, rich white wines.
**Keywords:** Chardonnay, Viognier, full-bodied white wine, Junmai, Kimoto, Yamahai, rich, savory, umami

- **Wine Preference:** Full-bodied, rich white wines (e.g., Chardonnay, Viognier).
- **Sake Recommendation:** Junmai or Kimoto/Yamahai.
- **Reasoning:** These sakes have a fuller body and a more savory, umami-rich flavor profile that can appeal to drinkers of oaked Chardonnay. Kimoto and Yamahai methods produce even richer, more complex, and sometimes slightly funky flavors.

---

### CHUNK: LIGHT_RED_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of light-bodied, low-tannin red wines.
**Keywords:** Pinot Noir, Gamay, light red wine, Koshu, aged sake, Junmai, earthy, savory

- **Wine Preference:** Light-bodied, low-tannin red wines (e.g., Pinot Noir, Gamay).
- **Sake Recommendation:** Koshu (aged sake) or a well-balanced Junmai.
- **Reasoning:** Koshu, with its sherry-like notes of nuts and caramel, can appeal to those who enjoy the earthy and sometimes savory notes of Pinot Noir. A well-balanced Junmai can also offer a satisfying richness without being overpowering.

---

### CHUNK: FULL_RED_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of full-bodied, high-tannin red wines.
**Keywords:** Cabernet Sauvignon, Syrah, full-bodied red wine, Yamahai, Kimoto Junmai, robust, umami, earthy

- **Wine Preference:** Full-bodied, high-tannin red wines (e.g., Cabernet Sauvignon, Syrah).
- **Sake Recommendation:** Yamahai or Kimoto Junmai.
- **Reasoning:** These traditional methods produce robust, full-bodied sakes with higher acidity and umami. Their earthy, sometimes gamy, and savory notes can be a good match for those who appreciate the bold, complex flavors of a full-bodied red wine.

---

### CHUNK: SWEET_DESSERT_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of sweet or dessert wines.
**Keywords:** Riesling, Moscato, Sauternes, dessert wine, Nigori, Koshu, sweet, creamy, aged

- **Wine Preference:** Sweet/Dessert Wines (e.g., Riesling, Moscato, Sauternes).
- **Sake Recommendation:** Nigori or Koshu.
- **Reasoning:** Nigori sake is coarsely filtered, leaving some rice sediment, which gives it a creamy texture and a gentle sweetness. Koshu, with its rich, sweet, and savory notes of dried fruit, caramel, and soy sauce, can be a fascinating alternative to a complex dessert wine.

---

### CHUNK: SPARKLING_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of sparkling wines.
**Keywords:** Champagne, Prosecco, sparkling wine, sparkling sake, carbonated, celebratory

- **Wine Preference:** Sparkling Wines (e.g., Champagne, Prosecco).
- **Sake Recommendation:** Sparkling Sake.
- **Reasoning:** This is the most direct comparison. Sparkling sake is made in a similar way to sparkling wine, with a secondary fermentation in the bottle to create carbonation. It can range from sweet to dry and offers a similar celebratory and refreshing experience.

---

### CHUNK: ROSE_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of rosé wines.
**Keywords:** Rosé wine, rosé sake, red sake, cherry, plum

- **Wine Preference:** Rosé Wines.
- **Sake Recommendation:** Rosé Sake or Red Sake.
- **Reasoning:** Rosé sake gets its color from a special type of red yeast. These sakes often have notes of cherry and plum, with a balance of sweetness and acidity that will be familiar to rosé wine drinkers. Red sake, made with black rice, offers a unique and flavorful alternative.

---

### CHUNK: EARTHY_SAVORY_WINE_TO_SAKE

**Topic:** Sake recommendations for lovers of earthy and savory wines.
**Keywords:** Italian reds, French whites, earthy wine, savory wine, Kimoto, Yamahai, umami, mushroom, soy sauce

- **Wine Preference:** Earthy, savory wines (e.g., Italian reds, some French whites).
- **Sake Recommendation:** Kimoto or Yamahai.
- **Reasoning:** These traditional methods create sakes with a rich, umami-driven flavor profile. They can have notes of mushroom, soy sauce, and grain, which will appeal to those who enjoy savory and earthy wines.

---

### CHUNK: SHERRY_TO_SAKE

**Topic:** Sake recommendations for lovers of Sherry.
**Keywords:** Sherry, Koshu, aged sake, nutty, caramelized, soy sauce

- **Wine Preference:** Sherry.
- **Sake Recommendation:** Koshu (aged sake).
- **Reasoning:** Koshu develops nutty, caramelized, and soy sauce-like flavors through aging, which are very similar to the flavors found in many sherries. This makes it an excellent and intriguing alternative.

---

### CHUNK: PORT_TO_SAKE

**Topic:** Sake recommendations for lovers of Port.
**Keywords:** Port, sweet Nigori, Koshu, creamy, sweet, dried fruit, spice

- **Wine Preference:** Port.
- **Sake Recommendation:** Sweet Nigori or Koshu.
- **Reasoning:** A sweet, rich Nigori can offer a similar creamy texture and sweetness to a Ruby Port. A complex Koshu can provide a flavor experience reminiscent of a Tawny Port, with its notes of dried fruit, nuts, and spice.

---

### CHUNK: VERMOUTH_TO_SAKE

**Topic:** Sake recommendations for lovers of Vermouth.
**Keywords:** Vermouth, Umeshu, plum wine, sweet, sour, botanical

- **Wine Preference:** Vermouth.
- **Sake Recommendation:** Umeshu (plum wine).
- **Reasoning:** While not technically a sake, Umeshu is a Japanese liqueur made from steeping plums in alcohol and sugar. Its sweet and sour flavor profile, often with almond notes, can be a delightful alternative for those who enjoy the botanical and fortified nature of vermouth.

---

### CHUNK: BEGINNER_WINE_TO_SAKE

**Topic:** Sake recommendations for those who prefer beginner-friendly wines.
**Keywords:** off-dry Riesling, White Zinfandel, beginner wine, Futsushu, easy-drinking, approachable

- **Wine Preference:** Beginner-friendly wines (e.g., off-dry Riesling, White Zinfandel).
- **Sake Recommendation:** Futsushu with a slightly negative SMV.
- **Reasoning:** Futsushu is the everyday "table sake" of Japan and is very versatile. A futsushu with a slightly sweet profile (a negative SMV) would be a great introduction for those who prefer easy-drinking, slightly sweet wines, as it is approachable and pleasant.

---

### CHUNK: AI_RECOMMENDATION_PROCESS

**Topic:** A step-by-step process for an AI agent to recommend sake.
**Keywords:** AI agent, recommendation process, guide, steps, how-to

1.  **Gather User's Wine Preferences:** Ask the user about their favorite wines, including grape varieties, regions, or general styles.
2.  **Analyze User Input:** Extract key characteristics from the user's response (body, acidity, sweetness, etc.).
3.  **Map to Sake:** Use the knowledge chunks in this document to find the corresponding sake types.
4.  **Generate Recommendation:** Present the recommended sake and explain *why* it's a good match, using the reasoning provided in the relevant chunk.

---

### CHUNK: REFERENCES

**Topic:** List of sources used to create this guide.
**Keywords:** references, sources, citations

- [1] Sake World. (n.d.). *Sake Flavor Profiles*. Retrieved from https://sake-world.com/about-sake/types-of-sake/sake-flavor-profiles/
- [2] Wine Folly. (n.d.). *Understanding the Primary Wine Characteristics*. Retrieved from https://winefolly.com/deep-dive/wine-characteristics/
- [3] Tippsy Sake. (n.d.). *Sake Recommendations for Wine Drinkers*. Retrieved from https://www.tippsysake.com/blogs/tippsy-sake-blog/sake-recommendations-for-wine-drinkers
- [4] Unpretentious Palate. (n.d.). *A Wine Lover's Guide to Sake*. Retrieved from https://unpretentiouspalate.com/a-wine-lovers-guide-to-sake/
