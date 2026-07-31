import type { ExplainParams } from "../types";
import { buildExplainMomentPrompt } from "./explain-moment";

export function buildExplainMovePrompt(params: ExplainParams): string {
  return buildExplainMomentPrompt({
    ...params,
    momentType: params.classification ?? "move",
  });
}
