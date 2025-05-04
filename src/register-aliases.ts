import 'module-alias/register';
import { addAliases } from 'module-alias';

// Register aliases for both development and production
addAliases({
	'@': __dirname,
});
