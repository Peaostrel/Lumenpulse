import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { extractContractErrorCode } from './soroban-error.mapper';

export const MATCHING_POOL_CONTRIBUTION_SCOPE_PAUSED = 19;
export const CONTRIBUTIONS_PAUSED_MESSAGE =
  'Contributions are temporarily paused. Please try again after the operator resumes them.';

/**
 * Matching-pool contract diagnostics are surfaced by Soroban as
 * `Error(Contract, #N)`. Error 19 is the stable contribution-scope pause
 * signal defined by `MatchingPoolError::ContributionScopePaused`.
 */
export function isContributionScopePausedDiagnostic(message: string): boolean {
  return extractContractErrorCode(message) === MATCHING_POOL_CONTRIBUTION_SCOPE_PAUSED;
}

/**
 * Converts matching-pool contribution pause diagnostics into a stable API
 * response that web/mobile clients can handle without parsing Soroban text.
 */
export function toContributionPausedException(message: string): HttpException | null {
  if (!isContributionScopePausedDiagnostic(message)) {
    return null;
  }

  return new HttpException(
    {
      code: ErrorCode.STEL_CONTRIBUTIONS_PAUSED,
      message: CONTRIBUTIONS_PAUSED_MESSAGE,
      details: {
        contractErrorCode: MATCHING_POOL_CONTRIBUTION_SCOPE_PAUSED,
      },
    },
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}
