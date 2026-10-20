import type { CircularEconomy, Actor, Product, Component, Consumer, Retailer, Manufacturer, Order, CircularProcess, Shipment, Facility } from 'ceml-language';
import type { Graph, GraphNode, GraphEdge } from './generator-json-types.js';
import type { Reference }  from 'langium';

export class JsonGraphHelper {
    generateGraph(model: CircularEconomy): Graph {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        const actors: Actor[] = model.actors ?? [];
        const manufacturers: Manufacturer[] = actors.filter((a): a is Manufacturer => a.$type === 'Manufacturer');

        const components: Component[] = model.components ?? [];
        for (const c of components) {
            const id = c.name;
            var componentState = '';
            if (c.componentState?.ASSEMBLED === 'ASSEMBLED') {
                componentState = 'ASSEMBLED';
            } else if (c.componentState?.IN_CIRCULAR_PROCESS === 'IN_CIRCULAR_PROCESS' ) {
                componentState = 'IN_CIRCULAR_PROCESS';
            } else if (c.componentState?.READY === 'READY') {
                componentState = 'READY';
            }
            nodes.push({
                id,
                type: "COMPONENT",
                attrs: {
                    componentName: c.componentName,
                    componentState: componentState,
                    recycled: c.recycled ?? false
                }
            });

            const manufacturer =  manufacturers.find(m =>((m.components ?? []).some((cRef: Reference<Component>) => cRef.ref === c)));

            if (manufacturer) {
                edges.push({
                    source: manufacturer.name,
                    target: c.name,
                    type: "MANUFACTURER_PRODUCES_COMPONENT"
                });
            }
        }

        const products: Product[] = model.products ?? [];
        for (const p of products) {
            const id = p.name;
            nodes.push({
                id,
                type: "PRODUCT",
                attrs: {
                    name: p.productName,
                    price: p.price,
                    assemblyDate: p.assemblyDate
                }
            });

            // PRODUCT_HAS_COMPONENT edges
            for (const c of p.components ?? []) {
                if (!c.ref) continue; // safety check
                edges.push({
                    source: id,
                    target: c.ref.name,
                    type: "PRODUCT_HAS_COMPONENT"
                });
            }
        }

        const consumers: Consumer[] = actors.filter((a): a is Consumer => a.$type === 'Consumer');
        for (const c of consumers) {
            const id = c.name;
            nodes.push({id, type: "CONSUMER"});
        }

        const retailers: Retailer[] = actors.filter((a): a is Retailer => a.$type === 'Retailer');
        for (const r of retailers) {
            const id = r.name;
            nodes.push({ id, type: "RETAILER" });
        }

        for (const m of manufacturers) {
            const id = m.name;
            nodes.push({ id, type: "MANUFACTURER" });
        }

        const orders: Order[] = consumers.flatMap(c => c.orders ?? []);
        for (const o of orders) {
            const id = o.name;
            nodes.push({
                id,
                type: "ORDER",
                attrs: {
                    orderDate: o.orderDate
                }
            });

            const consumerOfOrder = consumers.find(c => (c.orders ?? []).includes(o));
            if (consumerOfOrder) {
                edges.push({
                    source: consumerOfOrder.name,
                    target: o.name,
                    type: "CONSUMER_PLACES_ORDER"
                });
            }

            if (o.product?.ref?.name) {
                edges.push({
                    source: id,
                    target: o.product?.ref?.name,
                    type: "ORDER_OF_PRODUCT"
                });
            }
        }

        const returns = consumers.flatMap(c => c.returns ?? []);
        for (const r of returns) {
            const id = r.name;
            nodes.push({
                id,
                type: "RETURN",
                attrs: {
                    reason: r.reason,
                }
            });

            const consumerOfReturn = consumers.find(c => (c.returns ?? []).includes(r));
            if (consumerOfReturn) {
                edges.push({
                    source: consumerOfReturn.name,
                    target: r.name,
                    type: "RETURN_BY_CONSUMER"
                });
            }

            if (r.order?.ref?.name) {
                edges.push({
                    source: r.name,
                    target: r.order?.ref?.name,
                    type: "RETURN_OF_ORDER"
                });
            }

            if (r.circularProcess) {
                edges.push({
                    source: r.name,
                    target: r.circularProcess.name,
                    type: "RETURN_HAS_PROCESS"
                });
            }
        }

        const processes: CircularProcess[] = returns.map(r => r.circularProcess).filter((p): p is CircularProcess => !!p);
        for (const p of processes) {
            const id = p.name;
            nodes.push({
                id,
                type: "CIRCULAR_PROCESS",
                attrs: { energySavedKWh: p.energySavedKWh, waterSavedL: p.waterSavedL }
            });
            if (p.facility?.ref?.name) {
                edges.push({
                    source: id,
                    target: p.facility?.ref?.name,
                    type: "PROCESS_AT_FACILITY"
                });
            }

            if (p.$type === "RecycleProcess") {
                for (const c of p.components ?? []) {
                    // c is a Reference<Component>
                    const component = c.ref;
                    if (!component) continue;

                    edges.push({
                        source: p.name,
                        target: component.name,
                        type: "PROCESS_RECYCLES_COMPONENT"
                    });
                }
            }

            if (p.shipment) {
                const shipment = p.shipment;
                edges.push({
                    source: p.name,
                    target: shipment.name,
                    type: "PROCESS_HAS_SHIPMENT"
                });

                // shipment destination edge
                if (shipment.destination?.ref) {
                    edges.push({
                        source: shipment.name,
                        target: shipment.destination.ref.name,
                        type: "SHIPMENT_DESTINATION"
                    });
                }
            }
        }

        const shipments: Shipment[] = processes.map(p => p.shipment).filter((s): s is Shipment => !!s);
        for (const s of shipments) {
            const id = s.name;
            nodes.push({
                id,
                type: "SHIPMENT",
                attrs: { deliveryDate: s.deliveryDate, co2Emission: s.co2Emission, delivered: s.delivered }
            });

            if (s.destination?.ref) {
                edges.push({
                    source: s.name,
                    target: s.destination?.ref?.name ?? 'unknown',
                    type: "SHIPMENT_DESTINATION"
                });
            }
        }

        const facilities: Facility[] = model.facilities ?? [];
        for (const f of facilities) {
            const id = f.name;
            let typeString = "UNKNOWN";
            if (f.type?.RECYCLE === 'RECYCLE') {typeString = "RECYCLE";}
            else if (f.type?.REPAIR === 'REPAIR') {typeString = "REPAIR";}
            else if (f.type?.REFURBISH === 'REFURBISH') {typeString = "REFURBISH";}
            nodes.push({
                id,
                type: "FACILITY",
                attrs: { type: typeString }
            });

            for (const g of f.goals ?? []) {
                const goalId = g.ref?.name ?? 'unknown';
                var comparator = '';
                if (g.ref?.comparator?.MIN === 'MIN') {
                    comparator = 'MIN';
                } else if (g.ref?.comparator?.MAX === 'MAX') {
                    comparator = 'MAX';
                }
                nodes.push({
                    id: goalId,
                    type: "SUSTAINABILITY_GOAL",
                    attrs: { description: g.ref?.description, standard: g.ref?.standard ?? 0, comparator: comparator }
                });

                edges.push({
                    source: id,
                    target: goalId,
                    type: "FACILITY_HAS_GOAL"
                });
            }
        }

        return { nodes, edges };
    }
}
