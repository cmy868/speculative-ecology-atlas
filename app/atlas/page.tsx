import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import AtlasMap3D from '@/components/AtlasMap3D';

export const metadata: Metadata = {
  title: 'Atlas — Speculative Ecology in the Age of Generative AI',
  description:
    'An explorable map of projects, concepts, and territories — memory, life, embodiment — within an evolving ecology of human-AI co-creation.',
};

export default function AtlasPage() {
  return (
    <div className="atlas-page">
      <SiteHeader />
      <AtlasMap3D />
      <p className="atlas-footnote">
        The dissertation is a snapshot; this atlas is the ecology that keeps growing.
      </p>
    </div>
  );
}
