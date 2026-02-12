# KOMPLEX-01 AI Review: Improvement Recommendations

After a thorough review of the AI integration across the codebase, here are concrete, prioritized improvements organized by category.

---

## 1. Security — API Key Exposure (Critical)

**Problem:** The Groq API key is stored in IndexedDB and used directly from the browser with `dangerouslyAllowBrowser: true` (`groqService.ts:12`). Any XSS vulnerability, browser extension, or malicious script on the page can extract the key.

**Recommendations:**

- **Add a lightweight proxy.** Even a minimal Cloudflare Worker or Vercel Edge Function that forwards requests to Groq would keep the key server-side. The client sends requests to `/api/coach`, the proxy attaches the key. This is a small addition that eliminates the entire class of key-theft issues.
- **If staying client-only**, warn users more explicitly that the key is accessible to anything running in the browser, and consider encrypting it at rest with a user-provided passphrase.
- **Rate-limit on the proxy side** to prevent abuse if a key is ever exposed.

---

## 2. Streaming Responses (High Impact UX)

**Problem:** Both `sendMessage` and `sendMessageWithTools` (`groqService.ts:37-188`, `190-304`) wait for the full completion before displaying anything. For a fitness coach giving multi-paragraph advice, users stare at a loading animation for several seconds.

**Recommendation:**

- Use `stream: true` on the Groq SDK's `chat.completions.create`. The SDK returns an async iterable. Feed tokens into the chat message as they arrive:

```ts
const stream = await this.client.chat.completions.create({ ...params, stream: true })
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || ''
  onToken(delta) // callback updates the message in state
}
```

- This makes AI Coach feel dramatically more responsive, especially on slower connections or when the model generates longer answers.

---

## 3. Conversation Persistence (High Impact)

**Problem:** Chat history in `CoachPage.tsx` lives in `useState` — refreshing the page or navigating away and back loses the entire conversation.

**Recommendations:**

- Persist `messages` to IndexedDB (you already have the `idb` library and a DB setup in `db.ts`). Add a `coachConversations` object store.
- On mount, load the most recent conversation. On each new message, append to the store.
- Add a "New Conversation" button to start fresh.
- This also enables a conversation history feature down the line.

---

## 4. Deduplicate GroqService Error Handling

**Problem:** `sendMessage` (line 190-304) and `sendMessageWithTools` (line 37-188) contain ~60 lines of duplicated error-handling logic (the entire catch block is copy-pasted).

**Recommendation:**

- Extract a private `handleApiError(error: unknown): AICoachError` method and call it from both methods. This cuts ~50 lines and ensures error handling stays consistent if you add new error types (e.g., model overload, context length exceeded).

---

## 5. Multi-Turn Tool Use (Correctness)

**Problem:** In `CoachPage.tsx:310-341`, when the AI returns a `tool_calls` response, the code executes the tool but never sends the tool result back to the model. In proper tool-use flows, you're supposed to:
1. Get the `tool_calls` response
2. Execute the tool
3. Send a `tool` role message with the result back to the model
4. Get the model's final response incorporating the tool result

Currently, the AI can't tell the user *about* the workout it just generated because it never sees the result of its own tool call.

**Recommendation:**

- After executing `generate_workout`, send a follow-up message with role `tool` containing the result (e.g., workout summary), then let the model produce a natural-language response. This lets the AI say things like "I've created a push-focused workout because your chest hasn't been hit in 3 days."

---

## 6. Model Selection

**Problem:** Hard-coded to `llama-3.1-8b-instant` (`groqService.ts:4`). This is fast but limited in reasoning quality — it struggles with nuanced training periodization advice, sometimes hallucinates exercise names, and produces generic responses.

**Recommendations:**

- **Use a tiered approach:** Use the 8B model for quick in-workout form tips (where speed matters and responses are short), and a larger model (e.g., `llama-3.3-70b-versatile` or `deepseek-r1-distill-llama-70b`) for the Coach page where users expect higher-quality programming advice.
- Make the model configurable in settings for power users.
- Groq's free tier supports multiple models — this costs nothing extra.

---

## 7. Structured Output for JSON Responses

