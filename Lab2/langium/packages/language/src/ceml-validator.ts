import { ValidationAcceptor, ValidationChecks } from 'langium';
import type { CemlServices } from './ceml-module.js';
import { type CemlAstType, Component, Product, CircularProcess, Facility, RecycleProcess, Order, Shipment, Consumer, Return } from './generated/ast.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CemlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.CemlValidator;
    const checks: ValidationChecks<CemlAstType> = {
        // TODO: Declare validators for your properties
        // See doc : https://langium.org/docs/learn/workflow/create_validations/

        CircularProcess: validator.checkFacilityMatchesProcess,
        Component: validator.checkComponentNamePrefix,
        Product: [
            validator.checkProductNamePrefix,
            validator.checkValidDateFormat,
            validator.checkProductRequiredFields,
            validator.checkProductDuplicateFields
        ],
        Order: validator.checkValidDateFormat,
        Shipment: validator.checkValidDateFormat,
        RecycleProcess: validator.checkRecycleComponentsPartOfProduct,
        Consumer: validator.checkConsumerHasOrder,
        Return: validator.checkChronologicalDates
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class CemlValidator {

    // TODO: Add logic here for validation checks of properties
    // See doc : https://langium.org/docs/learn/workflow/create_validations/

    // Rule 1: Check Component name starts with C_... and Product names with P_...
    checkComponentNamePrefix(component: Component, accept: ValidationAcceptor): void {
        const name = component.name;
        if (name && !name.startsWith('C_')) {
            accept(
                'warning',
                `Component name "${name}" should start with "C_".`,
                { node: component, property: 'name' }
            );
        }
    }

    checkProductNamePrefix(product: Product, accept: ValidationAcceptor): void {
        const name = product.name;
        if (name && !name.startsWith('P_')) {
            accept(
                'warning',
                `Product name "${name}" should start with "P_".`,
                { node: product, property: 'name' }
            );
        }
    }

    // Rule 2: Facility type must match the process type.   
    checkFacilityMatchesProcess(proc: CircularProcess, accept: ValidationAcceptor): void {
        // fetch all processType
        const p = proc.processType;
        if (!p) return;

        // fetch facility reference as Facility object
        const facility = p.facility?.ref as Facility | undefined;
        if (!facility) return;

        // fetch facility type
        const facilityType = facility.type.type;

        switch (p.$type) {
            case 'RecycleProcess':
                if (facilityType !== 'RECYCLE') {
                    accept('error', `RecycleProcess requires a RECYCLE facility.`, { node: proc });
                }
                break;

            case 'RepairProcess':
                if (facilityType !== 'REPAIR') {
                    accept('error', `RepairProcess requires a REPAIR facility.`, { node: proc });
                }
                break;

            case 'RefurbishProcess':
                if (facilityType !== 'REFURBISH') {
                    accept('error', `RefurbishProcess requires a REFURBISH facility.`, { node: proc });
                }
                break;
        }
    }

    // Rule 3: Validate that components in RecycleProcess are part of product components
    checkRecycleComponentsPartOfProduct(recycleProcess: RecycleProcess, accept: ValidationAcceptor): void {
        // get CircularProcess parent
        const circular = recycleProcess.$container;
        if (!circular || circular.$type !== 'CircularProcess') return;

        // get Return parent
        const parentReturn = circular.$container;
        if (!parentReturn || parentReturn.$type !== 'Return') return;

        // Fetch Order from Return
        const order = parentReturn.order?.ref;
        if (!order) return;

        // Fetch Product from Order
        const product = order.product?.ref;
        if (!product) return;

        // Get product components' names
        const productComponentNames = new Set(product.components.map(c => c.ref?.name).filter((name): name is string => !!name));

        // Check each component in RecycleProcess
        for (const compRef of recycleProcess.components) {
            const compName = compRef.ref?.name;
            if (compName && !productComponentNames.has(compName)) {
                accept(
                    'error',
                    `Component "${compName}" in RecycleProcess is not part of the Product "${product.name}".`,
                    { node: recycleProcess }
                );
            }
        }
    }

    // Ensure date fields follow YYYY-MM-DD format
    checkValidDateFormat(node: Order | Product | Shipment, accept: ValidationAcceptor): void {
        // fields that are dates in your language
        const dates = [];
        const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

        switch (node.$type) {
            case 'Product':
                if (node.assemblyDate[0]) {
                    dates.push({ value: node.assemblyDate[0], node: node, property: 'assemblyDate' });
                }
                break;
            case 'Order':
                if (node.orderDate) {
                    dates.push({ value: node.orderDate, node: node, property: 'orderDate' });
                }
                break;
            case 'Shipment':
                if (node.deliveryDate) {
                    dates.push({ value: node.deliveryDate, node: node, property: 'deliveryDate' });
                }
                break;
        }

        for (const d of dates) {
            if (!DATE_REGEX.test(d.value.replace(/"/g, ""))) {
                accept(
                    'error',
                    `Invalid date format "${d.value}". Expected YYYY-MM-DD.`,
                    { node: d.node }
                );
            }
        }
    }

    // Ensure that Product attributes only appear once despite appearing in different orders
    checkProductRequiredFields(product: Product, accept: ValidationAcceptor): void {
        const requiredFields: [string, unknown[]][] = [
            ['productName', Array.isArray(product.productName) ? product.productName : []],
            ['price', Array.isArray(product.price) ? product.price : []],
            ['assemblyDate', Array.isArray(product.assemblyDate) ? product.assemblyDate : []],
            ['retailer', Array.isArray(product.retailer) ? product.retailer : []]
        ];

        for (const [field, values] of requiredFields) {
            if (values.length === 0) {
                accept(
                    'error',
                    `Missing required field '${field}' in Product '${product.name}'.`,
                    { node: product }
                );
            }
        }
    }

    // Ensure that Product attributes do not appear multiple times within the same product
    checkProductDuplicateFields(product: Product, accept: ValidationAcceptor): void {
        const fields: [string, unknown[]][] = [
            ['productName', Array.isArray(product.productName) ? product.productName : []],
            ['price', Array.isArray(product.price) ? product.price : []],
            ['assemblyDate', Array.isArray(product.assemblyDate) ? product.assemblyDate : []],
            ['retailer', Array.isArray(product.retailer) ? product.retailer : []]
        ];

        for (const [field, values] of fields) {
            if (values.length > 1) {
                accept(
                    'error',
                    `Duplicate field '${field}' found ${values.length} times in Product '${product.name}'.`,
                    { node: product }
                );
            }
        }
    }

    // Ensure that each Consumer has at least one Order
    checkConsumerHasOrder(consumer: Consumer, accept: ValidationAcceptor): void {
        const orders = consumer.orders ?? [];
        if (orders.length === 0) {
            accept(
                'error',
                `Consumer '${consumer.name}' must have at least one order.`,
                { node: consumer }
            );
        }
    }

    // Ensure chronological order of dates in Return: assemblyDate <= orderDate <= deliveryDate
    checkChronologicalDates(ret: Return, accept: ValidationAcceptor): void {
        const orderRef = ret.order?.ref as Order | undefined;
        if (!orderRef) return;

        const productRef = orderRef.product?.ref as Product | undefined;
        if (!productRef) return;

        // Extract strings
        const assemblyDateStr = productRef.assemblyDate?.[0];
        const orderDateStr = orderRef.orderDate;
        const shipment = ret.process?.processType?.shipment as Shipment | undefined;
        const deliveryDateStr = shipment?.deliveryDate;

        // Parse into JS dates
        const assembly = new Date(assemblyDateStr ?? '');
        const order = new Date(orderDateStr ?? '');
        const delivery = new Date(deliveryDateStr ?? '');

        // Only check if valid dates
        if (isNaN(assembly.getTime()) || isNaN(order.getTime())) return;
        if (delivery && isNaN(delivery.getTime())) return;

        // assembly <= order check
        if (assembly > order) {
            accept(
                'warning',
                `Order date (${orderDateStr}) is before product assembly date (${assemblyDateStr}).`,
                { node: ret }
            );
        }

        // order <= delivery check
        if (order > delivery) {
            accept(
                'warning',
                `Return shipment delivered (${deliveryDateStr}) before the order date (${orderDateStr}).`,
                { node: ret }
            );
        }
    }
}