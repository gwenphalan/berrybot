/**
 * Converts a time string into milliseconds
 * @param duration  The time string to convert (e.g. 1h 30m 10s)
 * @returns The time in milliseconds (e.g. 5430000)
 * @example
 * parseDuration('1h 30m 10s'); // returns 5430000
 * parseDuration('1h'); // returns 3600000
 * parseDuration('30m'); // returns 1800000
 */
export function parseDuration(duration: string): number {
    // if string is empty, return null
    if (!duration) return 0;

    // Split the duration into an array of strings.
    const regex = /(\d+)([a-z])/g;

    // Create an array of arrays, where each array contains the number and the unit.
    const units = duration.match(regex);

    // If the duration is invalid, return 0.
    let milliseconds = 0;

    // Loop through the array of arrays.
    units?.forEach(units => {
        // Get the number and unit.
        const number = units.match(/(\d+)([smhdw])/);

        // If the number is invalid return.
        if (!number) return;

        // Put the number and unit into variables.
        const count = parseInt(number[1]);
        const unit = number[2];

        // Convert the unit into milliseconds.
        switch (unit) {
            case 's': {
                return (milliseconds += count * 1000);
            }
            case 'm': {
                return (milliseconds += count * 60000);
            }
            case 'h': {
                return (milliseconds += count * 3600000);
            }
            case 'd': {
                return (milliseconds += count * 86400000);
            }
            case 'w': {
                return (milliseconds += count * 604800000);
            }
            default:
                return 0;
        }
    });

    // Return the duration in milliseconds.
    return milliseconds;
}

// Returns a string of the duration. (e.g. 60000ms = 1 minute, 3660000ms = 1 hour 1 minute, 90060000ms = 1 day 1 hour 1 minute)

/**
 * Format a duration in milliseconds into a readable string.
 * @param duration The duration in milliseconds (eg. 60000)
 * @returns The duration in a string (eg. 1h 30m 10s)
 * @example
 * formatDuration(60000); // returns 1m
 * formatDuration(3660000); // returns 1h 1m
 * formatDuration(90060000); // returns 1d 1h 1m
 * formatDuration(90000000); // returns 1d 1h
 */
export function formatDuration(duration: number): string {
    // If the duration is 0, return 0.
    if (duration === 0) return '0';

    // Create an array of arrays, where each array contains the number and the unit.
    const units: string[] = [];

    // Create an array of units.
    const unitNames = ['week', 'day', 'hour', 'minute', 'second'];

    // Create an array of milliseconds.
    const unitMilliseconds = [604800000, 86400000, 3600000, 60000, 1000];

    // Loop through the array of milliseconds.
    unitMilliseconds.forEach((unit, index) => {
        // If the duration is greater than the unit, add the unit to the array.
        if (duration >= unit) {
            // Get the number of units.
            const numberOfUnits = Math.floor(duration / unit);

            // Add the unit to the array.
            units.push(numberOfUnits + ' ' + unitNames[index] + (numberOfUnits > 1 ? 's' : ''));

            // Remove the number of milliseconds from the duration.
            duration -= numberOfUnits * unit;
        }
    });

    // If the array is empty, return 0.
    if (units.length === 0) return '0';

    // Return the array as a string.
    return units.join(', ');
}