import TestButton from './buttons/test';
import TestModal from './modals/test-modal';
import TestSelect from './selectMenus/test-select';
import TestMultiSelect from './selectMenus/test-multi-select';
import BackButton from './buttons/paginator/back';
import NextButton from './buttons/paginator/next';
import CloseButton from './buttons/paginator/close';
import Create from './buttons/roles/config-main-menu/create';
import Edit from './buttons/roles/config-main-menu/edit';
import Message from './buttons/roles/config-main-menu/message';
import Name from './buttons/roles/category-edit/name';
import Roles from './buttons/roles/category-edit/roles';
import Emoji from './buttons/roles/category-edit/emoji';
import Delete from './buttons/roles/category-edit/delete';
import CategorySelect from './selectMenus/roles/category-select';
import RoleSelect from './selectMenus/roles/role-select';
import ChannelSelect from './selectMenus/roles/channel-select';
import CategoryDeleteConfirmation from './modals/roles/category-delete-confirmation';
import CategoryNameInput from './modals/roles/category-name-input';
export default {
	Buttons: {
		Roles: {
			ConfigMainMenu: {
				Create,
				Edit,
				Message,
			},
			CategoryEdit: {
				Name,
				Roles,
				Emoji,
				Delete,
			},
		},
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
		Roles: {
			CategorySelect,
			RoleSelect,
			ChannelSelect,
		},
		Test: {
			TestSelect,
			TestMultiSelect,
		},
	},
	Modals: {
		Roles: {
			CategoryDeleteConfirmation,
			CategoryNameInput,
		},
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
export { default as Roles_ConfigMainMenu_Create } from './buttons/roles/config-main-menu/create';
export { default as Roles_ConfigMainMenu_Edit } from './buttons/roles/config-main-menu/edit';
export { default as Roles_ConfigMainMenu_Message } from './buttons/roles/config-main-menu/message';
export { default as Roles_CategoryEdit_Name } from './buttons/roles/category-edit/name';
export { default as Roles_CategoryEdit_Roles } from './buttons/roles/category-edit/roles';
export { default as Roles_CategoryEdit_Emoji } from './buttons/roles/category-edit/emoji';
export { default as Roles_CategoryEdit_Delete } from './buttons/roles/category-edit/delete';
export { default as Roles_CategorySelect } from './selectMenus/roles/category-select';
export { default as Roles_RoleSelect } from './selectMenus/roles/role-select';
export { default as Roles_ChannelSelect } from './selectMenus/roles/channel-select';
export { default as Roles_CategoryDeleteConfirmation } from './modals/roles/category-delete-confirmation';
export { default as Roles_CategoryNameInput } from './modals/roles/category-name-input';
