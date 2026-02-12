# AI-Powered Stretch-Workout Pairing Plan

## Problem
Warm-up and cool-down stretches are currently selected **randomly** from a small pool of 6 exercises. They have zero awareness of what muscles the main workout targets. This means a heavy leg day might get shoulder stretches in the cool-down, leading to next-day soreness that proper stretching could have prevented.

## Solution: Hybrid Muscle-Aware + AI-Enhanced Stretch Pairing

A two-layer system:
1. **Layer 1 (Deterministic):** A muscle-group-aware algorithm that always runs — no API key needed. It analyzes the main workout's muscle engagement and scores/selects stretches accordingly.
2. **Layer 2 (AI-Enhanced, optional):** When Groq AI Coach is enabled, consult the AI after workout generation to refine stretch selections, adjust hold durations, and provide reasoning the user can see in the preview.

---

## Step-by-Step Implementation

### Step 1: Expand the Stretch Library
**File:** `src/data/exercises.ts`

The current 6 stretches don't cover enough muscle groups. Add ~12 new stretches to ensure every major muscle group has at least 1-2 dedicated stretches:

| New Stretch | Primary Muscles | Warm-Up | Cool-Down |
|---|---|---|---|
| Standing Quad Stretch | quads | no | yes |
| Standing Calf Stretch | calves | no | yes |
| Cross-Body Shoulder Stretch | shoulders, upper-back | no | yes |
| Chest Doorway Stretch | chest, shoulders | no | yes |
| Seated Forward Fold | hamstrings, lower-back | no | yes |
| Lying Spinal Twist | lower-back, obliques | no | yes |
| Wrist Circles | forearms | yes | yes |
| Tricep Overhead Stretch | triceps | no | yes |
| Figure-Four Stretch | glutes, hip-flexors | no | yes |
| High Knees | quads, hip-flexors, calves | yes | no |
| Inchworms | hamstrings, shoulders, core | yes | no |
| Lateral Lunges | hip-flexors, quads, glutes | yes | no |

This brings the pool to ~18 stretches with good coverage of all 16 muscle groups. All use `animationId: 'stretch'` (generic) since adding new animations is out of scope.

### Step 2: Build the Stretch Pairing Algorithm
**New file:** `src/lib/stretchPairing.ts`

Core logic:

```
function pairStretchesToWorkout(mainWorkout: WorkoutPhase, eligible: Exercise[]): { warmUp: Exercise[], coolDown: Exercise[] }
```

**Algorithm:**

1. **Analyze the main workout** — walk all circuits and compute a `muscleLoadMap: Record<MuscleGroup, number>` scoring each muscle by:
   - +1.0 per exercise where it's a primary muscle × rounds
   - +0.5 per exercise where it's a secondary muscle × rounds
   - Higher difficulty = +20% multiplier to load scores

2. **Score each stretch** for the cool-down:
   - For each stretch, sum `muscleLoadMap[muscle]` for all its primary muscles
   - Add 0.5× for secondary muscles
   - Higher-scored stretches = more relevant to the muscles that were just worked
   - Pick top 4-5, ensuring no duplicates

3. **Score each stretch** for the warm-up:
   - Same scoring but with a "preparation" lens: prioritize dynamic stretches (`isWarmUp: true`) that target the muscles about to be loaded
   - Pick top 2-3 dynamic/mobility stretches

4. **Duration adjustment:**
   - For cool-down stretches targeting the heaviest-loaded muscles, increase hold time by 25-50%
   - For warm-up stretches, keep durations short/standard

### Step 3: Integrate into Workout Generator
**File:** `src/lib/workoutGenerator.ts`

Modify `generateWorkout()`:
- Generate the main workout **first** (already happens)
- Pass the completed main workout into the new stretch pairing algorithm
- Replace the current random `generateWarmUp()` and `generateCoolDown()` calls with the paired results
- Keep the existing functions as fallbacks if the pairing pool is too small

### Step 4: AI Stretch Advisor (Optional Enhancement)
**New file:** `src/lib/aiStretchAdvisor.ts`

When the user has AI Coach enabled (Groq API key configured):

1. After deterministic pairing, build a prompt describing:
   - The full workout (exercises, sets, reps, muscle groups)
   - The selected stretches (pre and post)
   - Ask the AI: "Given this workout, are these the optimal stretches? Should any hold durations be adjusted? Any muscles at high risk of next-day soreness that need extra attention?"

2. Parse the AI response as structured JSON with fields:
   - `adjustments`: array of `{ stretchId, newDurationSeconds?, reason }`
   - `warnings`: string[] (e.g., "Heavy quad load — hold quad stretch for 45s+")
   - `approval`: boolean (are the stretches well-paired?)

3. Apply adjustments to the stretch durations and store the AI reasoning.

### Step 5: Surface Pairing Rationale in UI
**File:** `src/components/workout/WorkoutPreview.tsx`

Add a small section to the workout preview showing *why* stretches were chosen:
- "Cool-down targets your most-worked muscles: quads, glutes, hamstrings"
- If AI-enhanced: show the AI's reasoning/warnings
- Keep it minimal — a single line under the cool-down section

### Step 6: Update Types
**File:** `src/types/workout.ts`

Add optional fields to `GeneratedWorkout`:
```typescript
stretchPairing?: {
  targetedMuscles: MuscleGroup[]    // Top muscles the stretches target
  aiEnhanced: boolean               // Whether AI refined the selection
  aiReasoning?: string              // AI explanation (if available)
}
```

---

## Architecture Decisions

- **Deterministic-first**: The algorithm always works without an API key. AI is purely additive.
- **No new dependencies**: Uses existing Groq SDK, no new packages.
- **Backward-compatible**: `generateWorkout()` keeps the same return type (just adds optional fields). Existing saved workouts still load fine.
- **Stretch pool expansion is necessary**: 6 stretches can't meaningfully cover 16 muscle groups. The new exercises use the existing `'stretch'` animation ID.

## File Changes Summary

| File | Action |
|---|---|
| `src/data/exercises.ts` | Add ~12 new stretch exercises |
| `src/lib/stretchPairing.ts` | **New** — muscle-aware stretch selection algorithm |
| `src/lib/aiStretchAdvisor.ts` | **New** — optional AI consultation for stretch refinement |
| `src/lib/workoutGenerator.ts` | Wire in stretch pairing, replace random selection |
| `src/types/workout.ts` | Add `stretchPairing` field to `GeneratedWorkout` |
| `src/components/workout/WorkoutPreview.tsx` | Show pairing rationale |
