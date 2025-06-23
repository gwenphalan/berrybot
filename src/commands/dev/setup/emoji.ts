import type { Command } from '@/core/interfaces/Command';
import { Colors, EmbedBuilder, GuildMember, type CommandInteraction } from 'discord.js';
import { LocalizedSlashCommandBuilder } from '@/core/utils/Locale';
import { logger } from '@/core/logging/Logger';
import { load } from '@/core/utils/Files';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from '@/core/client/BerryClient';

/**
 * Creates a text-based progress bar
 * @param current Current progress
 * @param total Total items
 * @param barSize Size of the progress bar
 * @returns Formatted progress bar string
 */
function createProgressBar(current: number, total: number, barSize: number = 20): string {
	const progress = Math.min(Math.max(current / total, 0), 1);
	const filledLength = Math.round(barSize * progress);
	const emptyLength = barSize - filledLength;

	const filled = '█'.repeat(filledLength);
	const empty = '░'.repeat(emptyLength);

	return `[${filled}${empty}] ${Math.round(progress * 100)}%`;
}

/**
 * Timeout promise that rejects after the specified time
 * @param ms Milliseconds before timeout
 */
function timeout(ms: number): Promise<never> {
	return new Promise((_, reject) =>
		setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
	);
}

/**
 * Sanitizes an emoji name to ensure it meets Discord's requirements:
 * - 2-32 characters long
 * - Only alphanumeric characters and underscores
 * - Cannot start with a number
 * @param name The original emoji name
 * @returns Sanitized emoji name
 */
function sanitizeEmojiName(name: string): string {
	// Replace any non-alphanumeric characters with underscores
	let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');

	// Ensure it doesn't start with a number
	if (/^[0-9]/.test(sanitized)) {
		sanitized = 'e_' + sanitized;
	}

	// Ensure it's at least 2 characters
	if (sanitized.length < 2) {
		sanitized = sanitized + '_emoji';
	}

	// Truncate if longer than 32 characters
	if (sanitized.length > 32) {
		sanitized = sanitized.substring(0, 32);
	}

	return sanitized;
}

/**
 * Format a list of emojis for display in an embed
 * @param emojis Array of emoji objects with id and name
 * @param maxLength Maximum characters to include
 * @returns Array of formatted emoji list strings, split if needed to fit in embed fields
 */
function formatEmojiList(
	emojis: Array<{ id: string; name: string }>,
	maxLength: number = 1024
): string[] {
	if (emojis.length === 0) return ['None found'];

	const formattedChunks: string[] = [''];
	let currentChunkIndex = 0;

	for (const emoji of emojis) {
		// Format as <:name:id>
		const emojiDisplay = `<:${emoji.name}:${emoji.id}> `;

		// Check if adding this would exceed the max length of a field
		if (formattedChunks[currentChunkIndex].length + emojiDisplay.length > maxLength) {
			// Start a new chunk
			currentChunkIndex++;
			formattedChunks[currentChunkIndex] = '';
		}

		formattedChunks[currentChunkIndex] += emojiDisplay;
	}

	return formattedChunks;
}

/**
 * emoji - Upload and register emojis to the guild
 * @see https://discord.js.org/#/docs/main/stable/class/SlashCommandBuilder
 */
