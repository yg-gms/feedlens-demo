# CIS Hackathon 2026 — Team Entry

**FeedLens** is an interactive web project for the **CIS Hackathon**, released 19 November 2026.
Submissions close **25 November 2026, 23:59 AoE**.

> **Status: working prototype.** FeedLens has four connected sections and a browser-based recommendation engine.

---

## The one-sentence pitch

FeedLens lets you train a simulated short-video feed and trace how a watch, like, dislike, or skip changes your next recommendation.

---

## What this project is

Recommendation feeds make it easy to react to a post and hard to see what the system learns from that reaction. FeedLens makes the feedback loop visible so a first-time user can explain, within two minutes, how their actions affect what they see next.

- **Technology:** Personalized short-video feeds.
- **Mechanism we are exposing:** A ranking engine that learns topic weights from your actions and scores unseen posts.
- **What the user changes:** Watch time, reactions, skips, and sliders that control learning and ranking.
- **What they see change:** An interactive interest constellation or bar chart, the upcoming queue, and each post's score breakdown.
- **The thing they had not thought to ask about:** Can watching a post long enough raise interest in its topic even after you tap Dislike?

**Implemented in the demo**

- **Interactive Feed (Your Feed)** — Watch, like, dislike, or skip simulated posts and see the interest profile and upcoming queue update.
- **Algorithm X-Ray (Behind the Feed)** — Inspect a candidate's score, see its strongest contributing action, and adjust ranking weights.
- **Time Machine** — Change or remove a past interaction in a saved branch and compare interest weights and upcoming rankings with the original.
- **Experiment Lab (Algorithm Lab)** — Predict and test whether watch time can outweigh a dislike, how gaming likes create a feedback loop, and how exploration or diversity can change the top pick.

The opening prompt and **How it works** dialog give users a short guided start. A step-by-step onboarding walkthrough, animated history replay, and side-by-side algorithm comparisons are planned. See the [roadmap](docs/ROADMAP.md) and [algorithm guide](docs/ALGORITHM.md).

---

## Live link

[Open the FeedLens demo](https://yg-gms.github.io/feedlens-demo/).

---

## Running locally

Use Node.js 22.12 or later and npm. From the FeedLens source directory containing `package.json`, run:

```bash
npm ci
npm run dev
# Open the URL printed by Vite, typically http://localhost:5173
```

Like the opening post and inspect **Up next**, then select a recommendation to open its score breakdown. Use **Reset session** to start again with a neutral profile and default settings.

Run `npm test` for the model tests and `npm run build` to produce the static site in `dist/`. Run `npm run build:portable` to write a standalone `FeedLens.html` one directory above the source.

---

## Repo layout

```
index.html          browser entry point
package.json        development, test, and build scripts
src/                recommendation engine and four interactive sections
public/art/         covers for the simulated post catalog
tests/              engine, history, and experiment tests
docs/ROADMAP.md     milestone checklist and demo criteria
docs/ALGORITHM.md   scoring, learning, and simulation limits
```

The hackathon scaffold also includes the [challenge brief](https://github.com/luminaryshadows/cis-hackathon-2026/blob/main/BRIEF.md) and [team task list](https://github.com/luminaryshadows/cis-hackathon-2026/blob/main/TASKS.md).

---

## Hard rules we must not break

1. **Public link, no sign-in, no download, no API key.** Keep the demo online until judging ends.
2. **Interactive.** The user changes an input and sees the project respond.
3. **Computed outputs.** The recommendations and experiment outcomes come from the user's inputs.
4. **Our own mechanism.** The recommendation engine runs in our own code in the browser.
5. **Two minutes, no help.** A first-time user should understand the main idea within two minutes.
6. **Explain every line we wrote** and justify the third-party components we chose.

---

## Team

| Name | GitHub | Owns |
|------|--------|------|
| Aaden | [@luminaryshadows](https://github.com/luminaryshadows) | TBD |
| Alastair | [@alastairchupy](https://github.com/alastairchupy) | TBD |
| Oscar | _handle pending_ | TBD |
| Yigit | [@yg-gms](https://github.com/yg-gms) | TBD |

---

## Licence

The hackathon scaffold specifies MIT for the team's own code. The third-party credits are pending.
