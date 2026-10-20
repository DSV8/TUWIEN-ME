import type { CircularEconomy } from 'ceml-language';
import { extractDestinationAndName } from './util.js';
import { getGenerator } from './generator/index.js';
import * as fs from 'node:fs';

export function generateOutput(model: CircularEconomy, destination: string, format: string): string {
    const data = extractDestinationAndName(destination);
    const generator = getGenerator(format);
    const output = generator.generate(model);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(destination, output);

    return destination;
}
