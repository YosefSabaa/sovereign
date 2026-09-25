export const phoneToEmail = (phone: string): string => {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '20' + clean.slice(1);
  return `${clean}@sovereign.local`;
};

export const isValidEgyptianPhone = (phone: string): boolean => {
  const clean = phone.replace(/[^0-9]/g, '');
  return /^01[0125][0-9]{8}$/.test(clean);
};