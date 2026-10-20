import type { CircularEconomy, CircularProcess, Actor, Facility, Shipment, Retailer, Product, Component, Consumer, Manufacturer, Order, Return } from 'ceml-language';
import type { Metrics, CountsMetrics, AggregatesMetrics, FacilityMetrics, RetailerMetrics, ProductTypeMetrics, ConsumerMetrics, ManufacturerMetrics, TimeSeriesMetrics, GoalComplianceByFacility, ShipmentMetrics } from './generator-json-types.js';

export class JsonMetricsHelper {
    generateMetrics(model: CircularEconomy): Metrics {
        /**
         * Compute metrics and return a {@link Metrics} object.
         */
        const counts = this.computeCounts(model);
        const aggregates = this.computeAggregates(model);
        const byFacility = this.computeByFacility(model);
        const byRetailer = this.computeByRetailer(model);
        const byProductType = this.computeByProductType(model);
        const byConsumer = this.computeByConsumer(model);
        const byManufacturer = this.computeByManufacturer(model);
        const timeSeries = this.computeTimeSeries(model);
        const goalComplianceByFacility = this.computeGoalComplianceByFacility(model);
        const shipmentMetrics = this.computeShipmentMetrics(model);

        return {
            counts,
            aggregates,
            byFacility,
            byRetailer,
            byProductType,
            byConsumer,
            byManufacturer,
            timeSeries,
            goalComplianceByFacility,
            shipmentMetrics
        };
    }

    private computeCounts(model: CircularEconomy): CountsMetrics {
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const returns: Return[] = consumers.flatMap(c => c.returns ?? []);
        const manufacturers: Manufacturer[] = actors.filter((a): a is Manufacturer => a.$type === 'Manufacturer')
        const retailers: Retailer[] = actors.filter((a): a is Retailer => a.$type === 'Retailer');
        const allOrders: Order[] = consumers.flatMap(c => c.orders ?? []);
        const allReturns: Return[] = consumers.flatMap(c => c.returns ?? []);
        const facilities = model.facilities ?? [];
        const processes: CircularProcess[] = returns.map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);
        const shipments: Shipment[] = processes.map(p => p.shipment).filter((s): s is Shipment => !!s);

