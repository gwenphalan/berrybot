# Discord.js Components v2 ContainerBuilder Validation Error

## Section 1: Problem Description

When trying to use Discord.js v14's new Message Components v2 (ContainerBuilder, SectionBuilder, TextDisplayBuilder, etc.), I get a runtime error when sending a message with a container that includes a section and action rows with buttons.

**Error:**

```
CombinedError: Received one or more errors
  ExpectedValidationError: Expected
    validator: 's.instance(V)',
    given: undefined,
    expected: [class ButtonBuilder extends ComponentBuilder]
  ExpectedValidationError: Expected
    validator: 's.instance(V)',
    given: undefined,
    expected: [class ThumbnailBuilder extends ComponentBuilder]
```

This happens when calling `.reply()` on a `ChatInputCommandInteraction` with a message object containing a v2 container.

## Section 2: Code Snippets

**main-menu.ts (relevant part):**

```ts
import {
	ContainerBuilder,
	SectionBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	MessageFlags,
} from 'discord.js';
// ...other imports...

export const MainMenu: MessageBuilder = {
	async build(client, state, options) {
		// ...fetch guildSettings, etc...

		const container = new ContainerBuilder().setAccentColor(0x00bfff);
		const titleComponent = new TextDisplayBuilder().setContent('Some title');
		const textSection = new SectionBuilder().addTextDisplayComponents(titleComponent);

		// Build buttons
		const createBtn = await new ConfigMainMenuCreateButton().build(client, undefined);
		const editBtn = await new ConfigMainMenuEditButton().build(client, undefined);

		// Add buttons to action row
		const buttonRow = new ActionRowBuilder<ButtonBuilder>();
		buttonRow.addComponents(createBtn, editBtn);

		// Add section and action row to container
		container.addSectionComponents(textSection);

		// I tried both of these:
		// container.addActionRowComponents(buttonRow); // (builder instance)
		// container.addActionRowComponents(buttonRow.toJSON()); // (raw object)

		// Return message
		return {
			flags: MessageFlags.IsComponentsV2,
			components: [container],
		};
	},
};
```

**ButtonComponent base class:**

```ts
export abstract class ButtonComponent<TData = unknown> {
	// ...fields...
	async build(client: Client, data?: TData): Promise<ButtonBuilder> {
		const builder = new ButtonBuilder()
			.setStyle(this.style ?? ButtonStyle.Primary)
			.setLabel(this.label ?? '');
		// ...set emoji, url, etc...
		builder.setCustomId('some:custom:id');
		return builder;
	}
}
```

## Section 3: What I've Tried

- Logging shows that the buttons are valid `ButtonBuilder` instances.
- Using both `addActionRowComponents(buttonRow)` and `addActionRowComponents(buttonRow.toJSON())` for the container.
- All components are present and not undefined at the time of building.
- The error always points to the `.toJSON()` of `SectionBuilder` or `ContainerBuilder`, and the validator expects a `ButtonBuilder` but gets `undefined`.

## Section 4: Package Versions & Stack Trace

**Package Versions:**

- `discord.js`: **v14.14.1**
- `@discordjs/builders`: **1.8.2**
- `@sapphire/shapeshift`: **3.15.0**
- Node.js: **v22.15.0**

**Stack Trace:**

```
CombinedError: Received one or more errors
    at _UnionValidator.handle (.../node_modules/@sapphire/shapeshift/dist/cjs/index.cjs:1965:23)
    at _UnionValidator.parse (.../node_modules/@sapphire/shapeshift/dist/cjs/index.cjs:972:90)
    at SectionBuilder.toJSON (.../node_modules/@discordjs/builders/dist/index.js:2169:37)
    at ContainerBuilder.toJSON (.../node_modules/@discordjs/builders/dist/index.js:1870:35)
    at MessagePayload.resolveBody (.../node_modules/discord.js/src/structures/MessagePayload.js:150:49)
    at ChatInputCommandInteraction.reply (.../node_modules/discord.js/src/structures/interfaces/InteractionResponses.js:192:56)
  errors: [
    ExpectedValidationError: Expected
      validator: 's.instance(V)',
      given: undefined,
      expected: [class ButtonBuilder extends ComponentBuilder]
    ExpectedValidationError: Expected
      validator: 's.instance(V)',
      given: undefined,
      expected: [class ThumbnailBuilder extends ComponentBuilder]
  ]
```