const command: Command = {
	developer: true,
	// Command data used for registration and display
	data: new LocalizedSlashCommandBuilder()
		.setLocalizedName('commands.emoji.name')
		.setLocalizedDescription('commands.emoji.description'),

	// Command execution handler
	async execute(interaction: CommandInteraction, client: Client) {
		const locale = interaction.locale || 'en-US';
		// First, acknowledge the interaction to prevent timeout
		await interaction.deferReply({ ephemeral: true });

		// Get the list of emojis in the guild
		const emojis = await interaction.guild?.emojis.fetch();
		if (!emojis || !interaction.guild) {
			const errorEmbed = new EmbedBuilder()
				.setTitle('Error')
				.setDescription(client.getTranslation('commands.emoji.error', locale))
				.setColor(Colors.Red);
			await interaction.editReply({ embeds: [errorEmbed] });
			return;
		}

		// Check if the bot has permission to manage emojis
		const botMember = await interaction.guild.members.fetchMe();
		if (!botMember.permissions.has('ManageEmojisAndStickers')) {
			const permissionErrorEmbed = new EmbedBuilder()
				.setTitle('Permission Error')
				.setDescription(client.getTranslation('commands.emoji.permission_error', locale))
				.addFields({
					name: 'Required Permission',
					value: '`Manage Emojis and Stickers`',
				})
				.setColor(Colors.Red);
			await interaction.editReply({ embeds: [permissionErrorEmbed] });
			return;
		}

		// By default, upload all emojis
		await uploadAllEmojis(interaction, client, emojis);
	},
};

/**
 * Test emoji upload with a single emoji to diagnose issues
 */
async function _testEmojiUpload(
	interaction: CommandInteraction,
	client: Client,
	botMember: GuildMember
) {
	try {
		const testEmbed = new EmbedBuilder()
			.setTitle('Emoji Upload Test')
			.setDescription('Testing emoji upload functionality with a small test emoji...')
			.setColor(Colors.Blue)
			.setTimestamp();

		await interaction.editReply({ embeds: [testEmbed] });

		// Create a simple 1x1 pixel transparent PNG buffer (minimal size)
		// This is a valid 1x1 transparent PNG file in base64
		const base64Data =
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
		const testBuffer = Buffer.from(base64Data, 'base64');

		logger.debug({ size: testBuffer.length }, 'Attempting to upload test emoji');

		// Try with both buffer and URL methods
		try {
			const testEmoji = await interaction.guild?.emojis.create({
				name: 'test_emoji',
				attachment: testBuffer,
				reason: 'Testing emoji upload functionality',
			});

			if (testEmoji) {
				// Success! Update the embed
				const successEmbed = new EmbedBuilder()
					.setTitle('Test Successful')
					.setDescription(
						`Successfully uploaded test emoji: <:test_emoji:${testEmoji.id}>`
					)
					.setColor(Colors.Green)
					.addFields({ name: 'Emoji ID', value: testEmoji.id })
					.setTimestamp();

				await interaction.editReply({ embeds: [successEmbed] });

				// Clean up by deleting the test emoji
				setTimeout(async () => {
					try {
						await testEmoji.delete('Cleaning up test emoji');
						logger.debug('Deleted test emoji');
					} catch (error) {
						logger.error({ error }, 'Failed to delete test emoji');
					}
				}, 5000);

				return;
			}
		} catch (error) {
			logger.error({ error }, 'Failed to upload test emoji using buffer method');

			// Try with a URL method as fallback
			const testImageUrl = 'https://cdn.discordapp.com/emojis/859424401933082624.png';

			try {
				const urlTestEmoji = await interaction.guild?.emojis.create({
					name: 'test_emoji_url',
					attachment: testImageUrl,
					reason: 'Testing emoji upload with URL method',
				});

				if (urlTestEmoji) {
					const urlSuccessEmbed = new EmbedBuilder()
						.setTitle('URL Test Successful')
						.setDescription(
							`Successfully uploaded test emoji using URL method: <:test_emoji_url:${urlTestEmoji.id}>`
						)
						.setColor(Colors.Green)
						.addFields(
							{ name: 'Emoji ID', value: urlTestEmoji.id },
							{
								name: 'Note',
								value: 'Buffer method failed but URL method worked. This suggests an issue with local file handling.',
							}
						)
						.setTimestamp();

					await interaction.editReply({ embeds: [urlSuccessEmbed] });

					// Clean up
					setTimeout(async () => {
						try {
							await urlTestEmoji.delete('Cleaning up test emoji');
							logger.debug('Deleted test emoji (URL method)');
						} catch (error) {
							logger.error({ error }, 'Failed to delete test emoji (URL method)');
						}
					}, 5000);

					return;
				}
			} catch (urlError) {
				logger.error({ urlError }, 'Failed to upload test emoji using URL method');
			}
		}

		// If we get here, both methods failed
		const diagnosticInfo = {
			guildId: interaction.guild?.id,
			guildName: interaction.guild?.name,
			emojiCount: interaction.guild?.emojis.cache.size,
			botId: client.user?.id,
			permissions: botMember.permissions.toArray().join(', '),
			apiPing: client.ws.ping,
		};

		logger.debug(diagnosticInfo, 'Diagnostic information for emoji upload failure');

		const failureEmbed = new EmbedBuilder()
			.setTitle('Test Failed')
			.setDescription('Failed to upload test emoji using both buffer and URL methods.')
			.setColor(Colors.Red)
			.addFields(
				{ name: 'API Ping', value: `${client.ws.ping}ms`, inline: true },
				{
					name: 'Current Emoji Count',
					value: `${interaction.guild?.emojis.cache.size || 0}`,
					inline: true,
				},
				{
					name: 'Possible Issues',
					value:
						'• Discord API connection issues\n' +
						'• Server reached emoji limit\n' +
						'• Discord outage or high load\n' +
						'• Bot token permission issues',
				}
			)
			.setTimestamp();

		return interaction.editReply({ embeds: [failureEmbed] });
	} catch (error) {
		logger.error({ error }, 'Unexpected error in testEmojiUpload');
		return interaction.editReply({
			content: 'An unexpected error occurred while testing emoji uploads.',
		});
	}
}

