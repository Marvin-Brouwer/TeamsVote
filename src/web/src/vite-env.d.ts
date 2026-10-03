/// <reference types="vite/client" />
/// <reference types="@rooted/components/types" />
/// <reference types="@rooted/router/types" />
/// <reference types="@rooted/markdown/types" />

// An interface, because it has to merge with the one Vite declares.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMetaEnv {
	/** Origin of the TVote API on Render, like `https://teamsvote.onrender.com`. */
	readonly VITE_API_URL: string
}
