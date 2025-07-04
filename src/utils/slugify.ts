export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[\s\_\-]+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}
