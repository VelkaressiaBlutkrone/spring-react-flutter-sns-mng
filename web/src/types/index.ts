/**
 * 공통 타입 (TASK_WEB Step 1 골격, Step 3 확장).
 */

/** Spring Page 응답 형식 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** API 에러 응답 */
export interface ErrorResponse {
  code: string;
  message: string;
  fieldErrors?: Array<{ field: string; value: string; reason: string }>;
}
