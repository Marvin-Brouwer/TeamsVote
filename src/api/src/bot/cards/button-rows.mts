/**
 * Splits buttons over as few rows as `maxPerRow` allows, as evenly as possible: only the last row can come up short,
 * and by as little as possible. Teams shows a handful of buttons per row before it hides the rest behind "…".
 *
 * @example
 * ```ts
 * inRows([...'abcdefghijkl'], 5) // 3 rows of 4
 * inRows([...'abcdefghijk'], 5)  // 4 + 4 + 3
 * ```
 */
export function inRows<T>(items: readonly T[], maxPerRow: number): T[][] {
	if (items.length === 0) return []
	const rowCount = Math.ceil(items.length / Math.max(1, Math.floor(maxPerRow)))
	const perRow = Math.ceil(items.length / rowCount)

	const rows: T[][] = []
	for (let start = 0; start < items.length; start += perRow) rows.push(items.slice(start, start + perRow))
	return rows
}
