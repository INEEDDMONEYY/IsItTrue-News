import type { ArticleFactCheck } from '../types/publicFactCheck.types'

// What a story that has not been fact-checked looks like. Used for the author's preview, and for the mock stories
// on the homepage, which have no fact-check records behind them.
export const NOT_FACT_CHECKED: ArticleFactCheck = {
  verdict: 'unverified',
  flagged: false,
  claims: [],
  counts: { verified: 0, partially_supported: 0, disputed: 0, unverified: 0, unable_to_verify: 0 },
  openClaims: 0,
  editorSignOff: null,
}
