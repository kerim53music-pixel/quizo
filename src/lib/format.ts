const nf = new Intl.NumberFormat('tr-TR')

/** 2240 -> "2.240" (Turkish grouping) */
export const formatNumber = (n: number): string => nf.format(n)
