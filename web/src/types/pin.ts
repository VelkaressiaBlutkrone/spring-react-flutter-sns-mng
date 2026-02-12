/**
 * Pin 관련 타입 (TASK_WEB Step 4).
 */

export interface PinResponse {
  id: number;
  ownerId: number;
  ownerNickname: string;
  latitude: number;
  longitude: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
