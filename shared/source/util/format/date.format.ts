import { IFormat } from './format.interface';
import { padStart } from '../pad.start';

export class DateFormat implements IFormat {
	public currentDateTime: Date | undefined;
	public dayOfWeek?: string;
	public month?: string;
	public timezoneOffset?: string;
	public timezone?: string;

	public setDate(this: DateFormat, date: Date) {
		this.currentDateTime = date;
		const match = /^([A-Z][a-z]*)\s+([A-Z][a-z]*)\s+(\d{2})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+GMT([+-]\d{4})(?:\s+[(]([A-Z]+)[)])$/.exec(date.toString());
		if (match) {
			this.dayOfWeek = match[1];
			this.month = match[2];
			this.timezoneOffset = match[8];
			this.timezone = match[9];
		} else {
			this.timezone = this.timezoneOffset = this.month = this.dayOfWeek = undefined;
		}
	}

	public constructor() {
		this.setDate(new Date());
	}

	public init(this: DateFormat, fullString: string): void {
		this.setDate(new Date());
	}

	public replace(this: DateFormat, match: string, replacer: string, offset: number, fullString: string): string | undefined {
		switch (replacer) {
			case 'a':
				return this.dayOfWeek;
			case 'A':
				break;
			case 'w':
				return (this.currentDateTime!.getDay() - 1).toString(10);
			case 'd':
				return padStart((this.currentDateTime!.getDate()).toString(10), 2, '0');
			case 'b':
				return this.month;
			case 'B':
				break;
			case 'm':
				return padStart((this.currentDateTime!.getMonth() + 1).toString(10), 2, '0');
			case 'y':
				return padStart((this.currentDateTime!.getFullYear() % 100).toString(10), 2, '0');
			case 'Y':
				return padStart((this.currentDateTime!.getFullYear()).toString(10), 4, '0');
			case 'H':
				return padStart((this.currentDateTime!.getHours()).toString(10), 2, '0');
			case 'I':
				return padStart((this.currentDateTime!.getHours() % 12).toString(10), 2, '0');
			case 'p':
				break;
			case 'M':
				return padStart((this.currentDateTime!.getMinutes()).toString(10), 2, '0');
			case 'S':
				return padStart((this.currentDateTime!.getSeconds()).toString(10), 2, '0');
			case 'f':
				return padStart((this.currentDateTime!.getMilliseconds() * 1000).toString(10), 6, '0');
			case 'z':
				return this.timezoneOffset;
			case 'Z':
				return this.timezone;
			case 'j':
			case 'U':
			case 'W':
				break;
			case 'c':
				return this.currentDateTime!.toLocaleString();
			case 'x':
				return this.currentDateTime!.toLocaleDateString();
			case 'X':
				return this.currentDateTime!.toLocaleTimeString();
		}
		return undefined;
	}
}
