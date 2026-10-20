/**
 * Top-level JSON structure generated from a CircularEconomy model.
 */
export interface CircularEconomyJson {
    metadata: Metadata;
    metrics: Metrics;
    graph: Graph;
}

export interface Metadata {
    economyName: string;
    /**
     * Timestamp when this JSON was generated.
     * ISO 8601 string, e.g. "2025-12-08T14:41:04.983Z".
     */
    generatedAt: string;
    generator: string;
    schemaVersion: string;
}

/**
 * Root metrics object containing all aggregated information derived from the model.
 */
export interface Metrics {
    counts: CountsMetrics;
    aggregates: AggregatesMetrics;
    byFacility: Record<string, FacilityMetrics>;
    byRetailer: Record<string, RetailerMetrics>;
    byProductType: Record<string, ProductTypeMetrics>;
    byConsumer: Record<string, ConsumerMetrics>;
    byManufacturer: Record<string, ManufacturerMetrics>;
    timeSeries: TimeSeriesMetrics;
    goalComplianceByFacility: GoalComplianceByFacility;
    shipmentMetrics: ShipmentMetrics;
}

export interface Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

/**
 * Numeric range summary (used for "days" statistics).
 *
 * Conventions:
 * - avg: arithmetic mean (rounded to 1 decimal place).
 * - min: minimum value (integer).
 * - max: maximum value (integer).
 */
export interface NumericRange {
    avg: number;
    min: number;
    max: number;
}

export interface FacilityCounts {
    total: number;
    recycle: number;
    repair: number;
    refurbish: number;
}

export interface ProcessCounts {
    total: number;
    recycle: number;
    repair: number;
    refurbish: number;
}

export interface ShipmentCounts {
    total: number;
    delivered: number;
    pending: number;
}

/**
 * Simple counts of main entities of the CircularEconomy model.
 */
export interface CountsMetrics {
    components: number;
    products: number;
    consumers: number;
    manufacturers: number;
    retailers: number;
    sustainabilityGoals: number;
    orders: number;
    returns: number;
    facilities: FacilityCounts;
    circularProcesses: ProcessCounts;
    shipments: ShipmentCounts;
}

export interface LifecycleMetrics {
    /**
     * Fraction of orders that result in a return.
     * productReturnRate = totalReturns / totalOrders (0..1, rounded to 2 decimals).
     */
    productReturnRate: number;

    /** Days between order date and return date (avg, min, max).
     * 
     * Use the following to compute the differences:
     * - parse both dates with new Date(...), if invalid: ignore
     * - diffInMs = |d2 - d1|
     * - days = ceil(diffInMs / (1000 * 60 * 60 * 24))
     */
    orderToReturnDays: NumericRange;

    /** Days between product assembly date and order date (avg, min, max). */
    assemblyToOrderDays: NumericRange;

    /** Days between product assembly date and return date (avg, min, max). */
    assemblyToReturnDays: NumericRange;
}

/**
 * Global sustainability aggregates (sums) over all circular processes.
 */
export interface AggregatesMetrics {
    energySavedKWh: number;
    waterSavedL: number;
    co2Emission: number;
}

export type FacilityType = "RECYCLE" | "REPAIR" | "REFURBISH";


/**
 * Aggregated metrics for a single facility.
 */
export interface FacilityMetrics {
    type: FacilityType;
    energySavedKWh: number;
    waterSavedL: number;
    co2Emission: number;
    /** Number of circular processes that take place at this facility. */
    processCount: number;
}

/**
 * Aggregated metrics for a single retailer.
 */
export interface RetailerMetrics {
    orders: number;
    returns: number;
    /**
     * Fraction of orders that were returned.
     * returnedProductRatio = returns / orders (0..1, rounded to 2 decimals).
     */
    returnedProductRatio: number;
}

export interface ProductTypeMetrics {
    /** Number of products with this productName. */
    totalProducts: number;
    /** Average price (arithmetic mean) of those products (rounded to 2 decimals). */
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    /** Average number of components per product instance of this type. */
    avgComponentCount: number;
}

export interface ConsumerMetrics {
    orders: number;
    returns: number;
    /**
     * Fraction of this consumer's orders that were returned.
     * returnRate = returns / orders (0..1, rounded to 2 decimals).
     */
    returnRate: number;
    /** Number of distinct products (by product.name) this consumer has ordered. */
    distinctProductsOrdered: number;
    /** Number of distinct retailers involved in this consumer's orders. */
    distinctRetailersUsed: number;
}

export interface ManufacturerMetrics {
    /** Total number of components produced by this manufacturer. */
    componentCount: number;
    /** Number of components whose state is ASSEMBLED. */
    componentsAssembled: number;
    /** Number of components whose state is READY. */
    componentsReady: number;
    /** Number of components whose state is IN_CIRCULAR_PROCESS. */
    componentsInCircularProcess: number;
    /** Number of recycled components. */
    componentsRecycled: number;
}

/**
 * Time series metrics per year.
 * Keys are year strings "YYYY" derived from date fields.
 * Values are integer counts.
 */
export interface TimeSeriesMetrics {
    productsAssembledPerYear: Record<string, number>;
    ordersPerYear: Record<string, number>;
    /** Number of total shipments per year. */
    shipmentsPerYear: Record<string, number>;
    /** Number of delivered shipments per year. */
    deliveredShipmentsPerYear: Record<string, number>;
}

/**
 * Structure:
 * - Outer key: facility name.
 * - Inner key: sustainability goal name.
 * - Value: true if that facility meets the goal (taking into account the comparator), false otherwise.
 */
export type GoalComplianceByFacility = Record<string, Record<string, boolean>>;

export interface ShipmentMetrics {
    /**
     * Fraction of shipments that are delivered.
     * deliveredRatio = deliveredShipments / totalShipments (0..1, rounded to 4 decimals).
     */
    deliveredRatio: number;
    /** Aggregated shipment stats per destination. */
    byDestination: Record<string, DestinationShipmentStats>;
}

export interface DestinationShipmentStats {
    /** Number of shipments whose destination is this actor. */
    shipments: number;
    deliveredShipments: number;
    totalCo2Emission: number;
}

export type NodeType =
    | "COMPONENT"
    | "PRODUCT"
    | "CONSUMER"
    | "RETAILER"
    | "MANUFACTURER"
    | "ORDER"
    | "RETURN"
    | "CIRCULAR_PROCESS"
    | "SHIPMENT"
    | "FACILITY"
    | "SUSTAINABILITY_GOAL";

export type EdgeType =
    | "PRODUCT_HAS_COMPONENT"
    | "RETAILER_SELLS_PRODUCT"
    | "MANUFACTURER_PRODUCES_COMPONENT"
    | "CONSUMER_PLACES_ORDER"
    | "ORDER_OF_PRODUCT"
    | "RETURN_OF_ORDER"
    | "RETURN_BY_CONSUMER"
    | "RETURN_HAS_PROCESS"
    | "PROCESS_AT_FACILITY"
    | "PROCESS_RECYCLES_COMPONENT"
    | "PROCESS_HAS_SHIPMENT"
    | "SHIPMENT_DESTINATION"
    | "FACILITY_HAS_GOAL";

export interface GraphNode {
    id: string;
    type: NodeType;
    attrs?: Record<string, unknown>;
}

export interface GraphEdge {
    source: string;
    target: string;
    type: EdgeType;
}
