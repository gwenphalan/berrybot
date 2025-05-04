import 'module-alias/register';
import { addAliases } from 'module-alias';
import * as path from 'path';

// Register aliases for both development and production
addAliases({
	'@': path.join(__dirname),
});
