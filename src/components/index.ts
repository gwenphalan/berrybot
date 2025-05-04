import { MessageComponent as TestButton } from './buttons/test';
import { MessageComponent as TestModal } from './modals/test-modal';
import { MessageComponent as TestSelect } from './selectMenus/test-select';
import { MessageComponent as TestMultiSelect } from './selectMenus/test-multi-select';
import { MessageComponent as BackButton } from './buttons/paginator/back';
import { MessageComponent as NextButton } from './buttons/paginator/next';
import { MessageComponent as CloseButton } from './buttons/paginator/close';
import { MessageComponent as Create } from './buttons/roles/config-main-menu/create';
import { MessageComponent as Edit } from './buttons/roles/config-main-menu/edit';
import { MessageComponent as Message } from './buttons/roles/config-main-menu/message';
import { MessageComponent as Name } from './buttons/roles/category-edit/name';
import { MessageComponent as Roles } from './buttons/roles/category-edit/roles';
import { MessageComponent as Emoji } from './buttons/roles/category-edit/emoji';
import { MessageComponent as Delete } from './buttons/roles/category-edit/delete';
import { MessageComponent as CategorySelect } from './selectMenus/roles/category-select';
import { MessageComponent as RoleSelect } from './selectMenus/roles/role-select';
import { MessageComponent as ChannelSelect } from './selectMenus/roles/channel-select';
import { MessageComponent as CategoryDeleteConfirmation } from './modals/roles/category-delete-confirmation';
import { MessageComponent as CategoryNameInput } from './modals/roles/category-name-input';
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

export { MessageComponent as Test_Button } from './buttons/test';
export { MessageComponent as Test_Modal } from './modals/test-modal';
export { MessageComponent as Test_Select } from './selectMenus/test-select';
export { MessageComponent as Test_MultiSelect } from './selectMenus/test-multi-select';
export { MessageComponent as Paginator_BackButton } from './buttons/paginator/back';
export { MessageComponent as Paginator_NextButton } from './buttons/paginator/next';
export { MessageComponent as Paginator_CloseButton } from './buttons/paginator/close';
export { MessageComponent as Roles_ConfigMainMenu_Create } from './buttons/roles/config-main-menu/create';
export { MessageComponent as Roles_ConfigMainMenu_Edit } from './buttons/roles/config-main-menu/edit';
export { MessageComponent as Roles_ConfigMainMenu_Message } from './buttons/roles/config-main-menu/message';
export { MessageComponent as Roles_CategoryEdit_Name } from './buttons/roles/category-edit/name';
export { MessageComponent as Roles_CategoryEdit_Roles } from './buttons/roles/category-edit/roles';
export { MessageComponent as Roles_CategoryEdit_Emoji } from './buttons/roles/category-edit/emoji';
export { MessageComponent as Roles_CategoryEdit_Delete } from './buttons/roles/category-edit/delete';
export { MessageComponent as Roles_CategorySelect } from './selectMenus/roles/category-select';
export { MessageComponent as Roles_RoleSelect } from './selectMenus/roles/role-select';
export { MessageComponent as Roles_ChannelSelect } from './selectMenus/roles/channel-select';
export { MessageComponent as Roles_CategoryDeleteConfirmation } from './modals/roles/category-delete-confirmation';
export { MessageComponent as Roles_CategoryNameInput } from './modals/roles/category-name-input';
