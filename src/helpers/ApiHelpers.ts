import {PendingSong, toPendingSong} from '../models/ApiModels';

/**
 * Helper functions for API request and response methods
 */

export interface RejectPendingSongRequest {
  pendingSong: PendingSong;
  rejectionReason: string;
}

export function toRejectPendingSongRequest(
  data: any
): RejectPendingSongRequest {
  return {
    pendingSong: toPendingSong(data.pendingSong),
    rejectionReason: data.rejectionReason ?? '',
  };
}

export interface AcceptPendingSongRequest {
  pendingSong: PendingSong;
  acceptanceNote: string;
}

export function toAcceptPendingSongRequest(
  data: any
): AcceptPendingSongRequest {
  return {
    pendingSong: toPendingSong(data.pendingSong),
    acceptanceNote: data.acceptanceNote ?? '',
  };
}
