import {DbPendingSong, toDbPendingSong} from '../db/DbModels';

/**
 * Helper functions for API request and response methods
 */

export interface RejectPendingSongRequest {
  pendingSong: DbPendingSong;
  rejectionReason: string;
}

export function toRejectPendingSongRequest(
  data: any
): RejectPendingSongRequest {
  return {
    pendingSong: toDbPendingSong(data.pendingSong),
    rejectionReason: data.rejectionReason ?? '',
  };
}

export interface AcceptPendingSongRequest {
  pendingSong: DbPendingSong;
  acceptanceNote: string;
}

export function toAcceptPendingSongRequest(
  data: any
): AcceptPendingSongRequest {
  return {
    pendingSong: toDbPendingSong(data.pendingSong),
    acceptanceNote: data.acceptanceNote ?? '',
  };
}
