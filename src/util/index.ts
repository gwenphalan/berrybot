import { colorToHex, getAverageColor, getDominantColor, rgbToHex, hexToRGB } from './colorUtil';
import loadFiles from './fileLoader';
import { getRegionNameAndEmoji } from './regionUtil';
import { formatDuration, parseDuration } from './timeUtilities';

export default {
    files: {
        loadFiles
    },
    color: {
        colorToHex,
        getAverageColor,
        getDominantColor,
        rgbToHex,
        hexToRGB
    },
    region: {
        getRegionNameAndEmoji
    },
    time: {
        formatDuration,
        parseDuration
    }
};
