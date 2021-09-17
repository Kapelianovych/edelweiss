import { html, render } from '@prostory/edelweiss';

const home = html`
	<h1>Welcome to Edelweiss</h1>
	<nav>
		<a
			target="_blank"
			href="https://github.com/YevhenKap/edelweiss/packages/edelweiss"
		>
			Edelweiss
		</a>
		<a
			target="_blank"
			href="https://github.com/YevhenKap/edelweiss/packages/edelweiss-ssr"
		>
			Edelweiss SSR
		</a>
		<a
			target="_blank"
			href="https://github.com/YevhenKap/edelweiss/packages/edelweiss-cli"
		>
			Edelweiss CLI
		</a>
	</nav>
`;

render(document.body, home);
