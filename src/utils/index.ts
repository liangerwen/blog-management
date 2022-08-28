export * from './authentication';

export const Arr2Obj = <T extends {}, K extends keyof T, V extends keyof T>(
  data: T[],
  keyIndex: K,
  valueIndex: V,
) => {
  const res: any = {};
  data.forEach((r) => {
    res[r[keyIndex]] = r[valueIndex];
  });
  return res;
};
