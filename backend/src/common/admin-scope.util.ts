import { UserRole } from '../users/user.entity';

export type AdminScope =
  | { scopeAll: true }
  | { scopeAll: false; collectionPointId: string | null };

/**
 * Phạm vi khi xem **danh sách / thống kê** (có thể lọc theo điểm thu gom).
 * - SUPER_ADMIN: mặc định toàn hệ thống; nếu có `collectionPointId` trên query thì chỉ điểm đó.
 * - STORE_ADMIN: luôn chỉ điểm được gán (bỏ qua query).
 */
export function resolveAdminListScope(
  req: { user?: { role?: string; collectionPointId?: string | null } },
  collectionPointIdQuery?: string,
): AdminScope {
  const role = String(req.user?.role || UserRole.USER);
  if (role === UserRole.STORE_ADMIN) {
    return { scopeAll: false, collectionPointId: req.user?.collectionPointId ?? null };
  }
  if (role === UserRole.SUPER_ADMIN) {
    const q = collectionPointIdQuery?.trim();
    if (q) return { scopeAll: false, collectionPointId: q };
    return { scopeAll: true };
  }
  const q = collectionPointIdQuery?.trim();
  if (q) return { scopeAll: false, collectionPointId: q };
  return { scopeAll: true };
}

/** Phạm vi quyền truy cập **một bản ghi** (chi tiết đơn, quyết định): cửa hàng chỉ đơn thuộc điểm của họ; tổng xem mọi nơi. */
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
