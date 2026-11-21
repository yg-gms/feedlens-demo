import {posts, topics} from './catalog.ts'
import type {Post, Topic} from './catalog.ts'
export {posts, topics}
export type {Post, Topic}

export type Profile = Record<Topic, number>
export const defaults = {
  watchTime: 50, explicitFeedback: 50, learningSpeed: 50,
  personalization: 75, exploration: 25, diversity: 35, popularity: 100,
}
export type Settings = typeof defaults
export type Kind = 'watch' | 'like' | 'dislike' | 'skip'
export type Interaction = {id:number; postId:string; visit:number; kind:Kind; seconds:number}
export const postById = new Map(posts.map(post => [post.id, post]))
export const neutral = ():Profile => Object.fromEntries(topics.map(t => [t, 0])) as Profile

export function learn(profile:Profile, post:Post, weight:number):Profile {
  const next = {...profile}
  next[post.topic] += weight
  if (post.related) next[post.related] += weight * .25
  return next
}
export function eventWeight(event:Interaction, settings:Settings) {
  const explicit = {like:4, dislike:-4, skip:-2}
  const signal = event.kind === 'watch'
    ? .35 * event.seconds * settings.watchTime / 50
    : explicit[event.kind] * settings.explicitFeedback / 50
  return signal * settings.learningSpeed / 50
}
export function replay(events:Interaction[], settings:Settings):Profile {
  return events.reduce((profile, event) =>
    learn(profile, postById.get(event.postId)!, eventWeight(event,settings)), neutral())
}

// Subtracting the largest logit keeps long sessions finite. Allocate the final tenths by remainder.
export function shares(profile:Profile) {
  const peak = Math.max(...Object.values(profile))
  const weights = topics.map(t => Math.exp((profile[t]-peak)/5))
  const total = weights.reduce((a,b)=>a+b,0)
  const exact = weights.map(n=>1000*n/total)
  const tenths = exact.map(Math.floor)
  const remainderOrder = topics.map((_,i)=>i).sort((a,b)=>(exact[b]-tenths[b])-(exact[a]-tenths[a]))
  for (const i of remainderOrder.slice(0,1000-tenths.reduce((a,b)=>a+b,0))) tenths[i]++
  return tenths.map(n=>n/10)
}
export type Parts = {relevance:number; popularity:number; exploration:number; diversity:number}
export type Ranked = {post:Post; parts:Parts; total:number}
export function affinity(post:Post, profile:Profile) {
  return profile[post.topic] + (post.related ? .25 * profile[post.related] : 0)
}
export function rank(profile:Profile, seen:Post[], settings:Settings):Ranked[] {
  const known = new Set(seen.map(post => post.id))
  const count = neutral()
  for (const post of seen) count[post.topic]++
  const recent = seen.slice(-3)
  return posts.filter(post => !known.has(post.id)).map(post => {
    const repeats = recent.filter(p=>p.topic===post.topic).length
    const parts:Parts = {
      relevance: affinity(post,profile) * settings.personalization / 100,
      popularity: post.discovery * settings.popularity / 100,
      exploration: settings.exploration / 100 * 2 / (1+count[post.topic]),
      diversity: -4 * repeats * settings.diversity / 100,
    }
    return {post, parts, total:Object.values(parts).reduce((sum,n)=>sum+n,0)}
  }).sort((a,b)=>b.total-a.total)
}

// Attribute the relevance term to an actual event using exactly the same tag weights as the ranker.
export function eventContribution(post:Post, event:Interaction, settings:Settings) {
  const learned = learn(neutral(),postById.get(event.postId)!,eventWeight(event,settings))
  return affinity(post,learned)*settings.personalization/100
}
