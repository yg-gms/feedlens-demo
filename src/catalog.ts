export const topics = ['Gaming', 'Music', 'Sports', 'Tech', 'Food', 'Science', 'Lifestyle', 'Entertainment'] as const
export type Topic = typeof topics[number]
export type Post = {
  id: string; title: string; creator: string; topic: Topic; related?: Topic;
  duration: number; discovery: number
}

export const posts: Post[] = [
  { id: 'pocket', title: 'Pocket-sized nostalgia', creator: 'pixelpocket', topic: 'Gaming', related: 'Tech', duration: 12, discovery: 1 },
  { id: 'synth', title: 'Midnight synth session', creator: 'loop.room', topic: 'Music', related: 'Tech', duration: 15, discovery: .94 },
  { id: 'skate', title: 'One more kickflip', creator: 'curbside', topic: 'Sports', duration: 10, discovery: .85 },
  { id: 'ramen', title: 'The perfect ramen egg', creator: 'noodle.club', topic: 'Food', duration: 14, discovery: .80 },
  { id: 'robot', title: 'Tiny robot, first steps', creator: 'bench.bot', topic: 'Tech', duration: 12, discovery: .73 },
  { id: 'arcade', title: 'One last arcade lap', creator: 'after.arcade', topic: 'Gaming', related: 'Sports', duration: 11, discovery: .66 },
  { id: 'vinyl', title: 'From the record crate', creator: 'waxtracks', topic: 'Music', duration: 15, discovery: .60 },
  { id: 'hoops', title: 'Nothing but net', creator: 'court.notes', topic: 'Sports', duration: 10, discovery: .53 },
  { id: 'sandwich', title: 'Strawberry sando break', creator: 'little.diner', topic: 'Food', duration: 12, discovery: .47 },
  { id: 'tiles', title: 'A dungeon in sixteen tiles', creator: 'tilemage', topic: 'Gaming', related: 'Entertainment', duration: 14, discovery: .62 },
  { id: 'dice', title: 'Rolling for initiative', creator: 'table.roll', topic: 'Gaming', duration: 10, discovery: .41 },
  { id: 'trumpet', title: 'Brass at the blue hour', creator: 'blue.hour', topic: 'Music', duration: 16, discovery: .69 },
  { id: 'cassette', title: 'The two-sided mixtape', creator: 'tape.deck', topic: 'Music', related: 'Lifestyle', duration: 12, discovery: .46 },
  { id: 'climb', title: 'Finding the last hold', creator: 'chalkbag', topic: 'Sports', duration: 12, discovery: .58 },
  { id: 'rally', title: 'A rally in slow motion', creator: 'rally.cam', topic: 'Sports', duration: 11, discovery: .38 },
  { id: 'camera', title: 'Inside a pocket camera', creator: 'glassworks', topic: 'Tech', related: 'Lifestyle', duration: 14, discovery: .76 },
  { id: 'keyboard', title: 'Building a tiny keyboard', creator: 'click.clack', topic: 'Tech', related: 'Gaming', duration: 13, discovery: .55 },
  { id: 'satellite', title: 'Catching a satellite pass', creator: 'orbit.radio', topic: 'Tech', related: 'Science', duration: 15, discovery: .44 },
  { id: 'citrus', title: 'A pitcher of pink lemonade', creator: 'citrusstand', topic: 'Food', duration: 10, discovery: .65 },
  { id: 'dumpling', title: 'Folding a crescent dumpling', creator: 'steam.table', topic: 'Food', duration: 13, discovery: .42 },
  { id: 'eclipse', title: 'The moment the corona appears', creator: 'umbra.club', topic: 'Science', duration: 12, discovery: .88 },
  { id: 'fossil', title: 'Reading a spiral fossil', creator: 'strata.notes', topic: 'Science', duration: 15, discovery: .67 },
  { id: 'prism', title: 'Splitting a beam of light', creator: 'lightbench', topic: 'Science', related: 'Tech', duration: 11, discovery: .51 },
  { id: 'jelly', title: 'Drifting with moon jellies', creator: 'tidal.pool', topic: 'Science', duration: 16, discovery: .37 },
  { id: 'plant', title: 'A cutting grows roots', creator: 'sill.garden', topic: 'Lifestyle', related: 'Science', duration: 14, discovery: .79 },
  { id: 'pottery', title: 'One spin on the pottery wheel', creator: 'clay.days', topic: 'Lifestyle', duration: 15, discovery: .63 },
  { id: 'journal', title: 'Sketches from the train ride', creator: 'window.seat', topic: 'Lifestyle', duration: 13, discovery: .49 },
  { id: 'sewing', title: 'A second life for a denim patch', creator: 'mend.club', topic: 'Lifestyle', duration: 12, discovery: .35 },
  { id: 'cinema', title: 'Behind the projector beam', creator: 'reel.change', topic: 'Entertainment', related: 'Tech', duration: 14, discovery: .83 },
  { id: 'magic', title: 'The vanishing ace', creator: 'closeup.club', topic: 'Entertainment', duration: 10, discovery: .71 },
  { id: 'puppet', title: 'Shadow puppets after dark', creator: 'paper.stage', topic: 'Entertainment', duration: 13, discovery: .54 },
  { id: 'flipbook', title: 'A whale in the margins', creator: 'page.turn', topic: 'Entertainment', related: 'Lifestyle', duration: 12, discovery: .39 },
]
