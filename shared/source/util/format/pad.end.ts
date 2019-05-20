/**
 * Align string to specified length with specified symbols
 * Example: value = 524, length = 6, padding = '0', return = '524000'
 * @param value - incoming string needs to align line
 * @param length - count of symbol you expect in result string
 * @param padding - symbol what you will addValue in end of string
 * @returns {String} - aligned to 'length' number of characters
 */
export function padEnd(value: string, length: number, padding?: string): string {
	let padstr = (typeof padding === 'string' && padding.length !== 0) ? padding : ' ';
	while (value.length < length) {
		value = value + padstr;
	}
	return value.slice(0, length);
}
