import type { CircularEconomy } from 'ceml-language';
import { createCemlServices, CemlLanguageMetaData } from 'ceml-language';
import chalk from 'chalk';
import { Command } from 'commander';
import { extractAstNode } from './util.js';
import { generateOutput } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (source: string, destination: string, format: string): Promise<void> => {
    const services = createCemlServices(NodeFileSystem).Ceml;
    const model = await extractAstNode<CircularEconomy>(source, services);
    const generatedFilePath = generateOutput(model, destination, format);
    console.log(chalk.green(`Code generated succesfully: ${generatedFilePath}`));
};

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = CemlLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .argument('<destination>', 'destination file')
        .argument('<format>', 'output format: json | sql | sql-schema | sql-insert | plantuml')
        .description('Generates code in a specific format for a provided source file.')
        .action(generateAction);

    program.parse(process.argv);
}
