import type { Generator } from './index.js';
import type { CircularEconomy } from 'ceml-language';

const SQL_TYPES = {
    ID: 'VARCHAR(64)',
    NAME: 'VARCHAR(255)',
    ENUM_SHORT: 'VARCHAR(8)',
    ENUM_MEDIUM: 'VARCHAR(32)',
    TEXT: 'TEXT',
    DATE: 'DATE',
    BOOLEAN: 'BOOLEAN',
    NUMERIC: 'NUMERIC(10,2)',
} as const;

const ENUMS = {
    ACTOR_KIND: ['RETAILER', 'MANUFACTURER', 'CONSUMER'] as const,
    COMPONENT_STATE: ['ASSEMBLED', 'IN_CIRCULAR_PROCESS', 'READY'] as const,
    FACILITY_TYPE: ['RECYCLE', 'REFURBISH', 'REPAIR'] as const,
    PROCESS_KIND: ['RECYCLE', 'REPAIR', 'REFURBISH'] as const,
    COMPARATOR: ['MIN', 'MAX'] as const,
} as const;

const TABLES = {
    ACTORS: 'actors',
    MANUFACTURERS: 'manufacturers',
    RETAILERS: 'retailers',
    CONSUMERS: 'consumers',
    SUSTAINABILITY_GOALS: 'sustainability_goals',
    FACILITIES: 'facilities',
    FACILITY_GOALS: 'facility_goals',
    PRODUCTS: 'products',
    COMPONENTS: 'components',
    ORDERS: 'orders',
    RETURNS: 'returns',
    CIRCULAR_PROCESSES: 'circular_processes',
    RECYCLE_PROCESS_COMPONENTS: 'recycle_process_components',
    SHIPMENTS: 'shipments',
} as const;

interface ColumnOptions {
    primaryKey?: boolean;
    notNull?: boolean;
    references?: string;
}

interface TableDefinition {
    name: string;
    columns: Array<{ name: string; type: string; options?: ColumnOptions }>;
    checks?: string[];
    compositePrimaryKey?: string[];
}

export class SqlSchemaGenerator implements Generator {
    // Generate the SQL schema for the Circular Economy model (_model is not used in this implementation)
    generate(_model: CircularEconomy): string {
        const tableDefinitions = this.getTableDefinitions();
        return tableDefinitions
            .map(def => this.buildTable(def))
            .join('\n\n');
    }

    private getTableDefinitions(): TableDefinition[] {
        return [
            this.defineActorsTable(),
            this.defineManufacturersTable(),
            this.defineRetailersTable(),
            this.defineConsumersTable(),
            this.defineSustainabilityGoalsTable(),
            this.defineFacilitiesTable(),
            this.defineFacilityGoalsTable(),
            this.defineProductsTable(),
            this.defineComponentsTable(),
            this.defineOrdersTable(),
            this.defineReturnsTable(),
            this.defineCircularProcessesTable(),
            this.defineRecycleProcessComponentsTable(),
            this.defineShipmentsTable(),
        ];
    }

