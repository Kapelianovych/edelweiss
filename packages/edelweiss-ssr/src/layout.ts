export interface LayoutOptions {
	body?: string;
	head?: string;
	language?: string;
}

export const layout = ({
	body = '',
	head = '',
	language = 'en',
}: LayoutOptions = {}): string =>
	`<!DOCTYPE html>
		<html lang="${language}">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				
				${head}
			</head>
			<body>
				${body}
			</body>
		</html>`;
