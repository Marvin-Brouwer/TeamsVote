import { route } from '@rooted/router/routes'

export const PrivacyRoute = route`/privacy/`({
	async resolve({ create }) {
		const [{ LegalPage }, privacy] = await Promise.all([
			import('./legal-page.mts'),
			import('../../../../doc/privacy-policy.md'),
		])
		return create(LegalPage, { source: privacy })
	},
	seo: {
		title: 'Privacy policy',
		description: 'How TVote handles personal data.',
	},
})

export const TermsRoute = route`/terms/`({
	async resolve({ create }) {
		const [{ LegalPage }, terms] = await Promise.all([
			import('./legal-page.mts'),
			import('../../../../doc/tos.md'),
		])
		return create(LegalPage, { source: terms })
	},
	seo: {
		title: 'Terms of service',
		description: 'The terms for using TVote.',
	},
})
