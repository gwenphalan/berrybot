export interface Event {
    name: string,
    once?: boolean,
    rest?: boolean,
    execute(...args: any[]): void
}