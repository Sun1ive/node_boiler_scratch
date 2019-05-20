import {IFormat} from './format.interface';

export class SystemFormat implements IFormat {
    public constructor() {}

    public init(this: SystemFormat, fullString: string): void {}

    public replace(this: SystemFormat, match: string, replacer: string, offset: number, fullString: string): string | undefined {
        switch (replacer) {
        case 'u':
            return process.getuid().toString();
        case 'g':
            return process.getgid().toString();
        case 'P':
            return process.pid.toString();
        }
        return undefined;
    }
}
