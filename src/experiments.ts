import {defaults, eventWeight, neutral, postById, posts, rank, replay, shares, topics} from './engine.ts'
import type {Interaction, Post} from './engine.ts'

export const watchPost = postById.get('jelly')!
export const gamingPosts = posts.filter(post => post.topic === 'Gaming')

function interaction(post: Post, index: number, kind: Interaction['kind'], seconds = 0): Interaction {
  return {id: index + 1, visit: index + 1, postId: post.id, kind, seconds}
}

export function watchExperiment(seconds: number, dislike: boolean) {
  const watch = interaction(watchPost, 0, 'watch', seconds)
  const reaction = {...watch, id: 2, kind: 'dislike' as const}
  const profile = replay(dislike ? [watch, reaction] : [watch], defaults)
  return {watch: eventWeight(watch, defaults), reaction: dislike ? eventWeight(reaction, defaults) : 0,
    net: profile[watchPost.topic]}
}

function gamingProfile(count: number) {
  return replay(gamingPosts.slice(0, count).map((post, index) => interaction(post, index, 'like')), defaults)
}

export function loopExperiment(count: number) {
  const profile = gamingProfile(count)
  return {before: rank(neutral(), [], defaults).slice(0, 3), after: rank(profile, [], defaults).slice(0, 3),
    share: shares(profile)[topics.indexOf('Gaming')]}
}

export function escapeExperiment(exploration: number, diversity: number) {
  const seen = gamingPosts.slice(0, 2)
  const profile = gamingProfile(seen.length)
  const settings = {...defaults, exploration: 0, diversity: 0}
  return {before: rank(profile, seen, settings).slice(0, 3),
    after: rank(profile, seen, {...settings, exploration, diversity}).slice(0, 3)}
}
