import React, {useState} from 'react'
import {postById} from './engine'
import type {Ranked, Settings} from './engine'
import {watchPost, gamingPosts, watchExperiment, loopExperiment, escapeExperiment} from './experiments'
import {art} from './art'
import {Icon} from './Icon'
import './lab.css'

const groups: {name: string; controls: [keyof Settings, string, string][]}[] = [
  {name: 'Learning', controls: [
    ['watchTime', 'Watch time', 'Give each second watched more weight.'],
    ['explicitFeedback', 'Explicit feedback', 'Give likes, dislikes and quick skips more weight.'],
    ['learningSpeed', 'Learning speed', 'Make each interaction change your interests more.'],
  ]},
  {name: 'Ranking', controls: [
    ['personalization', 'Personalization', 'Favor posts that match your learned interests.'],
    ['exploration', 'Exploration', 'Boost topics shown less often this round.'],
    ['diversity', 'Content diversity', 'Lower the rank of topics in your last three posts.'],
    ['popularity', 'Popularity', 'Give popular posts a higher starting score.'],
  ]},
]

type ControlsProps = {settings: Settings; onChange: (key: keyof Settings, value: number) => void}

function Slider({id, label, value, max = 100, unit = '%', hint, onChange}: {
  id: string; label: string; value: number; max?: number; unit?: string; hint?: string; onChange: (value: number) => void
}) {
  return <div className="setting"><div><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}{unit}</output></div>
    <input id={id} type="range" min="0" max={max} value={value} aria-valuetext={value + unit}
      aria-describedby={hint ? id + '-hint' : undefined} style={{'--fill': value / max * 100 + '%'} as React.CSSProperties}
      onChange={e => onChange(e.currentTarget.valueAsNumber)}/>
    {hint && <small id={id + '-hint'}>{hint}</small>}
  </div>
}

const experiments = [
  {title: 'Does watching mean liking?', image: watchPost, icon: 'eye', question: 'You watch a science clip and tap Dislike. Which way will your science interest move?', choices: ['Down', 'No change', 'Up']},
  {title: 'The Feedback Loop', image: gamingPosts[0], icon: 'reset', question: 'After you like gaming posts, how many of the top three picks in a fresh round will be gaming?', choices: ['None', 'One', 'Two', 'Three']},
  {title: 'Escape Your Feed', image: postById.get('plant')!, icon: 'spark', question: 'You liked two gaming posts in a row. Can another topic take the top spot when you change the ranking settings?', choices: ['Gaming stays first', 'Another topic wins']},
]
const signed = new Intl.NumberFormat('en', {signDisplay: 'exceptZero', maximumFractionDigits: 2})
const formatPoints = (n: number) => signed.format(n)

function Ranking({label, rows}: {label: string; rows: Ranked[]}) {
  return <div className="lab-ranking"><strong>{label}</strong><ol>{rows.map(({post}) =>
    <li key={post.id} className={post.topic.toLowerCase()}><Icon name={post.topic.toLowerCase()} size={15}/>
      <span>{post.topic}<small>{post.title}</small></span></li>)}</ol></div>
}

