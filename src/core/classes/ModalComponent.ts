import { Client } from '../client/BerryClient';
import * as discord from 'discord.js';
import { t } from '@/core/utils/Locale';

export interface TextInputOptions {
	label: string;
	style: discord.TextInputStyle;
	custom_id: string;
	required?: boolean;
	min_length?: number;
	max_length?: number;
	placeholder?: string;
	default_value?: string;
}

export interface ModalBuildOptions<TData = unknown> {
	title?: string;
	fields?: TextInputOptions[];
	data: TData;
}

export abstract class ModalComponent<TData = unknown> {
	abstract id: string;
	title: string;
	fields: discord.TextInputBuilder[];
	parent?: string;
	group?: string;

	constructor(title: string, fields: discord.TextInputBuilder[]) {
		this.title = title;
		this.fields = fields;
	}

	/**
	 * Build the ModalBuilder with the properties of this instance.
	 * @param client - The bot client instance.
	 * @param options - Optional build options.
	 * @param sessionId - Optional session ID for the modal.
	 * @param titleKey - Optional translation key for the modal title.
	 * @param locale - Optional locale string for localization.
	 */
	async build(
		client: Client,
		options?: ModalBuildOptions<TData>,
		sessionId?: string,
		titleKey?: string,
		locale?: string
	): Promise<discord.ModalBuilder> {
		let title = options?.title ?? this.title;
		if (titleKey && locale) {
			title = t(titleKey, { locale });
		}
		const builder = new discord.ModalBuilder().setTitle(title);

		let idString: string;
		if (this.parent && this.group) {
			idString = `${this.parent}:${this.group}:${this.id}`;
		} else if (this.parent) {
			idString = `${this.parent}:${this.id}`;
		} else {
			idString = this.id;
		}
		const customId = client.utils.CustomId.createCustomId(idString, {
			data: options?.data as Record<string, any>,
			sessionId,
		});
		builder.setCustomId(customId);

		const fields = options?.fields
			? options.fields.map((f) => {
					const input = new discord.TextInputBuilder()
						.setCustomId(f.custom_id)
						.setLabel(f.label)
						.setStyle(f.style);
					if (f.required !== undefined) input.setRequired(f.required);
					if (f.min_length !== undefined) input.setMinLength(f.min_length);
					if (f.max_length !== undefined) input.setMaxLength(f.max_length);
					if (f.placeholder !== undefined) input.setPlaceholder(f.placeholder);
					if (f.default_value !== undefined) input.setValue(f.default_value);
					return input;
				})
			: this.fields;

		for (const field of fields) {
			builder.addComponents(
				new discord.ActionRowBuilder<discord.TextInputBuilder>().addComponents(field)
			);
		}
		return builder;
	}
}
