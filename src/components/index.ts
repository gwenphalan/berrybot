import TestButton from './buttons/test';
import TestModal from './modals/test-modal';
import TestSelect from './selectMenus/test-select';
import TestMultiSelect from './selectMenus/test-multi-select';
import BackButton from './buttons/paginator/back';
import NextButton from './buttons/paginator/next';
import CloseButton from './buttons/paginator/close';

export const buttons = {
	TestButton,
	Paginator: {
		BackButton,
		NextButton,
		CloseButton,
	},
};

export const modals = {
	TestModal,
};

export const selectMenus = {
	TestSelect,
	TestMultiSelect,
};

export default {
	...buttons,
	...modals,
	...selectMenus,
};
