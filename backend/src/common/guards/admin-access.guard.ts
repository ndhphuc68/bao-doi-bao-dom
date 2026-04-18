import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

function parseAllowList(input: string | undefined): string[] {
  return String(input || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Cho phép vào khu vực admin (cả tổng và cửa hàng) nếu:
 * - JWT có role SUPER_ADMIN hoặc STORE_ADMIN, hoặc
 * - email nằm trong ADMIN_EMAILS (legacy), hoặc
 * - ADMIN_EMAILS rỗng (dev/demo): giữ hành vi cũ — mọi user đã đăng nhập đều vào được (chỉ nên dùng local).
 */
@Injectable()
export class AdminAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = String(req?.user?.role || UserRole.USER);
    if (role === UserRole.SUPER_ADMIN || role === UserRole.STORE_ADMIN) return true;

    const email = String(req?.user?.email || '')
      .trim()
      .toLowerCase();
    const allow = parseAllowList(process.env.ADMIN_EMAILS);
    if (allow.length === 0) return true;
    if (!email) return false;
    return allow.includes(email);
  }
}
