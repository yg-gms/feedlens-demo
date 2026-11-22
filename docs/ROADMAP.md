# FeedLens Roadmap

Checked items are present in the local prototype. **P0** is required for judging, **P1** is next if time permits, and **P2** is stretch work. Start with M1's ranking check, then finish the first-run demo path and validate it before taking on stretch work.

## M1 — Core Algorithm Engine

- [x] Rank unseen posts using relevance, fixed popularity, exploration, and recent-topic diversity.
- [x] Learn topic weights from watch time, likes, dislikes, and quick skips. Return the score components and attribute relevance points to individual events.
- [ ] **P0** Add deterministic checks for the first-run sequence: like the opening post, inspect the next ranking, and compare it with a branch that removes the like. Verify expected topic deltas and rank order, and check that X-Ray's displayed total agrees with the engine within display rounding.
- [ ] **P1** Compare the default scoring against one adjusted set of weights on fixed neutral, single-topic, and mixed-interest histories. Keep a variant only if the single-topic case still adapts and the mixed case gains at least one distinct topic in its top three.
- [ ] **P2** Try capped or decaying interest weights. Check that a fresh signal has a measurable effect after a long session and that the same history still replays deterministically.

## M2 — Interactive Learning Experience

- [x] Connect the Interactive Feed, Algorithm X-Ray, Time Machine, and Experiment Lab in one session.
- [x] Show live topic weights and shares in bar and constellation views. Link feed posts to X-Ray's scoring bars, action explanation, and ranking sliders.
- [x] Provide an opening prompt and a **How it works** dialog.
- [ ] **P0** Turn the first-run prompt into a short, skippable walkthrough: react to a post, notice the queue change, then open X-Ray. Have two first-time users complete the flow and explain the action-to-ranking link in under two minutes each without help.
- [ ] **P1** Add a contextual cue when a watched post is disliked. Show both signed signals and their net effect on one topic.

## M3 — Advanced Features & Wow Factors

- [x] Save alternate Time Machine branches that edit one event and compare original and alternate interest weights, scores, and ranks.
- [x] Run three predict-and-reveal experiments with live inputs and computed outcomes.
- [ ] **P1** Add a step-through visual replay for one original and alternate timeline. At each step, show the processed action and topic-weight change. The final frame must match the existing comparison.
- [ ] **P1** Compare two ranking configurations side by side using the same history and candidate pool. Show both top-three lists and explain a changed rank using its score components.
- [ ] **P2** Add an optional challenge that asks users to bring a different topic to the top. Provide one resettable scenario and check success against the live ranker.

## M4 — Polish & Validation

- [x] Add automated tests for the engine, history branches, and experiment outcomes.
- [ ] **P0** Complete the walkthrough and one Time Machine comparison in desktop and mobile browsers. Check all four sections at a 360 px viewport for clipped controls and unintended page overflow.
- [ ] **P0** Complete the core flow with a keyboard. Check visible focus, labelled controls, dialog dismissal, and readable ranking changes with reduced motion enabled. Fix issues that block the flow.
- [ ] **P0** Run a clean install, `npm test`, and `npm run build` from the submission source. Verify the public demo in a signed-out browser and confirm the public repo includes the source.
- [ ] **P0** Finish the project page and short demo video. Rehearse a two-minute demo with one reaction, one X-Ray inspection, and one Time Machine comparison.
- [ ] **P1** Polish the queue and profile animations on desktop and mobile. Check that updates preserve focus and keep controls usable during transitions.
