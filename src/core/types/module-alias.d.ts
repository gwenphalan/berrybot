declare module 'module-alias' {
	export function addAliases(aliases: Record<string, string>): void;
	export function register(): void;
}
