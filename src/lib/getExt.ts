export const getExt = (x: string) => {
    const r = x.split(".");
    return r[r.length - 1];
};
