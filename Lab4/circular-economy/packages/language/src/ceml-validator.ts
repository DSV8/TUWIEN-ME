import type { ValidationChecks } from 'langium';
import type { CemlAstType } from './generated/ast.js';
import type { CemlServices } from './ceml-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: CemlServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.CemlValidator;
    const checks: ValidationChecks<CemlAstType> = {
        // TODO: Declare validators for your properties
        // See doc : https://langium.org/docs/learn/workflow/create_validations/
        /*
        Element: validator.checkElement
        */
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class CemlValidator {

    // TODO: Add logic here for validation checks of properties
    // See doc : https://langium.org/docs/learn/workflow/create_validations/
    /*
    checkElement(element: Element, accept: ValidationAcceptor): void {
        // Always accepts
    }
    */
}
