
export type DeepPartial<Source> = {
    [P in keyof Source]?: DeepPartial<Source[P]>;
}
