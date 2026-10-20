import type { Generator } from './index.js';
import type {
    CircularEconomy,
    Component,
    Product,
    Consumer,
    Manufacturer,
    Retailer,
    RecycleProcess,
    RepairProcess,
    RefurbishProcess,
} from 'ceml-language';

export class PlantUmlGenerator implements Generator {

    generate(model: CircularEconomy): string {
        let out = '';

        out += '@startuml\n';
        out += `left to right direction
skinparam padding 4
skinparam objectBorderThickness 2
skinparam title {
  FontSize 24
}
skinparam object<<ASSEMBLED>> {
  BorderColor green
}
skinparam object<<READY>> {
  BorderColor red
}
skinparam object<<IN_CIRCULAR_PROCESS>> {
  BorderColor blue
}
skinparam object<<NOT_DELIVERED>> {
  BorderColor red
}`;
        out += `\n\ntitle ${model.name}\n\n`;

        const componentIds = new Map<Component, string>();
        const productIds = new Map<Product, string>();

        function objectBlock(
            id: string,
            stereotype: string | null,
            color: string,
            attrs: string[]
        ): string {
            const s = stereotype ? ` <<${stereotype}>>` : '';
            let txt = `object ${id}${s} ${color} {\n`;
            for (const a of attrs) txt += `  ${a}\n`;
            txt += `}\n`;
            return txt;
        }

        function wrap(text: string, max = 50): string {
            const words = text.split(' ');
            let line = '';
            let res = '';
            for (const w of words) {
                if ((line + w).length > max) {
                    res += line.trim() + '\n';
                    line = '';
                }
                line += w + ' ';
            }
            return res + line.trim();
        }

        const compCount: Record<string, number> = {};

        for (const c of model.components) {
            const base = c.componentName.replace(/\s+/g, '');
            compCount[base] = compCount[base] ?? 0;
            const id = `C_${base}_${compCount[base]++}`;
            componentIds.set(c, id);

            let stereo: string | null = null;
            if (c.componentState.ASSEMBLED) stereo = 'ASSEMBLED';
            else if (c.componentState.READY) stereo = 'READY';
            else if (c.componentState.IN_CIRCULAR_PROCESS) stereo = 'IN_CIRCULAR_PROCESS';

            out += objectBlock(id, stereo, '#FFF8DC', [
                `componentName = "${c.componentName}"`,
                `state = "${stereo}"`,
                `recycled = ${c.recycled}`
            ]);
        }

        const prodCount: Record<string, number> = {};

        for (const p of model.products) {
            const base = p.productName.replace(/\s+/g, '');
            prodCount[base] = prodCount[base] ?? 0;
            const id = `P_${base}_${prodCount[base]++}`;
            productIds.set(p, id);

            out += objectBlock(id, null, '#LightBlue', [
                `productName = "${p.productName}"`,
                `price = ${p.price}`,
                `assemblyDate = "${p.assemblyDate}"`
            ]);
        }

        for (const f of model.facilities) {
            let type = 'RECYCLE';
            if (f.type.REPAIR) type = 'REPAIR';
            if (f.type.REFURBISH) type = 'REFURBISH';

            out += objectBlock(f.name, null, '#C8E6C9', [
                `name = "${f.name}"`,
                `type = "${type}"`
            ]);
        }

        for (const g of model.sustainabilityGoals) {
            let comp = 'MIN';
            if (g.comparator.MAX) comp = 'MAX';

            out += objectBlock(g.name, null, '#FFCDD2', [
                `name = "${g.name}"`,
                `description = "${g.description}"`,
                `standard = ${g.standard}`,
                `comparator = "${comp}"`
            ]);
        }

        const consumers: Consumer[] = [];
        const manufacturers: Manufacturer[] = [];
        const retailers: Retailer[] = [];

        for (const a of model.actors) {
            if ('orders' in a) consumers.push(a as Consumer);
            else if ('components' in a) manufacturers.push(a as Manufacturer);
            else retailers.push(a as Retailer);
        }

        for (const r of retailers)
            out += objectBlock(r.name, null, '#E0E0E0', [`name = "${r.name}"`]);

        for (const m of manufacturers)
            out += objectBlock(m.name, null, '#D7CCC8', [`name = "${m.name}"`]);

        // Interleave consumer objects with their orders/returns to match expected ordering
        for (const c of consumers) {
            out += objectBlock(c.name, null, '#FFF9C4', [`name = "${c.name}"`]);
            for (const o of c.orders) {
                out += objectBlock(o.name, null, '#E3F2FD', [
                    `name = "${o.name}"`,
                    `orderDate = "${o.orderDate}"`
                ]);
            }

            for (const r of c.returns) {
                out += objectBlock(r.name, null, '#F0F4C3', [
                    `name = "${r.name}"`,
                    `reason = "${wrap(r.reason)}"`
                ]);

                const p = r.circularProcess;

                let color = '#C5E1A5';
                let type = 'RECYCLE';
                if ((p as RepairProcess).energySavedKWh && (p as any).$type === 'RepairProcess') {
                    color = '#FFE082'; type = 'REPAIR';
                }
                if ((p as RefurbishProcess).energySavedKWh && (p as any).$type === 'RefurbishProcess') {
                    color = '#B39DDB'; type = 'REFURBISH';
                }

                out += objectBlock(p.name, null, color, [
                    `name = "${p.name}"`,
                    `type = "${type}"`,
                    `energySavedKWh = ${p.energySavedKWh}`,
                    `waterSavedL = ${p.waterSavedL}`
                ]);

                if (p.shipment) {
                    const s = p.shipment;
                    const stereo = s.delivered ? 'DELIVERED' : 'NOT_DELIVERED';

                    out += objectBlock(s.name, stereo, '#F5F5F5', [
                        `name = "${s.name}"`,
                        `delivered = ${s.delivered}`,
                        `deliveryDate = "${s.deliveryDate}"`,
                        `co2Emission = ${s.co2Emission}`
                    ]);
                }
            }
        }

        out += '\n';

        // Group association lines per consumer and per return
        for (const c of consumers) {
            for (const o of c.orders) out += `${c.name} *-- ${o.name}\n`;
            for (const r of c.returns) {
                const p = r.circularProcess;
                out += `${c.name} *-- ${r.name}\n`;
                out += `${r.name} *-- ${p.name}\n`;
                if (p.shipment) out += `${p.name} *-- ${p.shipment.name}\n`;
            }
        }

        for (const p of model.products) {
            const pid = productIds.get(p)!;
            out += `${pid} --> ${p.retailer.ref?.name}\n`;
            for (const c of p.components)
                out += `${pid} --> ${componentIds.get(c.ref!)}\n`;
        }

        for (const m of manufacturers)
            for (const c of m.components)
                out += `${m.name} --> ${componentIds.get(c.ref!)}\n`;

        for (const c of consumers)
            for (const o of c.orders)
                out += `${o.name} --> ${productIds.get(o.product.ref!)}\n`;

        for (const c of consumers)
            for (const r of c.returns)
                out += `${r.name} --> ${r.order.ref?.name}\n`;

        for (const c of consumers)
            for (const r of c.returns)
                out += `${r.circularProcess.name} --> ${r.circularProcess.facility.ref?.name}\n`;

        for (const c of consumers)
            for (const r of c.returns) {
                const p = r.circularProcess as RecycleProcess;
                if (p.components)
                    for (const comp of p.components)
                        out += `${p.name} --> ${componentIds.get(comp.ref!)}\n`;
            }

        for (const c of consumers)
            for (const r of c.returns)
                if (r.circularProcess.shipment)
                    out += `${r.circularProcess.shipment.name} --> ${r.circularProcess.shipment.destination.ref?.name}\n`;

        for (const f of model.facilities)
            for (const g of f.goals)
                out += `${f.name} --> ${g.ref?.name}\n`;

        out += '@enduml';
        return out;
    }
}
