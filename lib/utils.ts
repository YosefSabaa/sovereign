export const formatPrice = (n: number, locale: string = 'ar') => {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG').format(n);
  return locale === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
};

export const formatDate = (ts: any, locale: string = 'ar') => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(date);
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};