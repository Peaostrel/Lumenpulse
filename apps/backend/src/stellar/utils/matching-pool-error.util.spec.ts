import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../common/enums/error-code.enum';
import {
  CONTRIBUTIONS_PAUSED_MESSAGE,
  isContributionScopePausedDiagnostic,
  toContributionPausedException,
} from './matching-pool-error.util';

describe('matching-pool contribution pause mapping', () => {
  it('recognizes the matching-pool contribution pause contract error', () => {
    expect(
      isContributionScopePausedDiagnostic(
        'Simulation failed: HostError: Error(Contract, #19)',
      ),
    ).toBe(true);
  });

  it('does not confuse other matching-pool scope errors with contributions', () => {
    expect(isContributionScopePausedDiagnostic('Error(Contract, #20)')).toBe(false);
    expect(isContributionScopePausedDiagnostic('Error(Contract, #21)')).toBe(false);
  });

  it('returns a stable service-unavailable response clients can map', () => {
    const exception = toContributionPausedException(
      'HostError: Error(Contract, #19)',
    );

    expect(exception).not.toBeNull();
    expect(exception?.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(exception?.getResponse()).toEqual({
      code: ErrorCode.STEL_CONTRIBUTIONS_PAUSED,
      message: CONTRIBUTIONS_PAUSED_MESSAGE,
      details: { contractErrorCode: 19 },
    });
  });

  it('returns null for unrelated diagnostics', () => {
    expect(toContributionPausedException('network unavailable')).toBeNull();
  });
});
