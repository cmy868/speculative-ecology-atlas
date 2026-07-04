import type { AtlasNode } from '@/types';

/**
 * All nodes of the Living Atlas.
 *
 * To grow the ecology, add a node here (and its relations in `data/links.ts`).
 * The interface — map, panel, colors, layout — adapts automatically.
 */
export const atlasNodes: AtlasNode[] = [
  /* ————————————————————— Center ————————————————————— */
  {
    id: 'speculative-ecology',
    type: 'center',
    title: 'Speculative Ecology in the Age of Generative AI',
    description:
      'The dissertation’s central framework: a transdisciplinary merging of ecological thought, speculative philosophy, and artistic practice for understanding the emerging assemblages of humans, machines, and environments. Within it, generative AI is treated not as a tool but as an Emergent Repository — a latent reservoir of cultural, visual, and sonic patterns — worked by the human artist as an Agent of Emergence through an iterative loop of Duo-Intelligence.',
    chapter: 'Introduction & Chapter 1 — Toward a Speculative Ecology',
  },

  /* ————————————————————— Territories ————————————————————— */
  {
    id: 'memory',
    type: 'territory',
    title: 'Memory',
    description:
      'The first territory of the ecology: how landscapes, archives, and cultural memory are inherited, reconstructed, and re-imagined through generative models. Machine memory appears here as a culturally biased act of reconstruction rather than neutral recall.',
    chapter: 'Chapter 2 — Ecologies of Memory: Landscape, Archives, and Generative Imagination',
  },
  {
    id: 'life',
    type: 'territory',
    title: 'Life',
    description:
      'The second territory: more-than-human intelligence, seasonal and ecological rhythm, and the speculative worlds in which machinic and biological life entangle. Here training cycles meet breath, ice melt, and growth.',
    chapter: 'Chapter 3 — Ecologies of Life: More-than-Human Intelligence and Speculative Worlds',
  },
  {
    id: 'embodiment',
    type: 'territory',
    title: 'Embodiment',
    description:
      'The third territory: perception, identity, and the body within human-AI relations — from gestural co-presence to the politics of machine misrecognition.',
    chapter: 'Chapter 4 — Ecologies of Embodiment: Perception, Identity, and Human-AI Relations',
  },

  /* ————————————————————— Projects ————————————————————— */
  {
    id: 'fusion-landscape-and-beyond',
    type: 'project',
    title: 'Fusion: Landscape and Beyond',
    year: '2022–2024',
    description:
      'Fine-tuned generative models on shan-shui landscape painting, treating AI memory as a culturally biased reconstruction: the machine remembers a tradition it never lived, and its errors become a way of seeing how cultural memory is encoded, lost, and re-imagined.',
    chapter: 'Chapter 2 — Ecologies of Memory',
    tags: ['generative video', 'shan-shui', 'fine-tuning', 'cultural archives'],
    media: '/media/fusion-landscape-and-beyond.jpg',
    link: 'https://www.mingyongcheng.com/projects/fusion-landscape-and-beyond',
  },
  {
    id: 'domy-reverie',
    type: 'project',
    title: 'Domy Reverie',
    year: '2023',
    description:
      'Two orbiting domes pair a 38-year satellite archive with an AI-generated counterpart, suspended above an interactive floor where viewers co-generate the synthetic terrain beneath their feet — remembered Earth and dreamed Earth in slow rotation.',
    chapter: 'Chapter 2 — Ecologies of Memory (coda)',
    tags: ['installation', 'satellite imagery', 'interactive floor', 'co-generation'],
    media: '/media/domy-reverie.jpg',
    link: 'https://www.mingyongcheng.com/projects/domy-reverie',
  },
  {
    id: 'cycle-to-learn',
    type: 'project',
    title: 'Cycle to Learn',
    year: '2024',
    description:
      'A breath-driven interactive installation linking AI training cycles to human respiration, so that the rhythm of learning machines is paced by living lungs — an exercise in giving computation an ecological tempo.',
    tags: ['interactive installation', 'breath interface', 'training cycles'],
    media: '/media/cycle-to-learn.jpg',
    link: 'https://www.mingyongcheng.com/projects/cycle-to-learn',
  },
  {
    id: 'five-seasons',
    type: 'project',
    title: 'Five Seasons',
    year: '2025',
    description:
      'Charles Chang-Han Liu’s painting archive animated through image-to-video generation and set to Lei Liang’s score — an experiment in generative inheritance, in which a painter’s lifetime of seeing is extended by a machine that learned from it.',
    chapter: 'Chapter 2 — Ecologies of Memory',
    tags: ['image-to-video', 'painting archive', 'music collaboration', 'inheritance'],
    media: '/media/five-seasons.jpg',
    /* Project page on mingyongcheng.com is password-protected, so link to the works index. */
    link: 'https://www.mingyongcheng.com/works',
  },
  {
    id: 'six-seasons',
    type: 'project',
    title: 'Six Seasons',
    year: '2024',
    description:
      'Six LoRA models trained on NASA Arctic imagery and shan-shui painting generate audio-reactive visuals for Lei Liang and Joshua Jones’s hydrophone composition — a melting seascape heard from below and re-imagined from above.',
    chapter: 'Chapter 2 — Ecologies of Memory',
    tags: ['LoRA', 'Arctic imagery', 'audio-reactive', 'hydrophone recordings'],
    media: '/media/six-seasons.jpg',
    link: 'https://www.mingyongcheng.com/projects/visual-interpretation-for-six-seasons',
  },
  {
    id: 'the-silhouette-seeker',
    type: 'project',
    title: 'The Silhouette Seeker',
    year: '2026',
    description:
      'Hand shadows conjure creatures into a collectively remembered story-world: a camera reads each visitor’s gesture against a codex of silhouettes, an adaptive narrative engine weaves the creature into an evolving world, and completed journeys persist as fog points in a shared collective memory. Life emerges as a participatory act of gesture, interpretation, and memory. Premiered at the IEEE CVPR AI Art Gallery, 2026.',
    chapter: 'Chapter 3 — Ecologies of Life',
    tags: ['shadow play', 'gesture', 'collective storytelling', 'real-time generation'],
    media: [
      '/media/the-silhouette-seeker.jpg',
      '/media/the-silhouette-seeker-grimoire.jpg',
    ],
    link: 'https://www.mingyongcheng.com/projects/the-silhouette-seeker',
  },
  {
    id: 'speculative-fractal-intelligence',
    type: 'project',
    title: 'Speculative Fractal Intelligence',
    year: 'Ongoing',
    description:
      'An ongoing speculative exploration of fractal, more-than-human intelligence — asking what cognition looks like when it branches like coastlines and root systems rather than flowing through commands.',
    tags: ['speculative research', 'fractals', 'more-than-human cognition'],
    media: '/media/speculative-fractal-intelligence.jpg',
    /* No individual project page on mingyongcheng.com yet, so link to the works index. */
    link: 'https://www.mingyongcheng.com/works',
  },
  {
    id: 'peeling-cycle',
    type: 'project',
    title: 'Peeling Cycle',
    year: '2026',
    description:
      'A collaborative live audiovisual performance by AHM (Anqi Liu, Han Zhang, Mingyong Cheng) on gendered visibility and machine misrecognition — what the camera insists on seeing, and what bodies do to be seen otherwise.',
    chapter: 'Chapter 4 — Ecologies of Embodiment',
    tags: ['live performance', 'audiovisual', 'machine vision', 'gender'],
    media: '/media/peeling-cycle.jpg',
    /* No individual project page on mingyongcheng.com yet, so link to the works index. */
    link: 'https://www.mingyongcheng.com/works',
  },
  {
    id: 'learning-to-move-play-animate',
    type: 'project',
    title: 'Learning to Move, Learning to Play, Learning to Animate',
    year: '2024–2025',
    description:
      'A performance with found-material robots, plant biofeedback, and real-time generative visuals, in which human performers, machines, and plants learn from one another on stage. Recipient of the IEEE TCPAMI Artist Award.',
    chapter: 'Chapter 3 — Ecologies of Life',
    tags: ['performance', 'robotics', 'plant biofeedback', 'real-time visuals'],
    media: '/media/learning-to-move-play-animate.jpg',
    link: 'https://www.mingyongcheng.com/projects/learning-to-move-learning-to-play-learning-to-animate',
  },
  {
    id: 'department-of-species-services',
    type: 'project',
    title: 'The Department of Species Services',
    year: '2026',
    description:
      'A collaborative project led by Shihan Zhang, with Mingyong Cheng as new media artist and creative technologist. A speculative institution — an AI-managed ecological commons trust — reassigns human labor to ecological care: after a pollinator collapse, visitors become Human Pollination Technicians, hand-pollinating poppies with a bee-leg-inspired P-Glove. Ecological labor becomes speculative institution. Exhibited at Gray Area, San Francisco, 2026.',
    chapter: 'Chapter 3 — Ecologies of Life',
    tags: ['speculative institution', 'ecological labor', 'collaboration', 'installation'],
    media: '/media/department-of-species-services.jpg',
    /* No individual project page on mingyongcheng.com yet, so link to the works index. */
    link: 'https://www.mingyongcheng.com/works',
  },
  {
    id: 'beyond-characters',
    type: 'project',
    title: 'Beyond Characters: The Unseen Labyrinth',
    year: '2023–2024',
    description:
      'Gaze tracking and generative AI transform Chinese fairy tales into a labyrinth that simulates dyslexic reading: as the viewer looks, text morphs from clarity into a visual maze. Perception is shown to be embodied, unstable, and technically mediated. CVPR AI Art Gallery; Gold Medal, Muse Design Awards.',
    chapter: 'Chapter 4 — Ecologies of Embodiment',
    tags: ['gaze tracking', 'neurodiversity', 'dyslexia', 'interactive narrative'],
    media: '/media/beyond-characters.jpg',
    link: 'https://www.mingyongcheng.com/projects/beyond-characters',
  },
  {
    id: 'a-cyborgs-mirror',
    type: 'project',
    title: "A Cyborg's Mirror / Bodies in Hyperreality",
    year: '2024–',
    description:
      'A live performance system created with Katherine Helen Fisher (Safety Third Productions / Hyperreal Lab): audience prompts drive a real-time diffusion pipeline that continuously rewrites the performer’s body across two virtual mirrors. Algorithmic identity emerges as a live negotiation among performer, audience, and machine. Presented at Jacob’s Pillow, Human Resources LA, NYU Future Stages, and beyond.',
    chapter: 'Chapter 4 — Ecologies of Embodiment',
    tags: ['live performance', 'StreamDiffusion', 'cyborg feminism', 'audience prompts'],
    media: '/media/a-cyborgs-mirror.jpg',
    link: 'https://www.mingyongcheng.com/projects/a-cyborgs-mirror-bodies-in-hyperreality',
  },

  /* ————————————————————— Concepts ————————————————————— */
  {
    id: 'generative-ai',
    type: 'concept',
    title: 'Generative AI',
    description:
      'Machine learning systems that synthesize new images, sounds, and texts from learned distributions. Within speculative ecology they are approached not as tools but as Emergent Repositories — latent reservoirs of cultural pattern that the artist works as an Agent of Emergence.',
    citation:
      'Rombach et al. (2022), “High-Resolution Image Synthesis with Latent Diffusion Models”; Boden & Edmonds (2019), From Fingers to Digits; McNamara (2023) on co-creativism.',
  },
  {
    id: 'more-than-human',
    type: 'concept',
    title: 'More-than-Human',
    description:
      'A commitment, drawn from posthumanist and ecological thought, to decentering the human subject and attending to the agencies of animals, plants, machines, and environments as participants in shared worlds.',
    citation:
      'Abram (1996), The Spell of the Sensuous; Haraway (2016), Staying with the Trouble; Tsing (2015), The Mushroom at the End of the World; Bennett (2010), Vibrant Matter; Bridle (2022), Ways of Being.',
  },
  {
    id: 'chinese-landscape-aesthetics',
    type: 'concept',
    title: 'Chinese Landscape Aesthetics',
    description:
      'The shan-shui tradition of landscape painting, in which mountains and water figure cosmological relation rather than optical resemblance. Here it serves as both training corpus and critical lens for machine-made landscapes.',
    citation:
      'Barnhart et al. (1997), Three Thousand Years of Chinese Painting; Liang (2025), 走向新山水 (Toward a New Shanshui).',
  },
  {
    id: 'environmental-sensing',
    type: 'concept',
    title: 'Environmental Sensing',
    description:
      'Practices of listening to and measuring environments — hydrophones, satellites, biosensors — that translate planetary processes into data, and data back into perceptible form.',
    citation: 'Gabrys (2016), Program Earth; Morton (2013), Hyperobjects.',
  },
  {
    id: 'collective-memory',
    type: 'concept',
    title: 'Collective Memory',
    description:
      'Memory understood as socially and materially distributed across archives, images, and bodies rather than held by individuals. Generative models inherit and redistribute this memory in biased, reconstructive ways.',
    citation:
      'Halbwachs (1992), On Collective Memory; Jan Assmann (2011) and Aleida Assmann (2011) on stored and functional cultural memory; Nora (1989), “Between Memory and History”; Derrida (1996), Archive Fever; Ernst (2013), Digital Memory and the Archive.',
  },
  {
    id: 'embodied-interaction',
    type: 'concept',
    title: 'Embodied Interaction',
    description:
      'Interaction designed around the moving, breathing, gesturing body rather than the screen and cursor, situating computation within bodily and spatial experience.',
    citation:
      'Merleau-Ponty (1962), Phenomenology of Perception; Hansen (2006), Bodies in Code; Hayles (1999), How We Became Posthuman.',
  },
  {
    id: 'speculative-worldbuilding',
    type: 'concept',
    title: 'Speculative Worldbuilding',
    description:
      'The construction of coherent possible worlds as a mode of inquiry: fiction and simulation used to rehearse ecological relations that do not yet exist, so that they may be felt before they are argued.',
    citation:
      'Dunne & Raby (2013), Speculative Everything; Haraway (2016), Staying with the Trouble; Georgiev et al. (2023) on eco-speculative thought.',
  },
  {
    id: 'human-ai-co-creation',
    type: 'concept',
    title: 'Human-AI Co-Creation',
    description:
      'An iterative loop of Duo-Intelligence in which artistic intention and machinic generation continually reshape one another, producing work attributable to neither alone.',
    citation:
      'McNamara (2023) on co-creativism; Boden & Edmonds (2019), From Fingers to Digits; Akten (2021), Deep Visual Instruments.',
  },
  {
    id: 'ecological-time',
    type: 'concept',
    title: 'Ecological Time',
    description:
      'The layered temporalities of seasons, growth, decay, and training cycles — a counterpoint to computational instantaneity that asks how machines might dwell in slower rhythms.',
    citation:
      'Morton (2013), Hyperobjects; Tsing (2015), The Mushroom at the End of the World.',
  },
  {
    id: 'machine-imagination',
    type: 'concept',
    title: 'Machine Imagination',
    description:
      'The capacity of generative systems to synthesize what does not yet exist, treated here not as human imagination’s rival but as a new participant in ecological relation.',
    citation:
      'Bratton (2021), “Planetary Sapience” (Noema); Akten (2021), “Distributed Consciousness”.',
  },
];

/** Convenience lookup used by the atlas interface. */
export const nodeById: ReadonlyMap<string, AtlasNode> = new Map(
  atlasNodes.map((n) => [n.id, n]),
);
