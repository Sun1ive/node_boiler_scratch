export interface IFormat {
    init(this: IFormat, fullString: string): void;
    replace(this: IFormat, match: string, replacer: string, offset: number, fullString: string): string | undefined;
}
