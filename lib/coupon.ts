import { Coupon } from './firestore';

export type AppliedCoupon = {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
};

/**
 * ✅ احسب قيمة الخصم
 */
export const calculateDiscount = (
  subtotal: number,
  coupon: AppliedCoupon | null
): number => {
  if (!coupon) return 0;

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subtotal);
};

/**
 * ✅ وصف الكوبون للعرض
 */
export const describeCoupon = (
  coupon: AppliedCoupon,
  locale: string = 'ar'
): string => {
  if (coupon.discountType === 'percentage') {
    return locale === 'ar'
      ? `خصم ${coupon.discountValue}%`
      : `${coupon.discountValue}% off`;
  }
  return locale === 'ar'
    ? `خصم ${coupon.discountValue} ج.م`
    : `EGP ${coupon.discountValue} off`;
};

/**
 * ✅ تحويل من Coupon لـ AppliedCoupon
 */
export const toAppliedCoupon = (c: Coupon): AppliedCoupon => ({
  code: c.code,
  discountType: c.discountType || 'percentage',
  discountValue:
    c.discountValue !== undefined
      ? c.discountValue
      : (c as any).discountPercent || 0
});