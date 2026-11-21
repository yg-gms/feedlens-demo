import test from 'node:test'
import assert from 'node:assert/strict'
import {defaults,eventContribution,eventWeight,learn,neutral,posts,rank,replay,shares,topics} from '../src/engine.ts'
import {currentPost,fresh,reaction,update} from '../src/session.ts'
import type {Interaction} from '../src/engine.ts'
import type {Session} from '../src/session.ts'

const first=posts[0]
const like:Interaction={id:1,kind:'like',postId:first.id,seconds:0,visit:1}
const watch:Interaction={...like,id:2,kind:'watch',seconds:4}
const playFor=(s:Session,n:number)=>{
  let playing=update(s,{type:'play'})
  for(let i=0;i<n;i++) playing=update(playing,{type:'tick'})
  return playing
}

test('balanced starting shares, signed learning, and finite shares in long sessions',()=>{
  assert.deepEqual(shares(neutral()),topics.map(()=>12.5))
  assert.deepEqual(learn(learn(neutral(),first,4),first,-4),neutral())
  const profile=learn(neutral(),first,4)
  assert.ok(shares(profile)[0]>12.5)
  assert.equal(shares(profile).reduce((a,b)=>a+Math.round(b*10),0),1000)
  assert.equal(shares(learn(neutral(),first,100000))[0],100)
})

test('three learning controls independently reweight original events and replay deterministically',()=>{
  const original=[like,watch]
  assert.equal(replay(original,defaults).Gaming,5.4)
  assert.equal(replay(original,{...defaults,watchTime:0}).Gaming,4)
  assert.equal(replay(original,{...defaults,explicitFeedback:0}).Gaming,1.4)
  assert.equal(replay(original,{...defaults,learningSpeed:100}).Gaming,10.8)
  assert.deepEqual(replay(original,{...defaults,learningSpeed:0}),neutral())
  assert.deepEqual(replay(original,defaults),replay(structuredClone(original),defaults))
  assert.deepEqual(original,[like,watch])
})

test('ranking components explain the actual order, and each ranking control affects its own term',()=>{
  const profile = replay([like,watch],defaults)
  const ranked=rank(profile,[first],defaults)
  assert.equal(ranked.length,posts.length-1)
  assert.ok(ranked.every((r,i)=>r.total===Object.values(r.parts).reduce((a,b)=>a+b,0) && (!i||ranked[i-1].total>=r.total)))
  const arcade=ranked.find(r=>r.post.id==='arcade')!
  assert.equal(arcade.parts.relevance,[like,watch].reduce((sum,e)=>sum+eventContribution(arcade.post,e,defaults),0))
  for(const [slider,term] of [['personalization','relevance'],['exploration','exploration'],['diversity','diversity'],['popularity','popularity']] as const) {
    const changed=rank(profile,[first],{...defaults,[slider]:0}).find(r=>r.post===arcade.post)!
    assert.ok(arcade.parts[term]!==0 && changed.parts[term]===0)
    assert.ok(changed.total!==arcade.total)
  }
  assert.equal(rank(neutral(),[first],defaults)[0].post.topic,'Music')
  assert.equal(rank(replay([like],defaults),[first],defaults)[0].post.related,'Gaming')
  assert.equal(rank(replay([like],defaults),[first],{...defaults,diversity:0})[0].post.topic,'Gaming')
  assert.notEqual(rank(replay([like],defaults),[first],{...defaults,diversity:100})[0].post.topic,'Gaming')
})

test('watch segments aggregate, pause stops learning, explicit reactions replace or undo, skips count once',()=>{
  let s=playFor(fresh(),3)
  assert.equal(s.events.length,1)
  assert.equal(s.events[0].seconds,3)
  s=update(s,{type:'pause'})
  assert.deepEqual(update(s,{type:'tick'}),s)
  s=update(s,{type:'like'})
  s=update(s,{type:'dislike'})
  assert.deepEqual(s.events.map(e=>e.kind),['watch','dislike'])
  assert.equal(eventWeight(reaction(s)!,s.settings),-4)
  s=update(s,{type:'dislike'})
  assert.deepEqual(s.events.map(e=>e.kind),['watch'])
  assert.equal(update(s,{type:'next'}).events.length,1)
  assert.deepEqual(update(fresh(),{type:'next'}).events.map(e=>e.kind),['skip'])
  const complete=playFor(fresh(),30)
  assert.equal(complete.seconds,first.duration)
  assert.equal(complete.playing,false)
})

test('removing individual events replays the rest and tuning leaves the current post in place',()=>{
  const liked=update(playFor(fresh(),2),{type:'like'})
  const removed=update(liked,{type:'remove',id:liked.events[0].id})
  assert.equal(replay(removed.events,removed.settings).Gaming,4)
  const tuned=update(removed,{type:'setting',key:'explicitFeedback',value:0})
  assert.deepEqual(replay(tuned.events,tuned.settings),neutral())
  assert.equal(currentPost(tuned),first)
  assert.equal(tuned.events,removed.events)
  assert.deepEqual(update(tuned,{type:'reset'}),fresh())
})

test('all 32 posts occur once per round; new round preserves learning and restarts reaction state',()=>{
  let s=fresh()
  for(let i=0;i<posts.length;i++){
    assert.equal(s.done,false)
    assert.equal(s.seen.length,i+1)
    assert.equal(currentPost(s),s.selected.post)
    s=update(s,{type:'next'})
  }
  assert.equal(s.done,true)
  assert.equal(s.events.length,posts.length)
  assert.equal(new Set(s.seen.map(p=>p.id)).size,32)
  assert.deepEqual(rank(replay(s.events,s.settings),s.seen,s.settings),[])
  const next=update(s,{type:'round'})
  assert.equal(next.seen.length,1)
  assert.equal(next.round,2)
  assert.equal(next.events,s.events)
  assert.equal(reaction(next),undefined)
  assert.deepEqual(update(next,{type:'reset'}),fresh())
})
