import TestButton from './buttons/test';
import TestModal from './modals/test-modal';
import TestSelect from './selectMenus/test-select';
import TestMultiSelect from './selectMenus/test-multi-select';
import BackButton from './buttons/paginator/back';
import NextButton from './buttons/paginator/next';
import CloseButton from './buttons/paginator/close';
export default {
	Buttons: {
		Paginator: {
			BackButton,
			NextButton,
			CloseButton,
		},
		Test: {
			TestButton,
		},
	},
	SelectMenus: {
		Test: {
			TestSelect,
			TestMultiSelect,
		},
	},
	Modals: {
		Test: {
			TestModal,
		},
	},
};

export { default as Test_Button } from './buttons/test';
export { default as Test_Modal } from './modals/test-modal';
export { default as Test_Select } from './selectMenus/test-select';
export { default as Test_MultiSelect } from './selectMenus/test-multi-select';
export { default as Paginator_BackButton } from './buttons/paginator/back';
export { default as Paginator_NextButton } from './buttons/paginator/next';
export { default as Paginator_CloseButton } from './buttons/paginator/close';
