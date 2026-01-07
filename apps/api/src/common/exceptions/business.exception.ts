import { HttpException } from '@nestjs/common';

/**
 * 비즈니스 예외의 공통 베이스 클래스
  커스텀 비즈니스 예외들은 전부 BusinessException 상속받아 사용한다.
// 예)
// export class UserNotFoundException extends BusinessException {
//   constructor(userId: string) {
//     super(404, 'USER_NOT_FOUND', 'User does not exist', { userId });
//   }
// }
 */
export class BusinessException extends HttpException {
  constructor(
    status: number,
    public readonly code: string,
    message?: string,
    public readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}
