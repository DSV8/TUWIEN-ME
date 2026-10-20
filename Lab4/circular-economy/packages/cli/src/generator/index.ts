import { JsonGenerator } from './generator-json.js';
import { SqlGenerator } from './generator-sql.js';
import { SqlSchemaGenerator } from './generator-sql-schema.js';
import { SqlInsertGenerator } from './generator-sql-insert.js';
import { PlantUmlGenerator } from './generator-plantuml.js';
import { CircularEconomy } from 'ceml-language';

export interface Generator {
    generate(model: CircularEconomy): string;
}

export function getGenerator(format: string): Generator {
    switch (format.toLowerCase()) {
        case 'json': return new JsonGenerator();
        case 'sql': return new SqlGenerator();
        case 'sql-schema': return new SqlSchemaGenerator();
        case 'sql-insert': return new SqlInsertGenerator();
        case 'plantuml': return new PlantUmlGenerator();
        default:
            throw new Error(`Unknown format: ${format}`);
    }
}