        return {
            components: model.components?.length ?? 0,
            products: model.products?.length ?? 0,
            consumers: consumers.length ?? 0,
            manufacturers: manufacturers.length ?? 0,
            retailers: retailers.length ?? 0,
            sustainabilityGoals: model.sustainabilityGoals?.length ?? 0,
            orders: allOrders.length ?? 0,
            returns: allReturns.length ?? 0,

            facilities: {
                total: facilities.length,
                recycle: facilities.filter((f: Facility) => f.type?.RECYCLE === 'RECYCLE').length,
                repair: facilities.filter((f: Facility) => f.type?.REPAIR === 'REPAIR').length,
                refurbish: facilities.filter((f: Facility) => f.type?.REFURBISH === 'REFURBISH').length,
            },

            circularProcesses: {
                total: processes.length,
                recycle: processes.filter(p => p.$type === "RecycleProcess").length,
                repair: processes.filter(p => p.$type === "RepairProcess").length,
                refurbish: processes.filter(p => p.$type === "RefurbishProcess").length
            },

            shipments: {
                total: shipments.length,
                delivered: shipments.filter(s => s.delivered === true).length,
                pending: shipments.filter(s => !s.delivered).length
            }
        };
    }

    private computeAggregates(model: CircularEconomy): AggregatesMetrics {
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const allReturns: Return[] = consumers.flatMap(c => c.returns ?? []);
        const processes: CircularProcess[] = allReturns.map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);
        const shipments: Shipment[] = processes.map(p => p.shipment).filter((s): s is Shipment => !!s);

        return {
            energySavedKWh: processes.reduce((sum: number, p: CircularProcess) => sum + (p.energySavedKWh ?? 0), 0),
            waterSavedL: processes.reduce((sum: number, p: CircularProcess) => sum + (p.waterSavedL ?? 0), 0),
            co2Emission: shipments.reduce((sum, s) => sum + (s.co2Emission ?? 0), 0)
        };
    }

    private computeByFacility(model: CircularEconomy): Record<string, FacilityMetrics> {
        const result: Record<string, FacilityMetrics> = {};
        const facilities: Facility[] = model.facilities ?? [];
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const allReturns: Return[] = consumers.flatMap(c => c.returns ?? []);
        const processes: CircularProcess[] = allReturns.map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);

        for (const facility of facilities) {
            const relatedProcesses: CircularProcess[] = processes.filter((p): p is CircularProcess & { facility: { ref: Facility } } => !!p.facility && p.facility.ref?.name === facility.name);
            const relatedShipments: Shipment[] = relatedProcesses.map(p => p.shipment).filter((s): s is Shipment => !!s);

            const typeString = facility.type.RECYCLE
                ? "RECYCLE"
                : facility.type.REPAIR
                    ? "REPAIR"
                    : facility.type.REFURBISH
                        ? "REFURBISH"
                        : (() => { throw new Error(`Unknown FacilityType for ${facility.name}`) })() as never;

            var facilityName = String(facility.name);
            result[facilityName] = {
                type: typeString,
                energySavedKWh: relatedProcesses.reduce((s: number, p: CircularProcess) => s + (p.energySavedKWh ?? 0), 0),
                waterSavedL: relatedProcesses.reduce((s: number, p: CircularProcess) => s + (p.waterSavedL ?? 0), 0),
                co2Emission: relatedShipments.reduce((sum, s) => sum + (s.co2Emission ?? 0), 0),
                processCount: relatedProcesses.length
            };
        }

        return result;
    }

    private computeByRetailer(model: CircularEconomy): Record<string, RetailerMetrics> {
        const result: Record<string, RetailerMetrics> = {};
        const actors: Actor[] = model.actors ?? [];
        const retailers: Retailer[] = actors.filter((a): a is Retailer => a.$type === 'Retailer');
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const orders: Order[] = consumers.flatMap(c => c.orders ?? []);
        const returns: Return[] = consumers.flatMap(c => c.returns ?? []);

        for (const retailer of retailers) {
            const retailerOrders: Order[] = orders.filter(
                o => o.product?.ref?.retailer?.ref?.name === retailer.name
            );

            const retailerReturns: Return[] = returns.filter(
                (r: Return) =>
                    r.order != null &&
                    retailerOrders.some(o => o.name === r.order?.ref?.name)
            );

            const orderCount = retailerOrders.length;
            const returnCount = retailerReturns.length;

            result[retailer.name] = {
                orders: orderCount,
                returns: returnCount,
                returnedProductRatio: orderCount === 0 ? 0 : Number((returnCount / orderCount).toFixed(2))
            };
        }

        return result;
    }

    private computeByProductType(model: CircularEconomy): Record<string, ProductTypeMetrics> {
        const result: Record<string, ProductTypeMetrics> = {};
        const products: Product[] = model.products ?? [];

        for (const p of products) {
            const key = String(p.productName);

            if (!result[key]) {
                result[key] = {
                    totalProducts: 0,
                    avgPrice: 0,
                    minPrice: p.price,
                    maxPrice: p.price,
                    avgComponentCount: 0
                };
            }

            const m = result[key];
            m.totalProducts++;
            m.minPrice = Math.min(m.minPrice, p.price);
            m.maxPrice = Math.max(m.maxPrice, p.price);
            m.avgPrice += p.price;
            m.avgComponentCount += p.components?.length ?? 0;
        }

        for (const m of Object.values(result)) {
            m.avgPrice = Number((m.avgPrice / m.totalProducts).toFixed(2));
            m.avgComponentCount = Number((m.avgComponentCount / m.totalProducts).toFixed(2));
        }

        return result;
    }

    private computeByConsumer(model: CircularEconomy): Record<string, ConsumerMetrics> {
        const result: Record<string, ConsumerMetrics> = {};
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');

        for (const consumer of consumers) {
            const consumerOrders = consumer.orders ?? [];
            const consumerReturns = consumer.returns ?? [];

            const productsSet: Set<string> = new Set();
            const retailersSet: Set<string> = new Set();

            for (const o of consumerOrders) {
                productsSet.add(o.product?.ref?.name ?? '');
                retailersSet.add(o.product?.ref?.retailer?.ref?.name ?? '');
            }

            const orderCount = consumerOrders.length;
            const returnCount = consumerReturns.length;

            result[consumer.name] = {
                orders: orderCount,
                returns: returnCount,
                returnRate: orderCount === 0 ? 0 : Number((returnCount / orderCount).toFixed(2)),
                distinctProductsOrdered: productsSet.size,
                distinctRetailersUsed: retailersSet.size
            };
        }

        return result;
    }

    private computeByManufacturer(model: CircularEconomy): Record<string, ManufacturerMetrics> {
        const result: Record<string, ManufacturerMetrics> = {};
        const actors: Actor[] = model.actors ?? [];
        const manufacturers: Manufacturer[] = actors.filter((a): a is Manufacturer => a.$type === 'Manufacturer');

        for (const m of manufacturers) {
            const manComponents: Component[] = m.components?.map((c: typeof m.components[number]) => c.ref!) ?? [];

            result[m.name] = {
                componentCount: manComponents.length,
                componentsAssembled: manComponents.filter(c => c.componentState?.ASSEMBLED === 'ASSEMBLED').length,
                componentsReady: manComponents.filter(c => c.componentState?.READY === 'READY').length,
                componentsInCircularProcess: manComponents.filter(c => c.componentState?.IN_CIRCULAR_PROCESS === 'IN_CIRCULAR_PROCESS').length,
                componentsRecycled: manComponents.filter(c => c.recycled).length
            };
        }

        return result;
    }

    private computeTimeSeries(model: CircularEconomy): TimeSeriesMetrics {
        const result: TimeSeriesMetrics = {
            productsAssembledPerYear: {},
            ordersPerYear: {},
            shipmentsPerYear: {},
            deliveredShipmentsPerYear: {}
        };

        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const orders: Order[] = consumers.flatMap(c => c.orders ?? []);
        const products: Product[] = model.products ?? [];
        const processes: CircularProcess[] = consumers.flatMap(c => c.returns ?? []).map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);
        const shipments: Shipment[] = processes.map(p => p.shipment).filter((s): s is Shipment => !!s);

        const getYear = (dateStr?: string): string | undefined => {
            if (!dateStr) return undefined;
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? undefined : d.getFullYear().toString();
        };

        for (const p of products) {
            const y = getYear(p.assemblyDate);
            if (y) result.productsAssembledPerYear[y] = (result.productsAssembledPerYear[y] ?? 0) + 1;
        }

        for (const o of orders) {
            const y = getYear(o.orderDate);
            if (y) result.ordersPerYear[y] = (result.ordersPerYear[y] ?? 0) + 1;
        }

        for (const s of shipments) {
            const y = getYear(s.deliveryDate);
            if (!y) continue;
            result.shipmentsPerYear[y] = (result.shipmentsPerYear[y] ?? 0) + 1;
            if (s.delivered) {
                result.deliveredShipmentsPerYear[y] = (result.deliveredShipmentsPerYear[y] ?? 0) + 1;
            }
        }

        return result;
    }

    private computeGoalComplianceByFacility(model: CircularEconomy): GoalComplianceByFacility {
        const result: GoalComplianceByFacility = {};
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const facilities: Facility[] = model.facilities ?? [];

        // Collect all circular processes in the model
        const processes: CircularProcess[] = [];
        for (const consumer of consumers) {
            for (const ret of consumer.returns ?? []) {
                if (ret.circularProcess) {
                    processes.push(ret.circularProcess);
                }
            }
        }

        for (const facility of facilities) {
            var facilityName = String(facility.name);
            result[facilityName] = {};

            for (const goalRef of facility.goals ?? []) {
                const goalName = goalRef.ref?.name;
                const goalComparator = goalRef.ref?.comparator;
                const goalStandard = goalRef.ref?.standard ?? 0;

                if (!goalName) continue;

                // Filter processes associated with this facility
                const facilityProcesses = processes
                    .filter(p => p.facility.ref?.name === facility.name)
                    .map(p => ({
                        energySavedKWh: p.energySavedKWh ?? 0,
                        waterSavedL: p.waterSavedL ?? 0,
                        co2Emission: p.shipment?.co2Emission ?? 0
                    }));

                var value = 0;
                if (goalName === "energySavedKWh") {
                    value = facilityProcesses.reduce((sum, p) => sum + p.energySavedKWh, 0);
                } else if (goalName === "waterSavedL") {
                    value = facilityProcesses.reduce((sum, p) => sum + p.waterSavedL, 0);
                } else if (goalName === "co2Emission") {
                    value = facilityProcesses.reduce((sum, p) => sum + p.co2Emission, 0);
                }

                result[facilityName][goalName] = goalComparator?.MIN === "MIN" ? value >= goalStandard : goalComparator?.MAX === "MAX" ? value <= goalStandard : false;
            }
        }

        return result;
    }

    private computeShipmentMetrics(model: CircularEconomy): ShipmentMetrics {
        const actors: Actor[] = model.actors ?? [];
        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        const processes: CircularProcess[] = consumers.flatMap(c => c.returns ?? []).map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);
        const shipments: Shipment[] = processes.map(p => p.shipment).filter((s): s is Shipment => !!s);
        const total = shipments.length;
        const delivered = shipments.filter(s => s.delivered).length;

        const byDestination: ShipmentMetrics["byDestination"] = {};

        for (const s of shipments) {
            const key = s.destination?.ref?.name ? String(s.destination.ref.name) : "Unknown";
            byDestination[key] ??= { shipments: 0, deliveredShipments: 0, totalCo2Emission: 0 };
            byDestination[key].shipments++;
            if (s.delivered) byDestination[key].deliveredShipments++;
            byDestination[key].totalCo2Emission += s.co2Emission ?? 0;
        }

        return {
            deliveredRatio: total === 0 ? 0 : Number((delivered / total).toFixed(4)),
            byDestination
        };
    }

}