/**
 * Upload all emojis to the guild
 */
async function uploadAllEmojis(interaction: CommandInteraction, client: Client, guildEmojis: any) {
	try {
		// Keep track of existing, reconciled, and new emojis for display
		const existingEmojis: Array<{ id: string; name: string }> = [];
		const reconciledEmojis: Array<{ id: string; name: string }> = [];
		const newlyAddedEmojis: Array<{ id: string; name: string }> = [];

		// Convert guild emojis to array for our tracking
		guildEmojis.forEach((emoji: any) => {
			if (emoji.name) {
				existingEmojis.push({
					id: emoji.id,
					name: emoji.name,
				});
			}
		});

		// Load all the emoji files
		let emojiFiles = await load('emojis', false, 'png');
		logger.debug({ emojiFiles }, 'Emoji files loaded');

		// Path to emojis.json
		const emojisJsonPath = path.join(process.cwd(), 'emojis', 'emojis.json');

		// Load the current emojis.json file
		let emojisJson;
		try {
			const emojisJsonContent = fs.readFileSync(emojisJsonPath, 'utf8');
			emojisJson = JSON.parse(emojisJsonContent);
		} catch (error: any) {
			const errorEmbed = new EmbedBuilder()
				.setTitle('Error')
				.setDescription('Error loading emojis.json file.')
				.addFields({ name: 'Details', value: error.message || 'Unknown error' })
				.setColor(Colors.Red);

			logger.error({ error }, 'Error loading emojis.json');
			return interaction.editReply({ embeds: [errorEmbed] });
		}

		// Check for emojis that are already on Discord but not in emojis.json
		let reconcileCount = 0;
		const reconciliationEmbed = new EmbedBuilder()
			.setTitle('Emoji Reconciliation')
			.setDescription('Checking for emojis that exist in Discord but not in emojis.json...')
			.setColor(Colors.Blue)
			.setTimestamp();

		await interaction.editReply({ embeds: [reconciliationEmbed] });

		// For each emoji in Discord, check if it needs to be added to emojis.json
		for (const [_id, emoji] of guildEmojis) {
			const emojiName = emoji.name;
			if (!emojiName) continue;

			// Use snake_case directly for the property name without converting to camelCase
			const propertyName = emojiName;

			// Check if this emoji exists in emojis.json but with an empty ID
			if (
				Object.prototype.hasOwnProperty.call(emojisJson, propertyName) &&
				(!emojisJson[propertyName] || emojisJson[propertyName] === '')
			) {
				// Update emojis.json with the ID
				emojisJson[propertyName] = emoji.id;

				// Track reconciled emoji
				reconciledEmojis.push({
					id: emoji.id,
					name: emojiName,
				});

				reconcileCount++;

				logger.debug(
					{ propertyName, emojiName, id: emoji.id },
					'Reconciled existing emoji'
				);
			}
		}

		// If we reconciled any emojis, save the updated emojis.json
		if (reconcileCount > 0) {
			try {
				fs.writeFileSync(emojisJsonPath, JSON.stringify(emojisJson, null, 2));
				logger.debug(`Saved ${reconcileCount} reconciled emoji IDs to emojis.json`);

				const reconcileEmbed = new EmbedBuilder()
					.setTitle('Emoji Reconciliation Complete')
					.setDescription(
						`Found and updated ${reconcileCount} emojis that already exist on Discord`
					)
					.setColor(Colors.Green)
					.setTimestamp();

				await interaction.editReply({ embeds: [reconcileEmbed] });

				// Wait a moment so the user can see the reconciliation results
				await new Promise((resolve) => setTimeout(resolve, 3000));
			} catch (error: any) {
				logger.error(
					{ errorMessage: error.message || 'Unknown error' },
					'Error saving reconciled emojis to emojis.json'
				);
			}
		}

		// Remove the files from emojiFiles that are already in the guild
		emojiFiles = emojiFiles.filter((file: string) => {
			const fileName = path.basename(file, '.png');
			return !guildEmojis.some((emoji: any) => emoji.name === fileName);
		});

		logger.debug({ emojiFiles, count: emojiFiles.length }, 'Filtered emoji files');

		if (emojiFiles.length === 0) {
			// Modified: No action required - show existing emojis
			const existingEmojiChunks = formatEmojiList(existingEmojis);
			const reconciledEmojiChunks =
				reconcileCount > 0 ? formatEmojiList(reconciledEmojis) : [];

			const noEmojisEmbed = new EmbedBuilder()
				.setTitle('No Action Required')
				.setDescription(
					`No new emojis to add. ${reconcileCount > 0 ? `(Reconciled ${reconcileCount} existing emojis)` : ''}`
				)
				.setColor(Colors.Blue);

			// Add fields for existing emojis
			if (existingEmojis.length > 0) {
				// Add the first chunk with the main field name
				noEmojisEmbed.addFields({
					name: `Existing Emojis (${existingEmojis.length})`,
					value: existingEmojiChunks[0],
				});

				// Add any additional chunks with continued field names
				for (let i = 1; i < existingEmojiChunks.length; i++) {
					noEmojisEmbed.addFields({
						name: `Existing Emojis (continued ${i + 1}/${existingEmojiChunks.length})`,
						value: existingEmojiChunks[i],
					});
				}
			}

			// Add fields for reconciled emojis if any
			if (reconcileCount > 0) {
				// Add the first chunk with the main field name
				noEmojisEmbed.addFields({
					name: `Reconciled Emojis (${reconciledEmojis.length})`,
					value: reconciledEmojiChunks[0],
				});

				// Add any additional chunks with continued field names
				for (let i = 1; i < reconciledEmojiChunks.length; i++) {
					noEmojisEmbed.addFields({
						name: `Reconciled Emojis (continued ${i + 1}/${reconciledEmojiChunks.length})`,
						value: reconciledEmojiChunks[i],
					});
				}
			}

			return interaction.editReply({ embeds: [noEmojisEmbed] });
		}

		// Keep track of how many emojis were added
		let addedCount = 0;
		let failedCount = 0;
		let retryCount = 0;

		// Set batch size and delay to avoid rate limiting
		const BATCH_SIZE = 2; // Further reduce batch size to 2 emojis at a time
		const DELAY_BETWEEN_BATCHES = 8000; // 8 seconds between batches
		const DELAY_BETWEEN_UPLOADS = 3000; // 3 seconds between individual uploads
		const EMOJI_CREATE_TIMEOUT = 20000; // 20 seconds timeout for emoji creation
		const MAX_EMOJI_SIZE = 256 * 1024; // 256KB maximum size for Discord emojis
		const MAX_RETRIES = 1; // Maximum number of retries per emoji

		// Function to wait for specified milliseconds
		const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		// Split emoji files into batches
		const batches = [];
		for (let i = 0; i < emojiFiles.length; i += BATCH_SIZE) {
			batches.push(emojiFiles.slice(i, i + BATCH_SIZE));
		}

		// Create initial status embed
		const statusEmbed = new EmbedBuilder()
			.setTitle('Emoji Upload')
			.setDescription(`Uploading ${emojiFiles.length} emojis in ${batches.length} batches...`)
			.addFields(
				{ name: 'Progress', value: createProgressBar(0, emojiFiles.length) },
				{ name: 'Status', value: 'Starting upload process...', inline: true },
				{ name: 'Added', value: '0', inline: true },
				{ name: 'Failed', value: '0', inline: true }
			)
			.setColor(Colors.Yellow)
			.setTimestamp();

		// Update the user about the process
		await interaction.editReply({ embeds: [statusEmbed] });

		// Process each batch with delays
		for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
			const batch = batches[batchIndex];
			let currentEmojiName = ''; // Track the current emoji being processed

			logger.debug(
				{ batchIndex, totalBatches: batches.length, batchSize: batch.length },
				'Processing emoji batch'
			);

			// Update status embed for new batch
			const batchStatusEmbed = new EmbedBuilder()
				.setTitle('Emoji Upload')
				.setDescription(`Processing batch ${batchIndex + 1} of ${batches.length}`)
				.addFields(
					{
						name: 'Progress',
						value: createProgressBar(batchIndex * BATCH_SIZE, emojiFiles.length),
					},
					{
						name: 'Status',
						value: `Batch ${batchIndex + 1}/${batches.length}`,
						inline: true,
					},
					{ name: 'Added', value: `${addedCount}`, inline: true },
					{ name: 'Failed', value: `${failedCount}`, inline: true },
					{ name: 'Current', value: 'Starting batch...', inline: false }
				)
				.setColor(Colors.Yellow)
				.setTimestamp();

			await interaction.editReply({ embeds: [batchStatusEmbed] });

			// Process each emoji in the batch
			for (const file of batch) {
				// Get the emoji name early for display purposes
				currentEmojiName = path.basename(file, '.png');
				const sanitizedName = sanitizeEmojiName(currentEmojiName);

				// Log if name was sanitized
				if (sanitizedName !== currentEmojiName) {
					logger.debug(
						{
							original: currentEmojiName,
							sanitized: sanitizedName,
						},
						'Emoji name sanitized to meet Discord requirements'
					);
				}

				// Update the embed to show what we're currently processing
				const processingEmbed = new EmbedBuilder()
					.setTitle('Emoji Upload')
					.setDescription(`Processing batch ${batchIndex + 1} of ${batches.length}`)
					.addFields(
						{
							name: 'Progress',
							value: createProgressBar(
								batchIndex * BATCH_SIZE + batch.indexOf(file),
								emojiFiles.length
							),
						},
						{
							name: 'Current',
							value:
								`Processing: ${currentEmojiName}` +
								(sanitizedName !== currentEmojiName
									? ` (will be uploaded as: ${sanitizedName})`
									: ''),
							inline: false,
						},
						{
							name: 'Status',
							value: `Batch ${batchIndex + 1}/${batches.length}`,
							inline: true,
						},
						{ name: 'Added', value: `${addedCount}`, inline: true },
						{ name: 'Failed', value: `${failedCount}`, inline: true }
					)
					.setColor(Colors.Yellow)
					.setTimestamp();

				await interaction.editReply({ embeds: [processingEmbed] });

				// Try uploading the emoji with retries if needed
				let success = false;
				let emoji = null;
				let attempts = 0;

				while (!success && attempts <= MAX_RETRIES) {
					attempts++;

					try {
						// Check if file exists
						if (!fs.existsSync(file)) {
							logger.error({ file }, 'Emoji file does not exist');
							failedCount++;
							break;
						}

						// Read file into buffer first
						const fileBuffer = fs.readFileSync(file);

						// Check file size
						if (fileBuffer.length > MAX_EMOJI_SIZE) {
							logger.error(
								{ file, size: fileBuffer.length },
								`Emoji file too large (${fileBuffer.length} bytes, max ${MAX_EMOJI_SIZE} bytes)`
							);
							failedCount++;
							break;
						}

						logger.debug(
							{ file, size: fileBuffer.length, attempt: attempts },
							'Attempting to create emoji'
						);

						// Wrap emoji creation in a try-catch block to better handle specific errors
						try {
							// Use Promise.race to add timeout to emoji creation
							emoji = await Promise.race([
								interaction.guild?.emojis.create({
									name: sanitizedName,
									attachment: fileBuffer,
									reason: 'Auto-uploaded by BerryBot',
								}),
								timeout(EMOJI_CREATE_TIMEOUT),
							]);

							if (!emoji) {
								throw new Error('Emoji creation returned null');
							}

							// Successfully uploaded the emoji
							success = true;

							// Use the original name directly without converting to camelCase
							const emojiPropertyName = currentEmojiName;

							logger.debug(
								{
									emojiName: emoji.name,
									emojiId: emoji.id,
									propertyName: emojiPropertyName,
									originalName: currentEmojiName,
									sanitizedName: sanitizedName,
								},
								'Emoji created successfully'
							);

							// Update the emojis.json with the new emoji ID
							if (
								Object.prototype.hasOwnProperty.call(emojisJson, emojiPropertyName)
							) {
								emojisJson[emojiPropertyName] = emoji.id;
								addedCount++;

								// Track newly added emoji
								newlyAddedEmojis.push({
									id: emoji.id,
									name: emoji.name || sanitizedName,
								});

								logger.debug(
									{ emoji, property: emojiPropertyName },
									'Emoji created and registered'
								);

								// Save json after each successful emoji to prevent loss on error
								fs.writeFileSync(
									emojisJsonPath,
									JSON.stringify(emojisJson, null, 2)
								);

								// Update status display after successful upload
								const successEmbed = new EmbedBuilder()
									.setTitle('Emoji Upload')
									.setDescription(
										`Processing batch ${batchIndex + 1} of ${batches.length}`
									)
									.addFields(
										{
											name: 'Progress',
											value: createProgressBar(
												batchIndex * BATCH_SIZE + batch.indexOf(file) + 1,
												emojiFiles.length
											),
										},
										{
											name: 'Current',
											value:
												`Successfully uploaded: ${currentEmojiName}` +
												(sanitizedName !== currentEmojiName
													? ` (as: ${sanitizedName})`
													: ''),
											inline: false,
										},
										{
											name: 'Next',
											value:
												batch.indexOf(file) < batch.length - 1
													? path.basename(
															batch[batch.indexOf(file) + 1],
															'.png'
														)
													: 'Finishing batch...',
											inline: false,
										},
										{
											name: 'Status',
											value: `Batch ${batchIndex + 1}/${batches.length}`,
											inline: true,
										},
										{ name: 'Added', value: `${addedCount}`, inline: true },
										{ name: 'Failed', value: `${failedCount}`, inline: true }
									)
									.setColor(Colors.Green)
									.setTimestamp();

								await interaction.editReply({ embeds: [successEmbed] });
							} else {
								logger.warn(
									{ emojiPropertyName, fileName: sanitizedName },
									'Property not found in emojis.json'
								);
							}
						} catch (error: any) {
							const errorMessage = error.message || 'Unknown error';
							logger.error(
								{
									file,
									errorMessage,
									stack: error.stack || 'No stack trace',
									attempt: attempts,
								},
								'Error creating emoji'
							);

							// Only increment failed count on final attempt
							if (attempts > MAX_RETRIES) {
								failedCount++;
								logger.error({ file, attempts }, 'All attempts failed for emoji');
							} else {
								retryCount++;
								// Special handling for specific error types
								if (errorMessage.includes('timed out')) {
									logger.error(
										{ file },
										'Emoji creation timed out - Discord API may be slow or under heavy load'
									);
									await wait(DELAY_BETWEEN_UPLOADS * 2); // Wait longer before retry
								} else if (errorMessage.includes('rate limit')) {
									logger.error(
										{ file },
										'Hit Discord rate limit - increasing wait time'
									);
									await wait(DELAY_BETWEEN_UPLOADS * 3); // Wait much longer if rate limited
								} else {
									await wait(DELAY_BETWEEN_UPLOADS); // Standard wait before retry
								}
							}
						}
					} catch (outerError: any) {
						logger.error(
							{
								file,
								errorMessage: outerError.message,
								stack: outerError.stack,
								attempt: attempts,
							},
							'Unexpected error in emoji upload loop'
						);

						if (attempts > MAX_RETRIES) {
							failedCount++;
						}

						await wait(DELAY_BETWEEN_UPLOADS);
					}
				}

				// Handle failed emoji uploads
				if (!success) {
					const failedEmbed = new EmbedBuilder()
						.setTitle('Emoji Upload')
						.setDescription(`Processing batch ${batchIndex + 1} of ${batches.length}`)
						.addFields(
							{
								name: 'Progress',
								value: createProgressBar(
									batchIndex * BATCH_SIZE + batch.indexOf(file) + 1,
									emojiFiles.length
								),
							},
							{
								name: 'Current',
								value: `Failed to upload: ${currentEmojiName} after ${attempts} attempt(s)`,
								inline: false,
							},
							{
								name: 'Next',
								value:
									batch.indexOf(file) < batch.length - 1
										? path.basename(batch[batch.indexOf(file) + 1], '.png')
										: 'Finishing batch...',
								inline: false,
							},
							{
								name: 'Status',
								value: `Batch ${batchIndex + 1}/${batches.length}`,
								inline: true,
							},
							{ name: 'Added', value: `${addedCount}`, inline: true },
							{ name: 'Failed', value: `${failedCount}`, inline: true }
						)
						.setColor(Colors.Red)
						.setTimestamp();

					await interaction.editReply({ embeds: [failedEmbed] });
				}

				// Wait between individual uploads
				logger.debug('Waiting between uploads');
				await wait(DELAY_BETWEEN_UPLOADS);
			}

			// Update progress after each batch
			if (batches.length > 1) {
				const batchCompletedEmbed = new EmbedBuilder()
					.setTitle('Emoji Upload')
					.setDescription(`Batch ${batchIndex + 1}/${batches.length} completed`)
					.addFields(
						{
							name: 'Progress',
							value: createProgressBar(
								(batchIndex + 1) * BATCH_SIZE,
								emojiFiles.length
							),
						},
						{ name: 'Last Processed', value: currentEmojiName, inline: false },
						{
							name: 'Status',
							value: `Batch ${batchIndex + 1}/${batches.length} complete`,
							inline: true,
						},
						{ name: 'Added', value: `${addedCount}`, inline: true },
						{ name: 'Failed', value: `${failedCount}`, inline: true },
						{
							name: 'Next Batch',
							value:
								batchIndex < batches.length - 1
									? `Starting in ${DELAY_BETWEEN_BATCHES / 1000} seconds...`
									: 'All batches complete',
							inline: false,
						}
					)
					.setColor(Colors.Yellow)
					.setTimestamp();

				await interaction.editReply({ embeds: [batchCompletedEmbed] });
			}

			// Wait between batches if not the last batch
			if (batchIndex < batches.length - 1) {
				logger.debug('Waiting between batches');
				await wait(DELAY_BETWEEN_BATCHES);
			}
		}

		// Save a final version of the JSON file
		try {
			fs.writeFileSync(emojisJsonPath, JSON.stringify(emojisJson, null, 2));
			logger.debug('Saved final emojis.json');
		} catch (error: any) {
			logger.error(
				{ errorMessage: error.message || 'Unknown error' },
				'Error saving final emojis.json'
			);
		}

		// Modified: Final reply with results including emoji lists
		const completionColor = failedCount > 0 ? Colors.Orange : Colors.Green;
		const completionEmbed = new EmbedBuilder()
			.setTitle('Emoji Upload Complete')
			.setDescription(`Upload process finished`)
			.addFields(
				{
					name: 'Progress',
					value: createProgressBar(emojiFiles.length, emojiFiles.length),
				},
				{
					name: 'Final Results',
					value:
						failedCount > 0
							? `Completed with some failures`
							: `All emojis uploaded successfully`,
					inline: false,
				},
				{ name: 'Added', value: `${addedCount}`, inline: true },
				{ name: 'Failed', value: `${failedCount}`, inline: true },
				{ name: 'Retries', value: `${retryCount}`, inline: true },
				{ name: 'Total', value: `${emojiFiles.length}`, inline: true }
			)
			.setColor(completionColor)
			.setTimestamp();

		// Add existing and new emoji fields
		if (existingEmojis.length > 0) {
			const existingEmojiChunks = formatEmojiList(existingEmojis);

			// Add the first chunk with the main field name
			completionEmbed.addFields({
				name: `Existing Emojis (${existingEmojis.length})`,
				value: existingEmojiChunks[0],
			});

			// Add any additional chunks with continued field names
			for (let i = 1; i < existingEmojiChunks.length; i++) {
				completionEmbed.addFields({
					name: `Existing Emojis (continued ${i + 1}/${existingEmojiChunks.length})`,
					value: existingEmojiChunks[i],
				});
			}
		}

		if (reconciledEmojis.length > 0) {
			const reconciledEmojiChunks = formatEmojiList(reconciledEmojis);

			// Add the first chunk with the main field name
			completionEmbed.addFields({
				name: `Reconciled Emojis (${reconciledEmojis.length})`,
				value: reconciledEmojiChunks[0],
			});

			// Add any additional chunks with continued field names
			for (let i = 1; i < reconciledEmojiChunks.length; i++) {
				completionEmbed.addFields({
					name: `Reconciled Emojis (continued ${i + 1}/${reconciledEmojiChunks.length})`,
					value: reconciledEmojiChunks[i],
				});
			}
		}

		if (newlyAddedEmojis.length > 0) {
			const newEmojiChunks = formatEmojiList(newlyAddedEmojis);

			// Add the first chunk with the main field name
			completionEmbed.addFields({
				name: `Newly Added Emojis (${newlyAddedEmojis.length})`,
				value: newEmojiChunks[0],
			});

			// Add any additional chunks with continued field names
			for (let i = 1; i < newEmojiChunks.length; i++) {
				completionEmbed.addFields({
					name: `Newly Added Emojis (continued ${i + 1}/${newEmojiChunks.length})`,
					value: newEmojiChunks[i],
				});
			}
		}

		return interaction.editReply({ embeds: [completionEmbed] });
	} catch (error: any) {
		logger.error({ error }, 'Unexpected error in emoji command');
		const unexpectedErrorEmbed = new EmbedBuilder()
			.setTitle('Unexpected Error')
			.setDescription('An unexpected error occurred while processing emoji uploads.')
			.addFields({ name: 'Details', value: error.message || 'Unknown error' })
			.setColor(Colors.Red);

		return interaction.editReply({ embeds: [unexpectedErrorEmbed] });
	}
}

module.exports = command;
