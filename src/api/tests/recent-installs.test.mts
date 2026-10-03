import { describe, expect, it } from 'vitest'

import { createRecentInstalls } from '../src/bot/recent-installs.mts'

describe('recent installs', () => {
	it('remembers a conversation for the length of the window, then forgets it', () => {
		let now = 0
		const installs = createRecentInstalls({ windowMs: 1000, now: () => now })

		installs.add('conversation')
		now = 1000
		expect(installs.has('conversation')).toBe(true)

		now = 1001
		expect(installs.has('conversation')).toBe(false)
	})

	it('only knows the conversations it was told about', () => {
		const installs = createRecentInstalls({ windowMs: 1000 })
		installs.add('conversation')

		expect(installs.has('another conversation')).toBe(false)
	})
})
