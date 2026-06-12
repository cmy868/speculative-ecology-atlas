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
  { source: 'fusion-landscape-and-beyond', target: 'generative-ai' },
  { source: 'fusion-landscape-and-beyond', target: 'machine-imagination' },

  /* Domy Reverie */
  { source: 'domy-reverie', target: 'memory' },
  { source: 'domy-reverie', target: 'generative-ai' },
  { source: 'domy-reverie', target: 'human-ai-co-creation' },

  /* Cycle to Learn */
  { source: 'cycle-to-learn', target: 'life' },
  { source: 'cycle-to-learn', target: 'ecological-time' },
  { source: 'cycle-to-learn', target: 'human-ai-co-creation' },

  /* Five Seasons */
  { source: 'five-seasons', target: 'life' },
  { source: 'five-seasons', target: 'ecological-time' },
  { source: 'five-seasons', target: 'chinese-landscape-aesthetics' },

  /* Six Seasons */
  { source: 'six-seasons', target: 'life' },
  { source: 'six-seasons', target: 'environmental-sensing' },
  { source: 'six-seasons', target: 'speculative-worldbuilding' },

  /* The Silhouette Seeker */
  { source: 'the-silhouette-seeker', target: 'embodiment' },
  { source: 'the-silhouette-seeker', target: 'collective-memory' },
  { source: 'the-silhouette-seeker', target: 'speculative-worldbuilding' },
  { source: 'the-silhouette-seeker', target: 'embodied-interaction' },

  /* Speculative Fractal Intelligence */
  { source: 'speculative-fractal-intelligence', target: 'embodiment' },
  { source: 'speculative-fractal-intelligence', target: 'more-than-human' },
  { source: 'speculative-fractal-intelligence', target: 'machine-imagination' },

  /* Peeling Cycle */
  { source: 'peeling-cycle', target: 'memory' },
  { source: 'peeling-cycle', target: 'embodiment' },
  { source: 'peeling-cycle', target: 'human-ai-co-creation' },

  /* Learning to Move, Learning to Play, Learning to Animate */
  { source: 'learning-to-move-play-animate', target: 'embodiment' },
  { source: 'learning-to-move-play-animate', target: 'life' },
  { source: 'learning-to-move-play-animate', target: 'generative-ai' },

  /* The Department of Species Services */
  { source: 'department-of-species-services', target: 'life' },
  { source: 'department-of-species-services', target: 'more-than-human' },
  { source: 'department-of-species-services', target: 'speculative-worldbuilding' },
  { source: 'department-of-species-services', target: 'human-ai-co-creation' },

  /* Beyond Characters: The Unseen Labyrinth */
  { source: 'beyond-characters', target: 'embodiment' },
  { source: 'beyond-characters', target: 'embodied-interaction' },
  { source: 'beyond-characters', target: 'generative-ai' },

  /* A Cyborg's Mirror / Bodies in Hyperreality */
  { source: 'a-cyborgs-mirror', target: 'embodiment' },
  { source: 'a-cyborgs-mirror', target: 'embodied-interaction' },
  { source: 'a-cyborgs-mirror', target: 'human-ai-co-creation' },
  { source: 'a-cyborgs-mirror', target: 'machine-imagination' },
];
