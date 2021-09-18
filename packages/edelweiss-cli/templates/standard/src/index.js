import { html, render } from '@prostory/edelweiss';

const home = html`
	<h1>Welcome to Edelweiss</h1>
	<nav>
		<a target="_blank" href="https://github.com/YevhenKap/edelweiss">
			Edelweiss code/docs
		</a>
	</nav>
`;

render(document.body, home);
