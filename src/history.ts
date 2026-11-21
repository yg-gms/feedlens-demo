import {rank, replay} from './engine.ts'
import type {Interaction} from './engine.ts'
import type {Session} from './session.ts'

type Snapshot = Pick<Session, 'events' | 'settings' | 'seen'>
export type Edit = 'remove' | 'like' | 'dislike' | number
export function forkHistory({events, settings, seen}: Snapshot, event: Interaction, edit: Edit) {
  const alternative = edit === 'remove' ? events.filter(e => e.id !== event.id) : events.map(e =>
    e.id !== event.id ? e : typeof edit === 'number' ? {...e, seconds:edit} : {...e, kind:edit})
  return {events, settings, seen, alternative, origin:event.id, edit}
}
export type Branch = ReturnType<typeof forkHistory>
export function readHistory({settings, seen}: Snapshot, events: Interaction[]) {
  const profile = replay(events, settings)
  return {profile, ranking:rank(profile, seen, settings)}
}
