# Decision for the Manager: Motion library vs plain CSS transitions for the visuals

**Context.** Plan §4.2 ([DECIDED]) chose **Motion** (`motion` 12.x, the successor of Framer Motion) for enter/exit and layout animations inside visuals, with CSS transitions for simple state changes. While building the visualization system, the visualization engineer (W3) implemented **every animation with CSS transitions** and did not use Motion. Changing a [DECIDED] item needs the Manager's approval (D-011), so this is put to the Manager. `motion` stays installed until the ruling.

**What the animations must do (plan §4.11.3, DESIGN.md → Visual Language → Motion):** 200–350 ms transitions with one easing curve; one thing moving at a time (cause, then effect, played in sequence); interruption (a new step finishes the running transition at once); scrubbing jumps without animation; no autoplay; reduced motion turns movement into a short cross-fade or snap. The built player does all of this today with CSS (class toggles `.vz-live`, `.vz-snap`, `.vz-enter`, `.vz-exit`, and a duration custom property).

## Comparison

| | CSS transitions (as built) | Motion library (as planned) |
|---|---|---|
| **Visual quality** | Fades, colour/outline changes and straight-line moves of SVG items, sequenced in two phases. Everything the current 9 visualizers need. | The same, plus spring physics, automatic layout ("FLIP") animations when items reorder, and path morphing. These are not needed by the current design rules (no bounce, one easing curve), but they would make some future effects easier, e.g. an item sliding smoothly into a re-sorted list. |
| **Download size** | Lazy player chunk **18.3 kB gzip** in total (measured, W3), against a 60 kB budget. | **Measured in this app (W3):** +27.7 kB gzip for enter/exit animations (chunk ≈ 46 kB), or +40.8 kB with layout animations (chunk ≈ 59 kB, just under the 60 kB budget). |
| **Reduced motion** | One rule: the duration property goes to 0 ms (instant snap), with a short cross-fade where DESIGN.md asks for it. Covered by tests. | Built in (`MotionConfig reducedMotion="user"`), per animation. Equivalent result. |
| **Maintainability** | No extra dependency, so no library upgrades or security patches to track. Animation logic is a small amount of in-house CSS and state code that future authors must understand. Complex new effects would need hand-written work. | A well-known, maintained library with good docs, so future engineers may find it familiar. It adds one more dependency to pin and patch, and it has already moved to a new major (13.x) while the plan pins 12.x. |
| **Effort to switch** | Nothing: it is built, tested and screenshot-reviewed. | Moderate: rewrite the player's transition layer onto Motion, re-run the visual reviews, re-measure the chunk, and update the tests. Roughly one worker batch. No content exists yet, so this is the cheapest moment to switch if the Manager wants it. |

## Recommendation (orchestrator)

**Accept CSS transitions** and amend plan §4.2 to say: "CSS transitions in the in-house player; no animation library". The built player already meets every motion, interruption and reduced-motion rule. It is smaller and has one fewer dependency, which fits the Manager's "keep it lean" ruling (D-030). If a future visual ever needs layout or spring animation, Motion can be added then, through a changelog entry. If approved, `motion` is removed from `main-app/package.json`, which is P4's final clean-up.

If the Manager prefers the plan as written, P4 switches the player to Motion before the phase closes.
