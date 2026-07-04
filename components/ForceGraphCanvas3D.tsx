'use client';

import type { MutableRefObject } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-3d';

type Props = ForceGraphProps & {
  graphRef?: MutableRefObject<ForceGraphMethods | undefined>;
};

/**
 * Thin client-only wrapper around react-force-graph-3d.
 *
 * It exists because `next/dynamic` does not forward refs: AtlasMap3D imports
 * this module with `dynamic(..., { ssr: false })` and passes the imperative
 * handle through the ordinary `graphRef` prop instead.
 */
export default function ForceGraphCanvas3D({ graphRef, ...props }: Props) {
  return <ForceGraph3D ref={graphRef} {...props} />;
}
