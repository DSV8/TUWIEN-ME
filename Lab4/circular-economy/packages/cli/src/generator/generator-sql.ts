import type { Generator } from './index.js';
import type { CircularEconomy } from 'ceml-language';
import { SqlSchemaGenerator } from './generator-sql-schema.js';
import { SqlInsertGenerator } from './generator-sql-insert.js';

export class SqlGenerator implements Generator {
    private schemaGenerator = new SqlSchemaGenerator();
    private insertGenerator = new SqlInsertGenerator();

    generate(model: CircularEconomy): string {
        const schema = this.schemaGenerator.generate(model);
        const inserts = this.insertGenerator.generate(model);
        return schema + '\n\n' + inserts;
    }

    generateSchema(model: CircularEconomy): string {
        return this.schemaGenerator.generate(model);
    }

    generateInserts(model: CircularEconomy): string {
        return this.insertGenerator.generate(model);
    }
}
