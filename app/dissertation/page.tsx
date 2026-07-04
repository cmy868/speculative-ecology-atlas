import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Dissertation — Speculative Ecology in the Age of Generative AI',
  description:
    'Abstract, chapter outline, committee, and citation for the dissertation by Mingyong Cheng (UC San Diego, 2026).',
};

const chapters = [
  { label: 'Introduction', title: 'Speculative Ecology in the Age of Generative AI' },
  { label: 'Chapter 1', title: 'Toward a Speculative Ecology' },
  {
    label: 'Chapter 2',
    title: 'Ecologies of Memory: Landscape, Archives, and Generative Imagination',
  },
  {
    label: 'Chapter 3',
    title: 'Ecologies of Life: More-than-Human Intelligence and Speculative Worlds',
  },
  {
    label: 'Chapter 4',
    title: 'Ecologies of Embodiment: Perception, Identity, and Human-AI Relations',
  },
  { label: 'Conclusion', title: 'Toward an Evolving Ecology of Human-AI Co-Creation' },
];

// Plain <a href> doesn't get Next's basePath rewrite, so prefix manually
// when the site is served under a sub-path (e.g. GitHub Pages).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const committee = [
  { role: 'Co-Chair', name: 'Dr. Memo Akten' },
  { role: 'Co-Chair', name: 'Dr. Pinar Yoldas' },
  { role: 'Member', name: 'Dr. Joshua Jones' },
  { role: 'Member', name: 'Dr. Lei Liang' },
  { role: 'Member', name: 'Dr. Robert Twomey' },
];

export default function DissertationPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="dissertation">
        <header className="dissertation-header">
          <p className="hero-kicker">The fixed artifact</p>
          <h1 className="display">Speculative Ecology in the Age of Generative AI</h1>
          <p className="dissertation-author">Mingyong Cheng</p>
        </header>

        <section className="dissertation-section">
          <h2>Abstract</h2>
          <p className="abstract-text">
            This practice-based dissertation argues that generative artificial
            intelligence has transformed machines from systems of prediction into
            systems of imagination, producing new ecological relationships among
            memory, life, and embodiment. To understand and critically engage these
            emerging assemblages of humans, machines, and environments, it develops
            Speculative Ecology: a transdisciplinary framework merging ecological
            thought, speculative philosophy, and artistic practice. Within this
            framework, generative AI is treated not as a tool but as an Emergent
            Repository, a latent reservoir of cultural, visual, and sonic patterns
            worked by the human artist as an Agent of Emergence through an iterative
            loop of Duo-Intelligence.
          </p>
        </section>

        <section className="dissertation-section">
          <h2>Chapter Outline</h2>
          <ol className="chapter-list">
            {chapters.map((chapter) => (
              <li key={chapter.label}>
                <span className="chapter-label">{chapter.label}</span>
                <span className="chapter-title display">{chapter.title}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="dissertation-section">
          <h2>Download</h2>
          <a className="button button-primary" href={`${BASE_PATH}/dissertation.pdf`}>
            Download Dissertation PDF
          </a>
          <p className="section-note">
            Final draft — University of California San Diego, 2026.
          </p>
        </section>

        <section className="dissertation-section">
          <h2>Committee &amp; Program</h2>
          <p>
            Doctor of Philosophy in Art History, Theory, and Criticism, with a
            Concentration in Art Practice and a Specialization in Interdisciplinary
            Environmental Research. University of California San Diego, 2026.
          </p>
          <ul className="committee-list">
            {committee.map((member) => (
              <li key={member.name}>
                <span className="committee-role">{member.role}</span>
                <span className="committee-name">{member.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="dissertation-section">
          <h2>Citation</h2>
          <blockquote className="citation-block">
            Cheng, M. (2026). <em>Speculative ecology in the age of generative AI</em>{' '}
            [Doctoral dissertation, University of California San Diego].
          </blockquote>
          <p className="section-note">
            Citation placeholder — to be updated with the published record
            (ProQuest / eScholarship) upon deposit.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
