import type { Generator } from './index.js';
import type { CircularEconomy, Actor, Manufacturer, Product, Component } from 'ceml-language';
import { Reference } from 'langium';

export class SqlInsertGenerator implements Generator {

    generate(model: CircularEconomy): string {
        const sql: string[] = [];

        const q = (v: any) =>
            v === undefined || v === null
                ? 'NULL'
                : typeof v === 'string'
                    ? `'${v.replace(/'/g, "''")}'`
                    : typeof v === 'boolean'
                        ? v ? 'TRUE' : 'FALSE'
                        : v;

        // ACTORS
        sql.push(`-- actors`);
        for (const actor of model.actors) {
            let kind = '';
            if (actor.$type === 'Manufacturer') kind = 'MANUFACTURER';
            if (actor.$type === 'Retailer') kind = 'RETAILER';
            if (actor.$type === 'Consumer') kind = 'CONSUMER';

            sql.push(
                `INSERT INTO actors (id, kind) VALUES (${q(actor.name)}, ${q(kind)});`
            );
        }

        // ACTOR SUBTABLES
        for (const actor of model.actors) {
            if (actor.$type === 'Manufacturer') {
                sql.push(`INSERT INTO manufacturers (actor_id) VALUES (${q(actor.name)});`);
            }
            if (actor.$type === 'Retailer') {
                sql.push(`INSERT INTO retailers (actor_id) VALUES (${q(actor.name)});`);
            }
            if (actor.$type === 'Consumer') {
                sql.push(`INSERT INTO consumers (actor_id) VALUES (${q(actor.name)});`);
            }
        }

        // SUSTAINABILITY GOALS
        sql.push(`-- sustainability_goals`);
        for (const g of model.sustainabilityGoals) {
            // get comparator value
            var comparator = '';
            if(g.comparator?.MIN === 'MIN') comparator = 'MIN';
            else if(g.comparator?.MAX === 'MAX') comparator = 'MAX';
            sql.push(
                `INSERT INTO sustainability_goals (id, description, standard, comparator)
                 VALUES (${q(g.name)}, ${q(g.description)}, ${g.standard}, ${q(comparator)});`
            );
        }

        // FACILITIES & FACILITY_GOALS
        sql.push(`-- facilities and facility_goals`);
        for (const f of model.facilities) {
            // get facility type value
            var type = '';
            if(f.type?.RECYCLE === 'RECYCLE') type = 'RECYCLE';
            else if(f.type?.REPAIR === 'REPAIR') type = 'REPAIR';
            else if(f.type?.REFURBISH === 'REFURBISH') type = 'REFURBISH';
            sql.push(`INSERT INTO facilities (id, type) VALUES (${q(f.name)}, ${q(type)});`);

            for (const g of f.goals ?? []) {
                sql.push(
                    `INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES (${q(f.name)}, ${q(g.ref?.name)});`
                );
            }
        }

        // PRODUCTS
        sql.push(`-- products`);
        for (const p of model.products) {
            sql.push(
                `INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES (${q(p.name)}, ${q(p.productName)}, ${q(p.assemblyDate)}, ${p.price}, ${q(p.retailer.ref?.name)});`
            );
        }

        // COMPONENTS
        sql.push(`-- components`);
        for (const c of model.components) {
            const manufacturer = model.actors.find(
                (a: Actor): a is Manufacturer => {
                    if (a.$type !== 'Manufacturer') return false;
                    return a.components?.some((cRef: Reference<Component>) => cRef.ref === c);
                }
            );

            const product = model.products.find((p: Product) =>
                p.components?.some((cRef: Reference<Component>) => cRef.ref === c)
            );

            // get component state value
            var state = '';
            if(c.componentState?.ASSEMBLED === 'ASSEMBLED') state = 'ASSEMBLED';
            else if(c.componentState?.IN_CIRCULAR_PROCESS === 'IN_CIRCULAR_PROCESS') state = 'IN_CIRCULAR_PROCESS';
            else if(c.componentState?.READY === 'READY') state = 'READY';

            sql.push(
                `INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     ${q(c.name)},
                     ${q(c.componentName)},
                     ${q(state)},
                     ${q(!!c.recycled)},
                     ${q(manufacturer?.name)},
                     ${q(product?.name)}
                 );`
            );
        }

        // ORDERS & RETURNS
        sql.push(`-- orders and returns`);
        for (const actor of model.actors) {
            if (actor.$type !== 'Consumer') continue;

            for (const o of actor.orders ?? []) {
                sql.push(
                    `INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES (${q(o.name)}, ${q(actor.name)}, ${q(o.product.ref?.name)}, ${q(o.orderDate)});`
                );
            }

            for (const r of actor.returns ?? []) {
                sql.push(
                    `INSERT INTO returns (id, consumer_id, order_id, reason)
                     VALUES (${q(r.name)}, ${q(actor.name)}, ${q(r.order.ref?.name)}, ${q(r.reason)});`
                );

                const p = r.circularProcess;
                const kind = p.$type
                    .replace('Process', '')
                    .toUpperCase();

                // CIRCULAR PROCESSES
                sql.push(`-- circular_processes`);
                sql.push(
                    `INSERT INTO circular_processes
                     (id, return_id, kind, facility_id, energy_saved_kwh, water_saved_l)
                     VALUES (
                         ${q(p.name)},
                         ${q(r.name)},
                         ${q(kind)},
                         ${q(p.facility.ref?.name)},
                         ${p.energySavedKWh},
                         ${p.waterSavedL}
                     );`
                );

                // RECYCLE PROCESS COMPONENTS
                if (p.$type === 'RecycleProcess') {
                    sql.push(`-- recycle_process_components`);
                    for (const c of p.components ?? []) {
                        sql.push(
                            `INSERT INTO recycle_process_components (process_id, component_id)
                             VALUES (${q(p.name)}, ${q(c.ref?.name)});`
                        );
                    }
                }

                // SHIPMENTS
                if (p.shipment) {
                    sql.push(`-- shipments`);
                    sql.push(
                        `INSERT INTO shipments
                         (id, process_id, delivered, delivery_date, co2_emission, destination_id)
                         VALUES (
                             ${q(p.shipment.name)},
                             ${q(p.name)},
                             ${q(!!p.shipment.delivered)},
                             ${q(p.shipment.deliveryDate)},
                             ${p.shipment.co2Emission},
                             ${q(p.shipment.destination.ref?.name)}
                         );`
                    );
                }
            }
        }

        return sql.join('\n');
    }
}

