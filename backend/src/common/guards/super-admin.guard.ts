import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

function parseAllowList(input: string | undefined): string[] {
  return String(input || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Chỉ admin tổng (SUPER_ADMIN) hoặc email trong SUPER_ADMIN_EMAILS / ADMIN_EMAILS (legacy).
 * Admin cửa hàng (STORE_ADMIN) không được truy cập.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = String(req?.user?.role || UserRole.USER);
    if (role === UserRole.SUPER_ADMIN) return true;

    const email = String(req?.user?.email || '')
      .trim()
      .toLowerCase();
    if (!email) throw new ForbiddenException();

    const superList = parseAllowList(process.env.SUPER_ADMIN_EMAILS);
    const adminList = parseAllowList(process.env.ADMIN_EMAILS);

    if (superList.length > 0) {
      if (superList.includes(email)) return true;
      throw new ForbiddenException();
    }

    if (adminList.length > 0 && adminList.includes(email)) return true;

    throw new ForbiddenException();
  }
}
