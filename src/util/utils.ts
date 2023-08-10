export const trimDoubles =
    (str: string, token: string): string =>
        str.replace(new RegExp(`${token}${token}`, 'g'), token);

export const capitalize = <T extends string>(
    str: T
) => (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;

export const toSpaced = (str: string) =>
    str.replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase()).trim();

export const hasField = <T, K extends string>(
    o: T,
    field: keyof T | K
): o is { [F in typeof field]: unknown } & T => Object.keys(o??{}).includes(`${field as string}`);

