import type {
	Badge,
	Button,
	Divider,
	Dropdown,
	DropdownOption,
	Field,
	Label,
	Listbox,
	MessageBar,
	Spinner,
	TextInput,
	ToggleButton,
} from '@fluentui/web-components'

/*
 * Fluent doesn't register its tags with TypeScript, and rooted's `element()` only takes known tags.
 * Every element defined in `fluent.mts` gets an entry here.
 */
declare global {
	// An interface, because it has to merge with the DOM's own.
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface HTMLElementTagNameMap {
		'fluent-badge': Badge
		'fluent-button': Button
		'fluent-divider': Divider
		'fluent-dropdown': Dropdown
		'fluent-field': Field
		'fluent-label': Label
		'fluent-listbox': Listbox
		'fluent-message-bar': MessageBar
		'fluent-option': DropdownOption
		'fluent-spinner': Spinner
		'fluent-text-input': TextInput
		'fluent-toggle-button': ToggleButton
	}
}
