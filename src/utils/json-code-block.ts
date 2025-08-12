export function JSONCodeBlock(data: any) {
    return `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
}