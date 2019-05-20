import {IFormat} from './format.interface';

export class ChainFormat implements IFormat {
    private readonly _chain: IFormat[];

    public constructor() {
        this._chain = [];
    }

    public addDelegate(this: ChainFormat, format: IFormat): void {
        const index = this._chain.findIndex((value) => value === format);
        if (index < 0) {
            this._chain.push(format);
        }
    }

    public removeDelegate(this: ChainFormat, format: IFormat): void {
        const index = this._chain.findIndex((value) => value === format);
        if (index >= 0) {
            this._chain.splice(index, 1);
        }
    }

    public init(this: ChainFormat, fullString: string): void {
        for (let fmt of this._chain) {
            fmt.init(fullString);
        }
    }

    public replace(this: ChainFormat, match: string, replacer: string, offset: number, fullString: string): string | undefined {
        for (let fmt of this._chain) {
            const value = fmt.replace(match, replacer, offset, fullString);
            if (value !== undefined) {
                return value;
            }
        }
        return undefined;
    }
}