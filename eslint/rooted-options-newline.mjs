/**
 * The options of rooted's `element`, `create` and `component`, and the objects inside them, put every field on its own line,
 * so element trees read top to bottom. An object written on one line is fixed automatically; anything else is only reported.
 */
const rootedCalls = new Set(['element', 'create', 'component'])

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'layout',
		fixable: 'whitespace',
		messages: {
			fieldPerLine: 'Put every field of a rooted element or component on its own line.',
		},
		schema: [],
	},
	create(context) {
		const { sourceCode } = context

		function isRootedOptions(node) {
			const parent = node.parent
			if (parent.type === 'CallExpression') {
				return parent.arguments.includes(node) && parent.callee.type === 'Identifier' && rootedCalls.has(parent.callee.name)
			}
			return parent.type === 'Property' && parent.value === node && isRootedOptions(parent.parent)
		}

		// Every field starts on a later line than where the one before it ended, and the closing brace gets its own line.
		function isFieldPerLine(node) {
			let previousEnd = sourceCode.getFirstToken(node).loc.end.line
			for (const property of node.properties) {
				if (property.loc.start.line <= previousEnd) return false
				previousEnd = property.loc.end.line
			}
			return sourceCode.getLastToken(node).loc.start.line > previousEnd
		}

		return {
			ObjectExpression(node) {
				if (node.properties.length === 0 || !isRootedOptions(node) || isFieldPerLine(node)) return

				const singleLine = node.loc.start.line === node.loc.end.line
				context.report({
					node,
					messageId: 'fieldPerLine',
					fix: singleLine
						? fixer => {
							const indent = /^\s*/.exec(sourceCode.lines[node.loc.start.line - 1])[0]
							const fields = node.properties.map(property => `${indent}\t${sourceCode.getText(property)},\n`)
							return fixer.replaceText(node, `{\n${fields.join('')}${indent}}`)
						}
						: undefined,
				})
			},
		}
	},
}
