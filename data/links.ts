import type { AtlasLink } from '@/types';

/**
 * All relations of the Living Atlas.
 *
 * Links reference node ids from `data/nodes.ts`. To grow the ecology,
 * add relations here — the map redraws itself.
 */
export const atlasLinks: AtlasLink[] = [
  /* framework → territories */
  { source: 'speculative-ecology', target: 'memory' },
  { source: 'speculative-ecology', target: 'life' },
  { source: 'speculative-ecology', target: 'embodiment' },

  /* Fusion: Landscape and Beyond */
  { source: 'fusion-landscape-and-beyond', target: 'memory' },
  { source: 'fusion-landscape-and-beyond', target: 'chinese-landscape-aesthetics' },
  { source: 'fusion-landscape-and-beyond', target: 'machine-imagination' },
  { source: 'fusion-landscape-and-beyond', target: 'collective-memory' },

  /* Domy Reverie */
  { source: 'domy-reverie', target: 'memory' },
  { source: 'domy-reverie', target: 'environmental-sensing' },
  { source: 'domy-reverie', target: 'collective-memory' },

  /* Cycle to Learn */
  { source: 'cycle-to-learn', target: 'life' },
  { source: 'cycle-to-learn', target: 'ecological-time' },
  { source: 'cycle-to-learn', target: 'environmental-sensing' },

  /* Five Seasons — a memory work (Chapter 2) */
  { source: 'five-seasons', target: 'memory' },
  { source: 'five-seasons', target: 'ecological-time' },
  { source: 'five-seasons', target: 'chinese-landscape-aesthetics' },
  { source: 'five-seasons', target: 'collective-memory' },

  /* Six Seasons — a memory work (Chapter 2) */
  { source: 'six-seasons', target: 'memory' },
  { source: 'six-seasons', target: 'environmental-sensing' },
  { source: 'six-seasons', target: 'speculative-worldbuilding' },
  { source: 'six-seasons', target: 'chinese-landscape-aesthetics' },
  { source: 'six-seasons', target: 'ecological-time' },

  /* The Silhouette Seeker — a life work (Chapter 3) */
  { source: 'the-silhouette-seeker', target: 'life' },
  { source: 'the-silhouette-seeker', target: 'collective-memory' },
  { source: 'the-silhouette-seeker', target: 'speculative-worldbuilding' },
  { source: 'the-silhouette-seeker', target: 'embodied-interaction' },

  /* Speculative Fractal Intelligence — a future direction beyond the dissertation */
  { source: 'speculative-fractal-intelligence', target: 'speculative-ecology' },
  { source: 'speculative-fractal-intelligence', target: 'more-than-human' },
  { source: 'speculative-fractal-intelligence', target: 'machine-imagination' },

  /* Peeling Cycle — an embodiment work (Chapter 4) */
  { source: 'peeling-cycle', target: 'embodiment' },
  { source: 'peeling-cycle', target: 'embodied-interaction' },

  /* Learning to Move, Learning to Play, Learning to Animate */
  { source: 'learning-to-move-play-animate', target: 'embodiment' },
  { source: 'learning-to-move-play-animate', target: 'life' },
  { source: 'learning-to-move-play-animate', target: 'environmental-sensing' },
  { source: 'learning-to-move-play-animate', target: 'more-than-human' },

  /* The Department of Species Services */
  { source: 'department-of-species-services', target: 'life' },
  { source: 'department-of-species-services', target: 'more-than-human' },
  { source: 'department-of-species-services', target: 'speculative-worldbuilding' },

  /* Beyond Characters: The Unseen Labyrinth */
  { source: 'beyond-characters', target: 'embodiment' },
  { source: 'beyond-characters', target: 'embodied-interaction' },

  /* A Cyborg's Mirror / Bodies in Hyperreality */
  { source: 'a-cyborgs-mirror', target: 'embodiment' },
  { source: 'a-cyborgs-mirror', target: 'embodied-interaction' },
  { source: 'a-cyborgs-mirror', target: 'machine-imagination' },

  /* ————— Hidden connections: project ↔ project threads ————— */

  /* shared apparatus */
  {
    source: 'fusion-landscape-and-beyond',
    target: 'six-seasons',
    relation:
      'The same fine-tuned shan-shui apparatus, turned from cultural memory toward environmental memory.',
  },
  {
    source: 'six-seasons',
    target: 'domy-reverie',
    relation:
      'The satellite record as trainable memory: both fine-tune models (LoRA) on orbital imagery of a changing Earth.',
  },
  {
    source: 'six-seasons',
    target: 'a-cyborgs-mirror',
    relation:
      'A shared real-time pipeline: StreamDiffusion in TouchDesigner drives the Coda of one and the mirrors of the other.',
  },
  {
    source: 'learning-to-move-play-animate',
    target: 'a-cyborgs-mirror',
    relation:
      'Real-time diffusion on stage: in both, a performer moves inside the generative loop rather than in front of it.',
  },

  /* inheritance threads */
  {
    source: 'fusion-landscape-and-beyond',
    target: 'five-seasons',
    relation:
      'Two ways a painting tradition continues: a model that learned its grammar, and a living painter’s archive set in motion.',
  },
  {
    source: 'six-seasons',
    target: 'five-seasons',
    relation:
      'Bound by Lei Liang’s music: two compositions, one ecological way of listening.',
  },
  {
    source: 'fusion-landscape-and-beyond',
    target: 'beyond-characters',
    relation:
      'Chinese cultural sources as living material: shan-shui painting in one, fairy tales in the other.',
  },

  /* worldbuilding threads */
  {
    source: 'domy-reverie',
    target: 'the-silhouette-seeker',
    relation:
      'Co-imagination at the threshold where memory becomes worldbuilding: audiences co-generate a world others inherit.',
  },
  {
    source: 'the-silhouette-seeker',
    target: 'department-of-species-services',
    relation:
      'Worldbuilding as method: a public story-world and a speculative institution, each built to be inhabited.',
  },

  /* embodiment threads */
  {
    source: 'beyond-characters',
    target: 'the-silhouette-seeker',
    relation:
      'Gaze and gesture as ritual interfaces: the body, not the cursor, is what the system reads.',
  },
  {
    source: 'a-cyborgs-mirror',
    target: 'peeling-cycle',
    relation:
      'Visibility and its refusal: bodies under live machine interpretation, from negotiated identity to embodied refusal.',
  },

  /* collaborator and rhythm threads */
  {
    source: 'fusion-landscape-and-beyond',
    target: 'domy-reverie',
    relation:
      'A fine-tuning lineage carried forward with collaborator Zetao Yu, from painting tradition to planetary record.',
  },
  {
    source: 'learning-to-move-play-animate',
    target: 'department-of-species-services',
    relation:
      'Ecological labor and distributed agency, with collaborator Han Zhang in both teams.',
  },
  {
    source: 'cycle-to-learn',
    target: 'learning-to-move-play-animate',
    relation:
      'Learning paced by living rhythms: breath in one, growth and nutation in the other.',
  },
];
