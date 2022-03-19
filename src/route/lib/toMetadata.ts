export const toMetadata = (names: string[], metadata_type: string) =>
    names.map((name) => ({ type: metadata_type, name }));
