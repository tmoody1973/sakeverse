

# **🌸 SAKÉVERSE**

## *Design & User Experience Guide*

**Cherry Blossom Edition • RetroUI Neobrutalism**

*A design system that transforms sake education into anelegant, playful, and accessible experience.*

Version 1.0 • 2024

# **1\. Design Philosophy**

Sakéverse bridges 1,000 years of Japanese sake tradition with modern digital experiences. Our design language combines the softness of cherry blossoms with the bold confidence of neobrutalism—creating interfaces that are both striking and serene.

## **Core Design Principles**

1. **Soft Strength:** Pastel colors with bold borders create visual hierarchy without harshness.

2. **Playful Sophistication:** Rounded elements and subtle animations invite exploration while maintaining professionalism.

3. **Accessible Elegance:** WCAG AA compliance with carefully chosen contrast ratios that never sacrifice beauty.

4. **Breathing Room:** Generous whitespace mirrors the meditative quality of sake appreciation.

5. **Cultural Authenticity:** Japanese design principles (Ma, Wabi-Sabi) inform every decision.

# **2\. Color Palette — Cherry Blossom**

Our palette is inspired by hanami—the Japanese tradition of flower viewing. Each color evokes a specific moment in the cherry blossom season, from first buds to full bloom.

## **Primary Colors**

| Color | Hex Code | Usage |
| :---: | :---: | ----- |
| **Sakura Pink** | \#FFBAD2 | Primary buttons, highlights, Yuki's accent |
| **Blossom White** | \#FFF5F8 | Main background, card surfaces |
| **Petal Light** | \#FFE4EC | Section backgrounds, hover states |
| **Plum Dark** | \#6B4E71 | Primary text, headings, key actions |

## **Accent & Functional Colors**

| Sake Mist | \#E8F4F8 | Cool regions on map, temperature cold |
| :---: | :---: | :---- |
| **Matcha Green** | \#98D4A8 | Success states, completed badges, organic |
| **Warm Sake** | \#FFE5C4 | Temperature warm, notifications, warnings |
| **Ink Black** | \#2D2D2D | Borders, shadows (neobrutalism), icons |

# **3\. Typography System**

Typography creates rhythm and hierarchy. Our type system balances modern clarity with subtle Japanese influence.

## **Font Stack**

| Role | Font | Usage |
| ----- | ----- | ----- |
| **Display** | Space Grotesk | Hero text, large headings |
| **Headings** | Archivo Black | Section titles, card headers |
| **Body** | Inter | Paragraphs, labels, captions |
| **Japanese** | Noto Sans JP | Japanese names, region labels |

## **Type Scale**

**Display XL:** 48px / 3rem — Hero headlines only

**Display:** 36px / 2.25rem — Page titles

**Heading 1:** 28px / 1.75rem — Section headers

**Heading 2:** 22px / 1.375rem — Card titles

**Body Large:** 18px / 1.125rem — Lead paragraphs

**Body:** 16px / 1rem — Default text

**Small:** 14px / 0.875rem — Labels, captions

**Micro:** 12px / 0.75rem — Badges, metadata

# **4\. RetroUI Component Guidelines**

RetroUI's neobrutalist components get a cherry blossom makeover. We preserve the bold borders and offset shadows while softening with our pastel palette.

## **Neobrutalist Foundations**

* **Bold Borders:** 2-3px solid \#2D2D2D on all interactive elements

* **Offset Shadows:** 4px 4px 0px \#2D2D2D for depth (moves to 6px on hover)

* **Rounded Corners:** 8-12px radius — softer than typical neobrutalism

* **Solid Fills:** No gradients. Flat pastel colors only.

## **Buttons**

### **Primary Button**