function Experiment({index}: {index: number}) {
  const experiment = experiments[index]
  const [prediction, predict] = useState<number | null>(null)
  const [revealed, reveal] = useState(false)
  const [seconds, setSeconds] = useState(8)
  const [dislike, setDislike] = useState(true)
  const [likes, setLikes] = useState(2)
  const [exploration, setExploration] = useState(50)
  const [diversity, setDiversity] = useState(75)
  let controls: React.ReactNode, result: React.ReactNode, outcome: number
  if (index === 0) {
    const data = watchExperiment(seconds, dislike)
    outcome = Math.sign(data.net) + 1
    controls = <><Slider id="sandbox-watch" label="Time watched" value={seconds} max={watchPost.duration} unit="s" onChange={setSeconds}/>
      <label className="lab-check"><input type="checkbox" checked={dislike} onChange={e => setDislike(e.target.checked)}/> Tap Dislike after watching</label></>
    result = <><div className="lab-equation">{[['Watch', data.watch], ['Dislike', data.reaction], ['Science interest', data.net]].map(([label, value]) =>
      <div key={label}><small>{label}</small><b>{formatPoints(Number(value))}</b></div>)}</div>
      <p>{data.net > 0 ? 'The model reads time spent watching as interest.' : data.net < 0 ? 'The dislike outweighs the time spent watching.' : 'These inputs leave science interest unchanged.'} Try dragging the watch time to see when the result changes.</p></>
  } else if (index === 1) {
    const data = loopExperiment(likes)
    outcome = data.after.filter(row => row.post.topic === 'Gaming').length
    controls = <Slider id="sandbox-likes" label="Gaming posts liked" max={gamingPosts.length} unit="" value={likes} onChange={setLikes}/>
    result = <><div className="lab-rank-pair"><Ranking label="Before any likes" rows={data.before}/><Ranking label={'After ' + likes + (likes === 1 ? ' like' : ' likes')} rows={data.after}/></div>
      <p>Gaming holds {data.share}% of learned interest. {outcome} of the next three picks match it. Each gaming like makes matching posts score higher in the new round.</p></>
  } else {
    const data = escapeExperiment(exploration, diversity)
    outcome = Number(data.after[0].post.topic !== 'Gaming')
    controls = <><Slider id="sandbox-explore" label="Exploration" value={exploration} onChange={setExploration}/>
      <Slider id="sandbox-diversity" label="Content diversity" value={diversity} onChange={setDiversity}/></>
    result = <><div className="lab-rank-pair"><Ranking label="Both controls at 0%" rows={data.before}/><Ranking label="Your settings" rows={data.after}/></div>
      <p>{data.after[0].post.title} takes first place. Exploration boosts topics seen less often. Diversity deducts points from recently seen topics, including Gaming.</p></>
  }
  return <article className="lab-experiment panel">
    <header><img src={art(experiment.image)} alt=""/><div><span className="lab-scope">Isolated sandbox</span><h2>{experiment.title}</h2></div></header>
    <div className="lab-steps">
      <section><h3>Predict</h3><p>{experiment.question}</p>
        <div className="lab-choices" role="group" aria-label="Your prediction">{experiment.choices.map((choice, i) =>
          <button key={choice} aria-pressed={prediction === i} onClick={() => {predict(i); reveal(false)}}>{choice}</button>)}</div></section>
      <fieldset disabled={prediction === null}><legend>Experiment</legend>{controls}</fieldset>
      <section><button className="lab-reveal" disabled={prediction === null} onClick={() => reveal(true)}><Icon name="scan" size={16}/> Reveal outcome</button>
        {revealed && <div role="status" className="lab-outcome"><h4>{prediction === outcome ? 'Prediction matched' : 'Prediction differed'} · {experiment.choices[outcome]}</h4>{result}</div>}</section>
    </div>
  </article>
}

export function Lab({settings, onChange}: ControlsProps) {
  const [selected, select] = useState(0)
  return <div className="lab-layout">
    <div><div className="lab-picker" role="group" aria-label="Choose an experiment">{experiments.map((exp,i) =>
      <button key={exp.title} aria-pressed={selected === i} onClick={() => select(i)}><Icon name={exp.icon} size={17}/>{exp.title}</button>)}</div>
      {experiments.map((exp,i) => <div key={exp.title} hidden={selected !== i}><Experiment index={i}/></div>)}
    </div>
    <FeedControls settings={settings} onChange={onChange} scope="lab"/>
  </div>
}

export function FeedControls({settings,onChange,scope}: ControlsProps & {scope:string}) {
  return <div className="panel lens-lab"><h2><span className="heading-icon peach"><Icon name="sliders" size={18}/></span>Live feed controls</h2>
      <p>Learning controls change how actions shape your interests. Ranking controls reorder upcoming posts.</p>
      <div className="lens-groups">{groups.map(group => <fieldset key={group.name}><legend>{group.name}</legend>
        {group.controls.map(([key, label, hint]) => <Slider key={key} id={scope + '-' + key} label={label} hint={hint} value={settings[key]} onChange={value => onChange(key,value)}/>)}
      </fieldset>)}</div>
    </div>
}
