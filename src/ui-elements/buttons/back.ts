// TODO: Add a back button that goes back to the previous menu
// TODO: Add a backPage option to button custom_ids
// TODO: Redo button custom_ids to be easier to read and write
// Olde custom_id format: 'button-name["label"]'
/**
 * New custom_id format: 'button-name[customOptions]', the new format will have support for different options based on the purpose of the button (ie. a back button, edit button, etc.)
 * For example, instead of just having a label on the button for the category of roles, you could specify 'role-select[category: "pronoun"]'.
 *
 * The button execute function would look something like this:
 *
 * @example
 * custom_id = 'back[previousPage: "role-category-view[category: \"Pronouns\"]"]'
 * execute(...args[], options: any) // options => { previousPage: 'role-category-view[category: "Pronouns"]' }
 *
 * @example
 * custom_id = 'button-name[option1: "value1", option2: "value2[value2_option: \"example\"]"]'
 * execute(...args[], options: any) // options => { option1: 'value1', option2: 'value2[value2_option: "example"]' }
 */
function newButtonFormat() {}