bg-\[\#FFBAD2\] text-\[\#2D2D2D\] font-semiboldborder-2 border-\[\#2D2D2D\] rounded-lgshadow-\[4px\_4px\_0px\_\#2D2D2D\]hover:shadow-\[6px\_6px\_0px\_\#2D2D2D\]hover:translate-x-\[-2px\] hover:translate-y-\[-2px\]transition-all duration-200px-6 py-3

### **Secondary Button**

bg-\[\#FFF5F8\] text-\[\#6B4E71\] font-semiboldborder-2 border-\[\#6B4E71\] rounded-lgshadow-\[4px\_4px\_0px\_\#6B4E71\]hover:bg-\[\#FFE4EC\]transition-all duration-200px-6 py-3

## **Cards**

Sake Card — Used for displaying sake bottles, recommendations, and pairings:

\<div class="  bg-\[\#FFF5F8\] rounded-xl  border-3 border-\[\#2D2D2D\]  shadow-\[6px\_6px\_0px\_\#2D2D2D\]  overflow-hidden  hover:shadow-\[8px\_8px\_0px\_\#2D2D2D\]  hover:translate-x-\[-2px\] hover:translate-y-\[-2px\]  transition-all duration-300"\>  \<div class="aspect-\[3/4\] bg-\[\#FFE4EC\]"\>    \<\!-- Sake bottle image \--\>  \</div\>  \<div class="p-4"\>    \<span class="text-xs bg-\[\#FFBAD2\] px-2 py-1 rounded-full"\>      Junmai Daiginjo    \</span\>    \<h3 class="font-bold text-lg mt-2"\>獺祭 Dassai 23\</h3\>    \<p class="text-sm text-gray-600"\>Yamaguchi Prefecture\</p\>    \<div class="flex justify-between items-center mt-3"\>      \<span class="font-bold text-\[\#6B4E71\]"\>$45\</span\>      \<button\>Add to Cart\</button\>    \</div\>  \</div\>\</div\>

# **5\. Spacing & Layout System**

Generous whitespace is essential. It reflects the Japanese concept of 'Ma' (間) — the meaningful void between elements.

## **Spacing Scale (8px Base)**

| Token | Value | Usage |
| ----- | ----- | ----- |
| space-1 | 4px | Inline spacing, icon gaps |
| space-2 | 8px | Tight component padding |
| space-4 | 16px | Default component padding |
| space-6 | 24px | Card padding, element groups |
| space-8 | 32px | Section separation |
| space-12 | 48px | Major content blocks |
| space-16 | 64px | Page sections, hero padding |

## **Grid System**

* **Container:** max-w-6xl (1152px) centered

* **Grid Gap:** 24px (gap-6)

* **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px

# **6\. Accessibility Guidelines**

Beautiful design means nothing if it's not usable by everyone. Our pastel palette is carefully calibrated for WCAG AA compliance.

## **Color Contrast Ratios**

| Combination | Ratio | Pass |
| ----- | :---: | :---: |
| Plum Dark (\#6B4E71) on Blossom White | 6.2:1 | **AAA** |
| Ink Black (\#2D2D2D) on Sakura Pink | 8.1:1 | **AAA** |
| Ink Black (\#2D2D2D) on Petal Light | 10.8:1 | **AAA** |

## **Voice & Screen Reader Support**

* All interactive elements have visible focus indicators (3px Sakura Pink outline)

* Voice agent (Yuki) responses include visual transcripts

* All images have descriptive alt text including Japanese terminology

* Temperature and taste information is conveyed through both color AND text

* Map interactions are keyboard accessible with arrow navigation

* Minimum touch target size: 44x44px

# **7\. Animation & Microinteractions**

Motion brings personality without distraction. Our animations are subtle, purposeful, and respectful of reduced motion preferences.

## **Animation Principles**

6. **Duration:** 150-300ms for micro, 300-500ms for transitions

7. **Easing:** cubic-bezier(0.4, 0, 0.2, 1\) — natural feel

8. **Respect preferences:** Honor prefers-reduced-motion

9. **Purpose:** Every animation should communicate state or guide attention

## **Signature Animations**

### **Cherry Blossom Petal Float**

Used for loading states and celebrations (badge unlocks). Subtle pink petals drift across the viewport.

### **Sake Pour Effect**

Progress indicators use a gentle liquid fill animation — referencing sake being poured into a cup.

### **Card Lift**

On hover, cards translate up slightly (-2px) while their shadow expands, creating a satisfying lift effect true to neobrutalism.

### **Voice Pulse**

When Yuki is listening or speaking, concentric pink rings pulse outward from the voice button — like ripples in a sake cup.

# **8\. Design Do's and Don'ts**

## **✓ Do**

* Use generous whitespace — let elements breathe

* Maintain consistent 2-3px borders on interactive elements

* Use Japanese terms with English translations (e.g., "獺祭 Dassai")

* Apply offset shadows consistently (4px default, 6px hover)

* Keep visual hierarchy clear with type scale

* Test all color combinations for contrast

* Make the voice agent feel approachable and knowledgeable

## **✗ Don't**

* Use gradients — flat colors only

* Overload screens with too many competing elements

* Mix rounded and sharp corners inconsistently

* Use thin, subtle borders — embrace boldness

* Animate without purpose or respect for motion preferences

* Use cultural imagery without understanding (avoid stereotypes)

* Forget keyboard navigation for any interactive element

# **9\. Tailwind CSS Configuration**

Copy this configuration to your tailwind.config.js to implement the Sakéverse design system:

module.exports \= {  theme: {    extend: {      colors: {        sakura: {          pink: '\#FFBAD2',          light: '\#FFE4EC',          white: '\#FFF5F8',        },        sake: {          mist: '\#E8F4F8',          warm: '\#FFE5C4',        },        matcha: '\#98D4A8',        plum: '\#6B4E71',        ink: '\#2D2D2D',      },      fontFamily: {        display: \['Space Grotesk', 'sans-serif'\],        heading: \['Archivo Black', 'sans-serif'\],        body: \['Inter', 'sans-serif'\],        japanese: \['Noto Sans JP', 'sans-serif'\],      },      boxShadow: {        retro: '4px 4px 0px \#2D2D2D',        'retro-hover': '6px 6px 0px \#2D2D2D',        'retro-pink': '4px 4px 0px \#6B4E71',      },      borderWidth: {        3: '3px',      },      borderRadius: {        retro: '12px',      },    },  },  plugins: \[\],}

# **10\. Final Notes**

This design system is a living document. As Sakéverse evolves, so should our visual language. The goal is always the same: make sake approachable, delightful, and deeply respectful of its 1,000-year tradition.

🌸

*"We're not teaching about sake.*

*We're inviting users to join a 1,000-year conversation."*

SAKÉVERSE Design Guide v1.0  
Cherry Blossom Edition • RetroUI \+ Tailwind CSS