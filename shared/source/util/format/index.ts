import {ChainFormat} from './chain.format';
import {DateFormat} from './date.format';
import {IFormat} from './format.interface';
import {KeepFormat} from './keep.format';
import {SystemFormat} from './system.format';

const formatter = new ChainFormat();
formatter.addDelegate(new DateFormat());
formatter.addDelegate(new SystemFormat());
formatter.addDelegate(new KeepFormat(['%']));

export function format(fmt: string): string {
    formatter.init(fmt);
    return fmt.replace(/%([a-zA-Z0-9]|[{][a-z-A-Z0-9_-]+[}])/g, (match: string, replacer: string, offset: number, fullString: string) => {
        const res = formatter.replace(match, replacer, offset, fullString);
        return res !== undefined ? res : '';
    });
}

export function addDelegate(fmt: IFormat): void {
    formatter.addDelegate(fmt);
}

export function removeDelegate(fmt: IFormat): void {
    formatter.removeDelegate(fmt);
}
