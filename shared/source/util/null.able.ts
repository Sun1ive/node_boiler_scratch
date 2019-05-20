export type NullAble<Base> = {
    [key in keyof Base]: Base[key] | null;
}
