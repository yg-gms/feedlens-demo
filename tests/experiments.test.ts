import test from 'node:test'
import assert from 'node:assert/strict'
import {escapeExperiment, loopExperiment, watchExperiment, watchPost, gamingPosts} from '../src/experiments.ts'

test('watching long enough can outweigh a dislike', () => {
  assert.equal(watchExperiment(0, false).net, 0)
  assert.ok(watchExperiment(8, true).net < 0)
  const full = watchExperiment(watchPost.duration, true)
  assert.ok(full.net > 0)
  assert.equal(full.net, full.watch + full.reaction)
})

test('gaming likes raise interest and change the next round’s top three', () => {
  const start = loopExperiment(0)
  const end = loopExperiment(gamingPosts.length)
  assert.deepEqual(start.after, start.before)
  assert.ok(end.share > start.share)
  assert.ok(start.after.some(row => row.post.topic !== 'Gaming'))
  assert.ok(end.after.every(row => row.post.topic === 'Gaming'))
})

test('escape controls can let another topic take first place with the same history', () => {
  const start = escapeExperiment(0, 0)
  const end = escapeExperiment(100, 100)
  assert.deepEqual(start.before, start.after)
  assert.equal(start.after[0].post.topic, 'Gaming')
  assert.notEqual(end.after[0].post.topic, 'Gaming')
  assert.deepEqual(end.before, start.before)
  assert.deepEqual(escapeExperiment(0, 0), start)
})
