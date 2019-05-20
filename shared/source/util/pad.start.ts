/**
     * Align string to specified length with specified symbols
     * Example: value = 524, length = 5, padding = '0', return = '00524'
     * @param value - incoming string needs to align line
     * @param length - count of symbol you expect in result string
     * @param padding - symbol what you will addValue in begin of string
     * @returns {String} - aligned to 'length' number of characters
     */
export function padStart(value: string, length: number, padding?: string): string {
	let padstr = (typeof padding === 'string' && padding.length !== 0) ? padding : ' ';
	while (value.length < length) {
		value = padstr + value;
	}
	return value.slice(value.length - length, length);
}