**Problem:** `aiStretchAdvisor.ts:61-80` asks the LLM to return JSON via prompt instructions and then does fragile regex cleanup (`line 90: message.replace(/```json?\n?/g, ...)`). Small models frequently break JSON format.

**Recommendations:**

- Use Groq's `response_format: { type: "json_object" }` parameter to force valid JSON output. This eliminates the markdown-fence stripping and reduces parse failures.
- Add a retry (1-2 attempts) on JSON parse failure with a shorter, more direct prompt.
- Consider defining a JSON schema in the request if Groq supports structured outputs with schemas.

---

## 8. Token Budget Is Too Restrictive

**Problem:** `max_tokens: 500` is hard-coded in both methods. For "Analyze Progress" or "Recovery Tips" quick actions, the model often truncates mid-sentence.

**Recommendations:**

- Use context-dependent token limits:
  - In-workout form tips: 200 tokens (keep it brief, which is the intent)
  - Coach page general chat: 800-1000 tokens
  - Progress analysis: 1000-1500 tokens
- Pass `maxTokens` as a parameter to `sendMessage`/`sendMessageWithTools` rather than hard-coding it.

---

## 9. Request Cancellation

**Problem:** If a user navigates away from the Coach page mid-request, the API call continues and the response is silently dropped. Worse, if they type a follow-up message quickly, two responses can race.

**Recommendation:**

- Use `AbortController` to cancel in-flight requests on unmount or when a new message is sent:

```ts
const controller = new AbortController()
const completion = await this.client.chat.completions.create(
  { ...params },
  { signal: controller.signal }
)
```

- Store the controller in a ref and abort it in the cleanup function of `useEffect` or at the start of `sendMessage`.

---

## 10. Workout History Context Window

**Problem:** `workoutHistoryAnalyzer.ts:23` only looks at 7 days. Users who train 3x/week may only have 3 data points. This gives the AI very little to work with for trend analysis.

**Recommendations:**

- Expand to 30 days for the "Analyze Progress" action.
- Keep 7 days as the default for workout generation (recovery relevance).
- Track aggregate stats over all time: total workouts, favorite categories, average frequency. Feed this as a separate "LONG-TERM TRENDS" section in the system prompt.
- This makes "Analyze Progress" meaningfully different from "Suggest Workout" — right now they produce similar outputs because they see the same limited window.

---

## 11. Prompt Engineering Improvements

**Current prompts reviewed:** `CoachPage.tsx:270-294`, `workoutContextBuilder.ts:61-79`, `aiStretchAdvisor.ts:61-82`

**Issues and recommendations:**

- **Coach system prompt is rebuilt every message** but the training context rarely changes. Cache the analysis and only rebuild when history changes.
- **The prompt says "be encouraging"** but doesn't establish boundaries. Add: *"Don't recommend exercises the user hasn't listed in their equipment. Don't recommend training a muscle group that was worked in the last 24 hours unless the user explicitly asks."*
- **The generate_workout tool description** should include the user's available equipment list in the parameter description so the model doesn't generate equipment-dependent workouts the user can't do.
- **In-workout prompt** (`workoutContextBuilder.ts:61`) tells the AI to avoid markdown, but `ChatMessage.tsx` actually renders markdown. These are contradictory — either remove the markdown restriction or strip markdown in the renderer.

---

## 12. Error Recovery and Retry

**Problem:** On transient errors (network blips, Groq 500s), the user must manually tap "Retry." There's no automatic retry.

**Recommendation:**

- Add 1 automatic retry with a 2-second delay for `retryable: true` errors before surfacing the error to the user. This handles the common case of a momentary network hiccup without user intervention.

---

## 13. Feedback Loop — Learn from Completed Workouts

**Problem:** The AI generates workouts but never learns whether the user actually completed them, which exercises were skipped, or how difficult they found it.

**Recommendations:**

- After workout completion, build a completion summary: exercises completed vs. skipped, total time vs. estimated time, any early termination.
- Store this alongside the workout history entry (some of this data already exists in `WorkoutHistoryEntry`).
- Include completion patterns in the coach context: *"User tends to skip burpees and cut cool-downs short. Last 3 AI-generated workouts were completed at 80% average."*
- This makes the AI progressively better at generating workouts the user will actually finish.

---

## 14. Offline AI Fallback

**Problem:** When offline, all AI features silently fail or show an error. For a PWA that emphasizes offline capability, this is a gap.

**Recommendations:**

- **Cache the last N AI responses** for common quick actions (form tips per exercise). If the user asks about an exercise they've asked about before while offline, serve the cached response.
- **Pre-generate a "workout of the day"** when online and cache it for offline use.
- Show a clear "Offline — using cached suggestions" indicator rather than failing silently.

---

## 15. Token/Usage Visibility

**Problem:** Users have no visibility into their Groq API usage. They only discover they've hit the rate limit when they get an error.

**Recommendation:**

- Track request count locally (increment a counter in IndexedDB per API call).
- Show approximate daily usage in Settings under the API key section.
- Groq's free tier is 14,400 req/day — show something like "~47 of 14,400 daily requests used."

---

## Summary — Prioritized Roadmap

| Priority | Improvement | Effort | Impact |
|----------|-------------|--------|--------|
| P0 | API key proxy (security) | Medium | Critical |
| P0 | Multi-turn tool use fix | Small | Correctness |
| P1 | Streaming responses | Medium | High UX |
| P1 | Conversation persistence | Small | High UX |
| P1 | Structured JSON output | Small | Reliability |
| P1 | Token budget per context | Small | Quality |
| P2 | Deduplicate error handling | Small | Maintainability |
| P2 | Model tiering | Small | Quality |
| P2 | Request cancellation | Small | Reliability |
| P2 | Prompt engineering fixes | Small | Quality |
| P2 | Automatic retry | Small | UX |
| P3 | Extended history window | Small | Quality |
| P3 | Completion feedback loop | Medium | Quality |
| P3 | Offline AI fallback | Medium | UX |
| P3 | Usage tracking | Small | UX |
