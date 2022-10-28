export type Event = {
	name: string;
	once?: boolean;
	rest?: boolean;
	execute(...args: any[]): void;
};
