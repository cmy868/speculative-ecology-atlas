'use client';

import type { MutableRefObject } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods, ForceGraphProps } from 'react-force-graph-2d';

type Props = ForceGraphProps & {
  graphRef?: MutableRefObject<ForceGraphMethods | undefined>;
};

/**
 * Thin client-only wrapper around react-force-graph-2d.
 *
 * It exists because `next/dynamic` does not forward refs: AtlasMap imports
 * this module with `dynamic(..., { ssr: false })` and passes the imperative
 * handle through the ordinary `graphRef` prop instead.
 */
export default function ForceGraphCanvas({ graphRef, ...props }: Props) {
  return <ForceGraph2D ref={graphRef} {...props} />;
}
