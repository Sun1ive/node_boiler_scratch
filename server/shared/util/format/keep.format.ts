import {IFormat} from './format.interface';

export class KeepFormat implements IFormat {
    private _accept                     : Set<string>;
    public constructor(accepted: string[]) {
        this._accept = new Set(accepted);
    }

    public init(this: KeepFormat, fullString: string) {}

    public replace(this: KeepFormat, match: string, replacer: string, offset: number, fullString: string): string | undefined {
        return this._accept.has(replacer) ? replacer : undefined;
    }
}