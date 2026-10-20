import type { Generator } from './index.js';
import type { CircularEconomy } from 'ceml-language';
import { JsonMetricsHelper } from './generator-json-metrics-helper.js';
import { JsonGraphHelper } from './generator-json-graph-helper.js';
import type { CircularEconomyJson, Metadata } from './generator-json-types.js';

export class JsonGenerator implements Generator {
    private metricsHelper = new JsonMetricsHelper();
    private graphHelper = new JsonGraphHelper();

    generate(model: CircularEconomy): string {
        const metadata = this.generateMetadata(model);
        const metrics = this.metricsHelper.generateMetrics(model);
        const graph = this.graphHelper.generateGraph(model);
        
        const result: CircularEconomyJson = {
            metadata,
            metrics,
            graph
        };
        
        return JSON.stringify(result, null, 2);
    }

    private generateMetadata(model: CircularEconomy): Metadata {
        /**
         * Generate metadata and return a {@link Metadata} object.
         */
        return {
            economyName: model.name,
            generatedAt: new Date().toISOString(),
            generator: 'ceml-json-generator',
            schemaVersion: 'v1.0.0'
        };
    }
}