    private defineActorsTable(): TableDefinition {
        return {
            name: TABLES.ACTORS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                { name: 'kind', type: SQL_TYPES.ENUM_MEDIUM, options: { notNull: true } },
            ],
            checks: [this.buildEnumCheck('kind', ENUMS.ACTOR_KIND)],
        };
    }

    private defineManufacturersTable(): TableDefinition {
        return {
            name: TABLES.MANUFACTURERS,
            columns: [
                {
                    name: 'actor_id',
                    type: SQL_TYPES.ID,
                    options: { primaryKey: true, references: `${TABLES.ACTORS}(id)` },
                },
            ],
        };
    }

    private defineRetailersTable(): TableDefinition {
        return {
            name: TABLES.RETAILERS,
            columns: [
                {
                    name: 'actor_id',
                    type: SQL_TYPES.ID,
                    options: { primaryKey: true, references: `${TABLES.ACTORS}(id)` },
                },
            ],
        };
    }

    private defineConsumersTable(): TableDefinition {
        return {
            name: TABLES.CONSUMERS,
            columns: [
                {
                    name: 'actor_id',
                    type: SQL_TYPES.ID,
                    options: { primaryKey: true, references: `${TABLES.ACTORS}(id)` },
                },
            ],
        };
    }

    private defineSustainabilityGoalsTable(): TableDefinition {
        return {
            name: TABLES.SUSTAINABILITY_GOALS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                { name: 'description', type: SQL_TYPES.TEXT, options: { notNull: true } },
                { name: 'standard', type: SQL_TYPES.NUMERIC, options: { notNull: true } },
                { name: 'comparator', type: SQL_TYPES.ENUM_SHORT, options: { notNull: true } },
            ],
            checks: [this.buildEnumCheck('comparator', ENUMS.COMPARATOR)],
        };
    }

    private defineFacilitiesTable(): TableDefinition {
        return {
            name: TABLES.FACILITIES,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                { name: 'type', type: SQL_TYPES.ENUM_MEDIUM, options: { notNull: true } },
            ],
            checks: [this.buildEnumCheck('type', ENUMS.FACILITY_TYPE)],
        };
    }

    private defineFacilityGoalsTable(): TableDefinition {
        return {
            name: TABLES.FACILITY_GOALS,
            columns: [
                {
                    name: 'facility_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.FACILITIES}(id)` },
                },
                {
                    name: 'goal_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.SUSTAINABILITY_GOALS}(id)` },
                },
            ],
            compositePrimaryKey: ['facility_id', 'goal_id'],
        };
    }

    private defineProductsTable(): TableDefinition {
        return {
            name: TABLES.PRODUCTS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                { name: 'product_name', type: SQL_TYPES.NAME, options: { notNull: true } },
                { name: 'assembly_date', type: SQL_TYPES.DATE, options: { notNull: true } },
                { name: 'price', type: SQL_TYPES.NUMERIC, options: { notNull: true } },
                {
                    name: 'retailer_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.RETAILERS}(actor_id)` },
                },
            ],
        };
    }

    private defineComponentsTable(): TableDefinition {
        return {
            name: TABLES.COMPONENTS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                { name: 'component_name', type: SQL_TYPES.NAME, options: { notNull: true } },
                { name: 'state', type: SQL_TYPES.ENUM_MEDIUM, options: { notNull: true } },
                { name: 'recycled', type: SQL_TYPES.BOOLEAN, options: { notNull: true } },
                {
                    name: 'manufacturer_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.MANUFACTURERS}(actor_id)` },
                },
                {
                    name: 'product_id',
                    type: SQL_TYPES.ID,
                    options: { references: `${TABLES.PRODUCTS}(id)` },
                },
            ],
            checks: [this.buildEnumCheck('state', ENUMS.COMPONENT_STATE)],
        };
    }

    private defineOrdersTable(): TableDefinition {
        return {
            name: TABLES.ORDERS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                {
                    name: 'consumer_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.CONSUMERS}(actor_id)` },
                },
                {
                    name: 'product_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.PRODUCTS}(id)` },
                },
                { name: 'order_date', type: SQL_TYPES.DATE, options: { notNull: true } },
            ],
        };
    }

    private defineReturnsTable(): TableDefinition {
        return {
            name: TABLES.RETURNS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                {
                    name: 'consumer_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.CONSUMERS}(actor_id)` },
                },
                {
                    name: 'order_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.ORDERS}(id)` },
                },
                { name: 'reason', type: SQL_TYPES.TEXT },
            ],
        };
    }

    private defineCircularProcessesTable(): TableDefinition {
        return {
            name: TABLES.CIRCULAR_PROCESSES,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                {
                    name: 'return_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.RETURNS}(id)` },
                },
                { name: 'kind', type: SQL_TYPES.ENUM_MEDIUM, options: { notNull: true } },
                {
                    name: 'facility_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.FACILITIES}(id)` },
                },
                { name: 'energy_saved_kwh', type: SQL_TYPES.NUMERIC, options: { notNull: true } },
                { name: 'water_saved_l', type: SQL_TYPES.NUMERIC, options: { notNull: true } },
            ],
            checks: [this.buildEnumCheck('kind', ENUMS.PROCESS_KIND)],
        };
    }

    private defineRecycleProcessComponentsTable(): TableDefinition {
        return {
            name: TABLES.RECYCLE_PROCESS_COMPONENTS,
            columns: [
                {
                    name: 'process_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.CIRCULAR_PROCESSES}(id)` },
                },
                {
                    name: 'component_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.COMPONENTS}(id)` },
                },
            ],
            compositePrimaryKey: ['process_id', 'component_id'],
        };
    }

    private defineShipmentsTable(): TableDefinition {
        return {
            name: TABLES.SHIPMENTS,
            columns: [
                { name: 'id', type: SQL_TYPES.ID, options: { primaryKey: true } },
                {
                    name: 'process_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.CIRCULAR_PROCESSES}(id)` },
                },
                { name: 'delivered', type: SQL_TYPES.BOOLEAN, options: { notNull: true } },
                { name: 'delivery_date', type: SQL_TYPES.DATE, options: { notNull: true } },
                { name: 'co2_emission', type: SQL_TYPES.NUMERIC, options: { notNull: true } },
                {
                    name: 'destination_id',
                    type: SQL_TYPES.ID,
                    options: { notNull: true, references: `${TABLES.ACTORS}(id)` },
                },
            ],
        };
    }

    private buildTable(def: TableDefinition): string {
        const parts: string[] = [];
        parts.push(`CREATE TABLE ${def.name} (`);
        const definitions: string[] = [];

        // Add columns
        for (const col of def.columns) {
            definitions.push(this.buildColumn(col.name, col.type, col.options));
        }

        // Add composite primary key if present
        if (def.compositePrimaryKey) {
            definitions.push(this.buildCompositePrimaryKey(def.compositePrimaryKey));
        }

        // Add check constraints
        if (def.checks) {
            definitions.push(...def.checks);
        }

        parts.push(definitions.map(def => `    ${def}`).join(',\n'));
        parts.push(');');

        return parts.join('\n');
    }

    private buildColumn(name: string, type: string, options: ColumnOptions = {}): string {
        const parts: string[] = [name, type];

        if (options.primaryKey) {
            parts.push('PRIMARY KEY');
        }

        if (options.notNull) {
            parts.push('NOT NULL');
        }

        if (options.references) {
            parts.push(`REFERENCES ${options.references}`);
        }

        return parts.join(' ');
    }

    private buildCompositePrimaryKey(columns: string[]): string {
        return `PRIMARY KEY (${columns.join(', ')})`;
    }

    private buildEnumCheck(columnName: string, values: readonly string[]): string {
        const quotedValues = values.map(v => `'${v}'`).join(', ');
        return `CHECK (${columnName} IN (${quotedValues}))`;
    }
}

