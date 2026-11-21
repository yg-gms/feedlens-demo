import React, {useLayoutEffect, useRef, useState} from 'react'
import type {CSSProperties} from 'react'
import {art} from './art'
import {Icon} from './Icon'
import {shares, topics} from './engine'
import type {Post, Profile, Topic} from './engine'
import './live-panels.css'

function Percent({value}: {value: number}) {
  const element = useRef<HTMLElement>(null)
  const shown = useRef(value)
  useLayoutEffect(() => {
    const start = shown.current
    if (start === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = value
      if (element.current) element.current.textContent = value + '%'
      return
    }
    const since = performance.now()
    let frame = 0
    function update(now: number) {
      const t = Math.min(1, (now - since) / 450)
      shown.current = value + (start - value) * (1 - t) ** 3
      if (element.current) element.current.textContent = Math.round(shown.current * 10) / 10 + '%'
      if (t < 1) frame = requestAnimationFrame(update)
    }
    update(since)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <b ref={element} aria-hidden="true">{value}%</b>
}

const signed = new Intl.NumberFormat('en', {signDisplay: 'always', maximumSignificantDigits: 4})

// Stable anchors keep each topic recognizable as its share changes.
const anchors = [[52,46],[147,37],[246,43],[340,41],[80,131],[180,132],[276,135],[353,129]]
function Constellation({profile,percent}:{profile:Profile;percent:number[]}) {
  const [selected,setSelected] = useState<Topic>(topics[0])
  const points = anchors.map(([x,y],i)=>{
    const weight = percent[i]/100
    return {x:x+(i%2?1:-1)*5*weight,y:y-5*weight,r:10+22*Math.sqrt(weight)}
  })
  return <div className="sky">
    <svg className="star-map" viewBox="0 0 408 179" role="group" aria-label="Interest constellation">
      <g aria-hidden="true">{[[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7]].map(([a,b])=>
        <line key={a+'-'+b} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y}/>)}</g>
      {topics.map((topic,i)=>{
        const {x,y,r}=points[i]
        return <g key={topic} className={'star '+topic.toLowerCase()} role="button" tabIndex={0}
          aria-label={topic+', '+percent[i]+' percent, weight '+signed.format(profile[topic])}
          aria-pressed={topic===selected} onMouseEnter={()=>setSelected(topic)} onClick={()=>setSelected(topic)}
          onFocus={()=>setSelected(topic)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(topic)}}}
          style={{transform:'translate('+x+'px,'+y+'px)'}}>
          <circle className="star-ring" r={r+3.5}/><circle className="star-body" r={r}/>
          <g transform="translate(-9 -9)"><Icon name={topic.toLowerCase()} size={18}/></g>
          <text y={r+16} textAnchor="middle">{topic}</text>
        </g>
      })}
    </svg>
    <div className={'star-detail '+selected.toLowerCase()}><i/>{selected}<b>{percent[topics.indexOf(selected)]}% share</b><span>Weight {signed.format(profile[selected])}</span></div>
  </div>
}

export function InterestProfile({profile, note, revision, signalTopics}: {
  profile: Profile; note: string; revision: number; signalTopics: Topic[]
}) {
  const [view,setView] = useState<'bars'|'stars'>('stars')
  const [history, setHistory] = useState({revision, current: profile, previous: profile})
  if (history.revision !== revision) {
    setHistory({revision, current: profile, previous: history.current})
  }
  const percent = shares(profile)
  const before = shares(history.previous)
  const rows = topics.map((topic, i) => ({topic, i})).sort((a, b) => profile[b.topic] - profile[a.topic])
  return <section className="panel insights interest-profile" aria-labelledby="profile-heading">
    <div className="panel-heading">
      <h2 id="profile-heading"><span className="heading-icon mint"><Icon name="signal"/></span>Interest profile</h2>
      <span className="live"><i/>Live</span>
    </div>
    <p className="sub">What the algorithm thinks you like.</p>
    <div className="view-switch" role="group" aria-label="Interest visualization">
      <button aria-pressed={view==='stars'} onClick={()=>setView('stars')}><Icon name="spark" size={14}/>Constellation</button>
      <button aria-pressed={view==='bars'} onClick={()=>setView('bars')}><Icon name="signal" size={14}/>Bar view</button>
    </div>
    {view==='stars'?<Constellation profile={profile} percent={percent}/>:<ol className="interest-bars" style={{'--topics': rows.length} as CSSProperties}>
      {rows.map(({topic, i}, position) => {
        const shareChange = Math.round((percent[i] - before[i]) * 10) / 10
        const weightChange = profile[topic] - history.previous[topic]
        const touched = revision > 0 && signalTopics.includes(topic) && weightChange !== 0
        return <li className={'interest-row ' + topic.toLowerCase()} key={topic}
          style={{'--rank': position} as CSSProperties}>
          <span className="topic-label"><Icon name={topic.toLowerCase()} size={16}/>{topic}</span>
          <span className="interest-meter" role="meter" aria-label={topic + ' interest share'}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent[i]} aria-valuetext={percent[i] + '%'}>
            <span className="track"><i style={{width: percent[i] + '%'}}/></span>
            {touched && <React.Fragment key={revision}>
              <i className="interest-pulse" aria-hidden="true"/>
              <small className={'interest-delta ' + ((shareChange || weightChange) < 0 ? 'loss' : '')} aria-hidden="true">
                {signed.format(shareChange || weightChange)}{shareChange ? ' pp' : ' weight'}
              </small>
            </React.Fragment>}
          </span>
          <Percent value={percent[i]}/>
        </li>
      })}
    </ol>}
    <div className={'signal-note ' + (revision > 0 ? 'has-signal' : 'neutral-signal')} role="status" aria-atomic="true">
      <span className="signal-content" key={revision}><Icon name="wave" size={19}/>{note}</span>
    </div>
  </section>
}

export function NextQueue({queue, onInspect}: {queue: Post[]; onInspect: (post: Post) => void}) {
  const ids = queue.map(post => post.id)
  const [ranks, setRanks] = useState({current: ids, previous: ids})
  if (ids.length !== ranks.current.length || ids.some((id, i) => id !== ranks.current[i])) {
    setRanks({current: ids, previous: ids.length > ranks.current.length ? ids : ranks.current})
  }
  return <section className="queue live-queue" aria-labelledby="queue-heading">
    <div className="queue-heading">
      <h2 id="queue-heading"><Icon name="queue" size={21}/>Up next</h2><span>Ranked for you</span>
    </div>
    {queue.length ? <ol>{queue.slice(0, 3).map((post, i) => {
      const oldRank = ranks.previous.indexOf(post.id) + 1
      const rank = i + 1
      const moved = oldRank > 0 && oldRank !== rank
      const movement = moved ? (oldRank > rank ? 'rising' : 'falling') : ''
      return <li key={post.id} style={{'--rank': i} as CSSProperties}>
        <button type="button" className="queue-card" onClick={() => onInspect(post)}
          aria-label={'Inspect ' + post.title + ', ' + post.topic + ', ranked ' + rank + (moved ? ', previously ' + oldRank : '')}>
          <span className="queue-cover"><img src={art(post)} alt=""/>
            <span className={'queue-rank ' + movement} key={oldRank + '-' + rank}>
              {moved && <>#{oldRank} → </>}#{rank}
            </span>
          </span>
          <span className="queue-details"><span className="queue-topic">{post.topic}</span><strong>{post.title}</strong></span>
        </button>
      </li>
    })}</ol> : <p>You’ve reached the last post in this session.</p>}
  </section>
}
