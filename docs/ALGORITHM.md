# FeedLens Recommendation Algorithm

FeedLens ranks a fixed catalog of 32 simulated posts across eight topics. The browser recomputes the profile and rankings as the user interacts. The model starts with a weight of zero for every topic.

## How actions change interests

| Action | Base signal |
| ------ | ----------: |
| Watch | +0.35 points per simulated second watched |
| Like | +4 points |
| Dislike | −4 points |
| Quick skip | −2 points |

A quick skip is an advance before three seconds of watch time with no active like or dislike on that visit. At three seconds or later, advancing records no skip. Watch time counts while the simulated player is running. Each visit can have one active reaction. Tapping it again removes it, while tapping the opposite reaction replaces it. Watch points from that visit remain.

The model multiplies watch signals by the **Watch time** slider divided by 50. It multiplies likes, dislikes, and quick skips by **Explicit feedback** divided by 50. It then multiplies every signal by **Learning speed** divided by 50. All three default to 50, so the base signals apply at the defaults.

The main topic gets the full signal and any related topic gets one quarter of it. For example, 12 seconds of watch time followed by a dislike gives the main topic `4.2 − 4 = +0.2` points at default settings. The profile is rebuilt from the recorded events after learning settings or reactions change. Interest percentages in the constellation and bar chart are a softmax of the raw weights with a temperature of 5, rounded to tenths that sum to 100%. Ranking uses the raw weights.

## How posts are ranked

Each unseen post gets the sum of four components. Slider values below are on a 0–100 scale.

| Component | Calculation | Default slider |
| --------- | ----------- | -------------: |
| Interest match | (Main topic weight + ¼ × related topic weight, if present) × Personalization ÷ 100 | 75 |
| Popularity | Fixed catalog discovery value × Popularity ÷ 100 | 100 |
| Exploration | 2 ÷ (1 + times this main topic has appeared this round) × Exploration ÷ 100 | 25 |
| Diversity | −4 × occurrences of this main topic among the last three shown posts × Content diversity ÷ 100 | 35 |

The highest total wins. Exact ties retain catalog order. The opening post is fixed to the first catalog entry. Later selections use the ranking and exclude posts already shown that round. Starting a new round resets which posts have been shown and keeps the learned profile. **Reset session** clears the history and restores the default sliders.

## What the learning tools show

- **Algorithm X-Ray** shows the four score components and traces the recorded event with the largest absolute contribution to the candidate's interest-match score. For the current post, it can show both the saved selection score and a live rescore.
- **Time Machine** edits one event in an alternate snapshot and replays both histories with the same settings and already-seen posts. It compares the resulting interests, scores, and upcoming ranks. Later actions stay as recorded.
- **Experiment Lab** uses posts from the same catalog and sandbox histories to compute outcomes for watch time versus dislike, repeated gaming likes, and exploration and diversity. Its experiment inputs are isolated from the live feed. The separate live-feed controls affect the session.

The calculations live in [`engine.ts`](../src/engine.ts), with session rules in [`session.ts`](../src/session.ts), branch replay in [`history.ts`](../src/history.ts), and sandbox scenarios in [`experiments.ts`](../src/experiments.ts).

## Assumptions and limitations

The catalog, topic tags, and popularity values are assigned in advance. The model treats watch time as positive evidence even when someone watches out of curiosity or disagreement. Interest weights accumulate without decay, so long histories can outweigh recent actions. Session history and saved branches are held in browser memory and cleared by reload. This is a simplified demonstration of a recommendation feedback loop whose scores describe this catalog and model.

## Proposed improvements

Validate the current scoring on fixed histories first. Then compare ranking configurations for their effect on relevance and topic variety, and test bounded or decaying weights for longer sessions. A step-through replay could make the effect of individual actions easier to follow. See the [roadmap](ROADMAP.md) for priorities.
