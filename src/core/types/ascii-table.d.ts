// Minimal type definition for ascii-table

declare module 'ascii-table' {
	class AsciiTable {
		constructor(): AsciiTable;
		setHeading(...headings: string[]): this;
		addRow(...row: any[]): this;
		toString(): string;
	}
	export default AsciiTable;
}
