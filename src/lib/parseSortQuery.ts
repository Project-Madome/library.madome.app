const defaultReplacer = (original: string) => {
    switch (original) {
        case "created":
            return "created_at";
        case "updated":
            return "updated_at";
        default:
            return original;
    }
};

export const parseSortQuery = (
    st: string,
    replacer: (by: string) => string = defaultReplacer,
): { by: string; method: "DESC" | "ASC" } => {
    const s = st.split("_");

    const last = s[s.length - 1];
    const init = s.filter((e, i, a) => i < a.length - 1).join("_");

    return {
        by: replacer(init && init.toLowerCase().trim()),
        method: last && last.toUpperCase().trim(),
    } as ReturnType<typeof parseSortQuery>;
};

// console.log(parseSortQuery('rank_desc'));
