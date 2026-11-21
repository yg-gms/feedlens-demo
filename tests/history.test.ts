import test from 'node:test'
import assert from 'node:assert/strict'
import {fresh, update} from '../src/session.ts'
import {forkHistory, readHistory} from '../src/history.ts'

test('saved branches replay their original events, settings and candidate pool independently',()=>{
  let live = update(fresh(), {type:'like'})
  const event = live.events[0]
  const original = readHistory(live, live.events)
  const flip = forkHistory(live,event,'dislike')
  const omit = forkHistory(live,event,'remove')
  const alternate = readHistory(flip,flip.alternative)
  assert.equal(alternate.profile.Gaming,-4)
  assert.equal(readHistory(omit,omit.alternative).profile.Gaming,0)
  assert.notEqual(alternate.ranking[0].post.id,original.ranking[0].post.id)
  assert.equal(flip.events[0].kind,'like')
  live = update(update(live,{type:'next'}),{type:'setting',key:'learningSpeed',value:0})
  assert.deepEqual(readHistory(flip,flip.events),original)
  assert.deepEqual(readHistory(flip,flip.alternative),alternate)
  assert.equal(live.seen.length,2)
})

test('changing watch duration keeps the recorded watch and later events intact',()=>{
  const live = update(update(update(fresh(),{type:'play'}),{type:'tick'}),{type:'like'})
  const branch = forkHistory(live,live.events[0],5)
  assert.equal(live.events[0].seconds,1)
  assert.equal(branch.alternative[1],live.events[1])
  assert.equal(readHistory(branch,branch.alternative).profile.Gaming,5.75)
})
