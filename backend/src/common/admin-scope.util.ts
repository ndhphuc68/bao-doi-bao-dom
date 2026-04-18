import { UserRole } from '../users/user.entity';

export type AdminScope =
  | { scopeAll: true }
  | { scopeAll: false; collectionPointId: string | null };

/** Phạm vi dữ liệu admin: tổng xem hết; cửa hàng chỉ đơn thuộc collectionPointId. USER (legacy dev) coi như tổng khi vào được admin. */
export function resolveAdminScope(req: {
  user?: { role?: string; collectionPointId?: string | null };
}): AdminScope {
  const role = String(req.user?.role || UserRole.USER);
  if (role === UserRole.SUPER_ADMIN) return { scopeAll: true };
  if (role === UserRole.STORE_ADMIN) {
    return { scopeAll: false, collectionPointId: req.user?.collectionPointId ?? null };
  }
  return { scopeAll: true };
}
