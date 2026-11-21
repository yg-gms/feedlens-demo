import React, {useState} from 'react'
import {postById, replay, topics} from './engine'
import type {Interaction} from './engine'
import type {Session} from './session'
import {forkHistory, readHistory} from './history'
import type {Branch, Edit} from './history'
import {Icon} from './Icon'
import './time-machine.css'

const names = {watch:'Watched', like:'Liked', dislike:'Disliked', skip:'Skipped'}
const icons = {watch:'clock', like:'heart', dislike:'dislike', skip:'skip'}
const points = new Intl.NumberFormat('en', {maximumFractionDigits:4})
const label = (event:Interaction) => event.kind === 'watch' ? 'Watched '+event.seconds+'s' : names[event.kind]
const changeName = (edit:Edit) => typeof edit === 'number' ? 'Watched '+edit+'s' :
  edit === 'remove' ? 'Event removed' : names[edit]

function Comparison({branch, number}:{branch:Branch; number:number}) {
  const original = readHistory(branch, branch.events)
  const alternative = readHistory(branch, branch.alternative)
  const rows = alternative.ranking.map((entry, i) => {
    const before = original.ranking.findIndex(row => row.post.id === entry.post.id)
    const oldScore = original.ranking[before].total
    return <tr key={entry.post.id} className={before !== i || oldScore !== entry.total ? 'tm-changed' : ''}>
      <th scope="row">{entry.post.title}</th><td>{before+1} → {i+1}</td><td>{points.format(oldScore)} → {points.format(entry.total)}</td>
    </tr>
  })
  return <section className="panel tm-compare" aria-label={'Branch '+number+' comparison'}>
    <h2><span className="heading-icon lilac"><Icon name="signal"/></span>Branch {number} replay</h2>
    <p>The model replays both histories with the same posts and settings. Later actions stay as recorded, so the comparison shows how the model interprets your edit.</p>
    <div className="tm-results">
      <div><h3>Interest points</h3><table><thead><tr><th>Topic</th><th>Original</th><th>Branch</th></tr></thead>
        <tbody>{topics.map(topic => <tr key={topic} className={original.profile[topic] !== alternative.profile[topic] ? 'tm-changed' : ''}>
          <th scope="row">{topic}</th><td>{points.format(original.profile[topic])}</td><td>{points.format(alternative.profile[topic])}</td></tr>)}</tbody></table></div>
      <div><h3>Next recommendations</h3>{rows.length ? <><table><thead><tr><th>Post</th><th>Rank</th><th>Score</th></tr></thead><tbody>{rows.slice(0,5)}</tbody></table>
        {rows.length>5 && <details><summary>Show {rows.length-5} more candidates</summary><table aria-label="Remaining candidates"><thead><tr><th>Post</th><th>Rank</th><th>Score</th></tr></thead><tbody>{rows.slice(5)}</tbody></table></details>}
        <small>Original → branch. Shading marks a changed rank or score.</small></> : <p>All posts had been seen in this round.</p>}</div>
    </div>
  </section>
}
function Editor({event, events, settings, onSave}:{event:Interaction; events:Interaction[]; settings:Session['settings']; onSave:(edit:Edit)=>void}) {
  const post = postById.get(event.postId)!
  const otherSeconds = events.reduce((sum,e)=>sum+(e.visit===event.visit && e.kind==='watch' && e.id!==event.id ? e.seconds : 0),0)
  const maxSeconds = post.duration-otherSeconds
  const learned = replay([event],settings)
  const [edit,setEdit] = useState<Edit>('remove')
  return <div className="tm-inspector">
    <h3>{post.title}</h3><p>{label(event)} · {post.topic}</p>
    <div className="tm-effects">{[post.topic,...(post.related?[post.related]:[])].map(topic=>
      <span key={topic}>{topic} <b>{learned[topic]>0?'+':''}{points.format(learned[topic])} pts</b></span>)}</div>
    <label>Alternate action<select value={typeof edit === 'number'?'watch':edit} onChange={e=>setEdit(e.target.value==='watch' ? (event.seconds===1 ? 2 : 1) : e.target.value as Edit)}>
      <option value="remove">Remove this event</option>
      {event.kind==='watch' ? <option value="watch" disabled={maxSeconds===1}>Change watch duration</option> :
        (['like','dislike'] as const).filter(kind=>kind!==event.kind).map(kind=><option key={kind} value={kind}>{names[kind]} instead</option>)}
    </select></label>
    {typeof edit==='number' && <label>Watch duration · {edit}s<input type="range" min="1" max={maxSeconds} value={edit} onChange={e=>setEdit(e.target.valueAsNumber)}/></label>}
    <button className="tm-save" disabled={typeof edit==='number' && edit===event.seconds} onClick={()=>onSave(edit)}>Save alternate branch</button>
  </div>
}

export function TimeMachine({session}:{session:Session}) {
  const [branches,setBranches] = useState<Branch[]>([])
  const [active,setActive] = useState<number|null>(null)
  const [selected,setSelected] = useState<number|null>(null)
  const branch = active===null ? undefined : branches[active]
  const snapshot = branch ?? session
  const event = snapshot.events.find(e=>e.id===selected) ?? snapshot.events.at(-1)
  const activate = (index:number) => {setActive(index); setSelected(branches[index].origin)}
  return <div className="tm">
    <section className="panel tm-studio"><div className="tm-head"><h2><span className="heading-icon lilac"><Icon name="clock"/></span>Interaction timeline</h2>
      <span className="counter">{snapshot.events.length} {snapshot.events.length===1?'event':'events'}</span></div>
      <div className="tm-scenarios"><button aria-pressed={active===null} onClick={()=>{setActive(null);setSelected(null)}}>Live history</button>
        {branches.map((_,i)=><button key={i} aria-pressed={active===i} onClick={()=>activate(i)}>Branch {i+1}</button>)}</div>
      {event ? <div className="tm-workspace"><div>
        <p>{branch ? 'Original history at the moment this branch was saved.' : 'Select an action to inspect its effect or try a different history.'}</p>
        <ol className="tm-track">{snapshot.events.map((e,i)=>{
          const post = postById.get(e.postId)!
          return <li key={e.id}><button className="tm-event" onClick={()=>setSelected(e.id)} aria-pressed={event.id===e.id}>
            <span className={'tm-node '+post.topic.toLowerCase()}><Icon name={icons[e.kind]} size={15}/></span>
            <span><b>{label(e)}</b> · {post.title}</span><small>#{i+1}</small></button>
            {branches.map((b,n)=>(branch ? b===branch : true) && b.origin===e.id && <button className="tm-fork" key={n} onClick={()=>activate(n)}>Branch {n+1} · {changeName(b.edit)}</button>)}
          </li>
        })}</ol></div>
        <Editor key={(active??'live')+'-'+event.id} event={event} events={snapshot.events} settings={snapshot.settings} onSave={edit=>{
          const saved = forkHistory(snapshot,event,edit)
          setBranches([...branches,saved]);setActive(branches.length);setSelected(event.id)
        }}/></div> : <div className="tm-empty"><span className="tm-empty-icon"><Icon name="clock" size={30}/></span><h3>Your timeline starts with one action</h3><p>Watch, like, dislike or quickly skip a post in Your Feed. Then come back to see what that action taught the model.</p></div>}
    </section>
    {branch && active!==null && <Comparison key={active} branch={branch} number={active+1}/>}
  </div>
}
