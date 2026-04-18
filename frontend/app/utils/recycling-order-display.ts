/** Nhãn / class hiển thị đơn thu gom & hoàn trả (dùng chung list + chi tiết). */

export function orderStatusLabel(st: string): string {
  const m: Record<string, string> = {
    PENDING: 'Chờ thu gom',
    COMPLETED: 'Đã thu gom',
    STORED: 'Đã nhập kho',
    CANCELLED: 'Đã huỷ'
  }
  return m[st] ?? st
}

export function orderStatusClass(st: string): string {
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold'
  switch (st) {
    case 'PENDING':
      return `${base} bg-amber-50 text-amber-800`
    case 'COMPLETED':
      return `${base} bg-sky-50 text-sky-800`
    case 'STORED':
      return `${base} bg-emerald-50 text-emerald-800`
    case 'CANCELLED':
      return `${base} bg-slate-100 text-slate-600`
    default:
      return `${base} bg-slate-100 text-slate-700`
  }
}

export function returnStatusLabel(rs?: string | null): string {
  if (!rs || rs === 'NONE') return ''
  const m: Record<string, string> = {
    PENDING: 'Chờ kiểm hàng',
    APPROVED: 'Đã nhập kho',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã huỷ yêu cầu'
  }
  return m[rs] ?? rs
}

export function returnStatusClass(rs?: string | null): string {
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold'
  switch (rs) {
    case 'PENDING':
      return `${base} bg-amber-50 text-amber-800`
    case 'APPROVED':
      return `${base} bg-emerald-50 text-emerald-800`
    case 'REJECTED':
      return `${base} bg-rose-50 text-rose-800`
    case 'CANCELLED':
      return `${base} bg-slate-100 text-slate-600`
    default:
      return ''
  }
}

export function formatOrderCreated(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

/**
 * Một nhãn duy nhất cho người dùng cuối (không nhấn mạnh “kho” / nội bộ).
 * Ưu tiên: huỷ / từ chối hoàn trả → chờ phản hồi hoàn trả → lịch thu gom → sau thu gom.
 */
export function userOrderStatusLabel(status: string, returnStatus?: string | null): string {
  const rs = returnStatus && returnStatus !== 'NONE' ? returnStatus : null

  if (status === 'CANCELLED') return 'Đã huỷ đơn'
  if (rs === 'CANCELLED') return 'Đã huỷ yêu cầu hoàn trả'
  if (rs === 'REJECTED') return 'Yêu cầu hoàn trả không được chấp nhận'
  if (rs === 'PENDING') return 'Chờ phản hồi hoàn trả'

  if (status === 'PENDING') return 'Chờ thu gom'
  if (status === 'STORED' || rs === 'APPROVED') return 'Đã hoàn tất'
  if (status === 'COMPLETED') return 'Đã thu gom tại điểm hẹn'

  return orderStatusLabel(status)
}

export function userOrderStatusClass(status: string, returnStatus?: string | null): string {
  const rs = returnStatus && returnStatus !== 'NONE' ? returnStatus : null
  const base = 'rounded-full px-2 py-0.5 text-[11px] font-semibold'

  if (status === 'CANCELLED' || rs === 'CANCELLED') return `${base} bg-slate-100 text-slate-600`
  if (rs === 'REJECTED') return `${base} bg-rose-50 text-rose-800`
  if (rs === 'PENDING') return `${base} bg-amber-50 text-amber-800`
  if (status === 'PENDING') return `${base} bg-amber-50 text-amber-800`
  if (status === 'STORED' || rs === 'APPROVED') return `${base} bg-emerald-50 text-emerald-800`
  if (status === 'COMPLETED') return `${base} bg-sky-50 text-sky-800`

  return orderStatusClass(status)
}
