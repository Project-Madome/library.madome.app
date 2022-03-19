export const sexEmojiToString = (str: string) => {
    const female = "♀";
    const male = "♂";
    if (str.includes(female)) {
        // female
        const r = `female ${str.replace(female, "").trim()}`;
        return r;
    }

    if (str.includes(male)) {
        const r = `male ${str.replace(male, "").trim()}`;
        return r;
    }
    return str;
};
