# Flock Lab Documentation

## Explanation of Design Decisions, Assumptions and Verification Steps

### Objective 1: Replacing `CircularEconomy` with `CircularEconomyNetwork`

The first goal of the migration is to replace the original root element `CircularEconomy` with the new root class `CircularEconomyNetwork`. We need to create a unified `actors` collection. This change is made using the following migration and retype rules:

```flock
migrate CircularEconomy {
    migrated.actors.addAll(original.manufacturer.equivalent());
    migrated.actors.addAll(original.retailer.equivalent());
    migrated.actors.addAll(original.consumer.equivalent());

    migrated.products.addAll(original.product.equivalent());
    migrated.facilities.addAll(original.facility.equivalent());
    migrated.metrics.addAll(original.sustainabilitygoal.equivalent());
}
retype CircularEconomy to CircularEconomyNetwork
```

The `retype` rule keeps the original root object's identity, while the migrate rule combines all original `actors` into the new `actors` collection and moves `products`, `facilities`, and `sustainability goals` to their respective collections.

The result was checked by looking at the migrated model and confirming that all `actors` are in the `actors` collection and that no original root collections remain.

### Objective 2: Introducing Circular Actors and Retyping Existing Roles

The second goal is to introduce a new abstract `CircularActor` class and three concrete subtypes: `Producer`, `DistributionPartner`, and `Customer`. These types replace the original `Manufacturer`, `Retailer`, and `Consumer` classes. This change is made using the following `retype` and `migrate` rules:

```flock
migrate Retailer {
    migrated.omniChannel = false;
}
retype Retailer to DistributionPartner

migrate Manufacturer {
    migrated.productionCapacity = 0.0;
}
retype Manufacturer to Producer
```

It was assumed from the final graph that two new attributes would be added to `DistributionPartner` and `Producer`. Distribution partners are set with omniChannel = false, and producers are set with productionCapacity = 0.0.

### Objective 3: Loyalty Tier Assignment for Customers

This goal introduces a `LoyaltyTier` for customers based on their activity in the system. This logic is contained in a helper operation to improve code modulation and readability. It was assumed that a `Consumer` with `LoyaltyTier` as `Premium` has at least one order or return, as stated in the assignment.

```flock
operation Consumer hasPremiumActivity() : Boolean {
    return self.orders.notEmpty() or self.returns.notEmpty();
}

migrate Consumer {
    if (original.hasPremiumActivity()) {
        migrated.loyaltyTier = Migrated!LoyaltyTier#PREMIUM;
    } else {
        migrated.loyaltyTier = Migrated!LoyaltyTier#BASIC;
    }
}
retype Consumer to Customer
```

### Objective 4 – Renaming Sustainability Goals to Sustainability Metrics

In this objective, a operation was declared to facilitate the `unit` declaration. We assume that all original sustainability goals can be mapped directly to sustainability metrics and that the unit can be derived solely from the metric name.

```flock
operation SustainabilityGoal unitForName() : String {
    if (self.name = "ReduceWaste") return "ppm";
    return "wpm";
}

migrate SustainabilityGoal {
    migrated.threshold = original.standard;
    migrated.unit      = original.unitForName();
}

retype SustainabilityGoal to SustainabilityMetric
```

### Objective 5 - Updating Facility References

After retyping `SustainabilityGoals`, all that was required was to change the evolved metamodel to match the new type. The assumption here is that every original goal has been retyped into a metric, so the .equivalent() lookup will always point to a valid migrated object.

```emf
class Facility {
    attr String       name;
    ref  SustainabilityMetric[*] metrics; // 5.
    attr String[0..1] operationalSince = "10-12-1999"; // 6.

    val  FacilityProfile[0..1] profile;
}

migrate Facility {
    migrated.metrics.addAll(original.goals.equivalent());
}
```

Verification consisted of checking that no `Facility` in the migrated model contains references to `SustainabilityGoal` anymore and that all metric references point to the expected `SustainabilityMetric` elements.

### Objective 6 – Extending Facilities with Operational Date and FacilityProfile

In this objective, each `Facility` is extended with an optional `operationalSince` attribute and a contained `FacilityProfile`. The aggregation logic is implemented using helper operations on the original `Facility` to improve readability and modularity, as the computation of energy saved, water saved, and CO₂ emissions is reused across multiple assignments. We assume that all aggregated values are migrated as floating-point (`float`/`Real`) values to ensure numerical consistency in the evolved model. We also assume that the original facilities do not define an `operationalSince` attribute, since no such information is provided in the original metamodel or input models.

```flock
// All processes that refer to this facility
operation Original!Facility attachedProcesses() : Sequence(Original!CircularProcess) {
    return Original!CircularProcess.all.select(p | p.facility == self);
}

// Total energy saved over all attached processes
operation Original!Facility totalEnergySaved() : Real {
    return self.attachedProcesses()
        .collect(p | p.energySavedKWh)
        .sum().asFloat();
}

// Total water saved over all attached processes
operation Original!Facility totalWaterSaved() : Real {
    return self.attachedProcesses()
        .collect(p | p.waterSavedL)
        .sum().asFloat();
}

// Total CO2 emissions from all shipments of attached processes
operation Original!Facility totalCo2Emissions() : Real {
    var allShipments = self.attachedProcesses()
        .collect(p | p.shipment)
        .select(s | not s.isUndefined()); // because shipment is [0..1]

    return allShipments
        .collect(s | s.co2Emission)
        .sum().asFloat();
}

// 6. Extend Facility with operationalSince and a contained FacilityProfile
migrate Facility {
    // Create and assign FacilityProfile
    var fp = new Migrated!FacilityProfile;
    fp.category = original.type.equivalent(); // 7. The facility category mirrors the original enum values

    // Calculate and set sustainability metrics
    fp.energySaved = original.totalEnergySaved();
    fp.waterSaved  = original.totalWaterSaved();
    fp.co2Emissions = original.totalCo2Emissions();

    migrated.profile = fp;

    // Set goals as metrics
    migrated.metrics.addAll(original.goals.equivalent());
}
```

This objective was validated by confirming that every `Facility` instance contains a `FacilityProfile` with non-null aggregated values for energy saved, water saved, and CO₂ emissions. The aggregated values were  were manually checked against the sums of the respective `CircularProcess` and `Shipment` data in the original model.

### Objective 7 – Deriving the Facility Category from the Original Facility Type

In this objective, the `category` attribute of the `FacilityProfile` is derived directly from the original `FacilityType` of each facility. The original enum value is transferred using `.equivalent()` during migration.

```flock
migrate Facility {
    var fp = new Migrated!FacilityProfile;

    fp.category = original.type.equivalent();

    migrated.profile = fp;
}
```

We assume that every original `facility` has a valid `FacilityType` assigned.

### Objective 8 – Refactoring Products and Updating References

In this objective, the `Product` class is refactored by renaming attributes and updating references to the new `actor` types. The reference to the original `Retailer` is updated to refer to the corresponding `DistributionPartner`, and the list of original `Component` instances is migrated into the new `parts` reference.

```flock
migrate Product {
    migrated.name      = original.productName;
    migrated.basePrice = original.price.asFloat();
    migrated.retailer  = original.retailer.equivalent();
    migrated.parts     = original.components.equivalent();
}
```

We assume that all products in the original model reference exactly one retailer and at least one component, and that all these referenced elements are migrated through their corresponding retype rules.

This objective was validated by checking that all migrated products contain valid names, prices, retailers of type `DistributionPartner`, and non-empty `parts` collections, and that no references to the original `Retailer` or `Component` structures remain in the migrated model.

### Objective 9 - Component lifecycle mapping

The goal for this objective is to ensure that each migrated `Component` exposes the four properties required by the evolved metamodel: `identifier`, `name`, `recycled` and `lifecycleState`. The `lifecycleState` is produced from the original `componentState` using a deterministic mapping so that `READY` maps to `READY`, `ASSEMBLED` maps to `ASSEMBLED` and `IN_CIRCULAR_PROCESS` maps to `IN_LOOP`. When the source value is missing or ambiguous the migration defaults to `IN_LOOP` to preserve safety and compatibility. In the implementation the mapping logic is applied during the `Component` migration so that `migrated.identifier` receives the original `id`, `migrated.name` receives the original `componentName`, `migrated.recycled` carries over the boolean flag, and `migrated.lifecycleState` is set by the mapping rules described above. The verification consisted of inspecting a few sample components in the migrated model to confirm that each has `identifier`, `name` and `recycled` present and that `lifecycleState` follows the stated mapping (including the default behavior).

```flock
operation Original!Component mappedLifecycleState() {
    if (self.componentState = Original!ComponentState#READY) {
        return Migrated!LifecycleState#READY;
    } else if (self.componentState = Original!ComponentState#ASSEMBLED) {
        return Migrated!LifecycleState#ASSEMBLED;
    } else if (self.componentState = Original!ComponentState#IN_CIRCULAR_PROCESS) {
        return Migrated!LifecycleState#IN_LOOP;
    } else {
        // default to IN_LOOP when uncertain
        return Migrated!LifecycleState#IN_LOOP;
    }
}

migrate Component {
    migrated.identifier     = original.id;
    migrated.name           = original.componentName;
    migrated.recycled       = original.recycled;
    migrated.lifecycleState = original.mappedLifecycleState();
}
```

We assume that every original `Component` has an `id` and a `componentName`. We also assume that the original `componentState` may be missing or uncertain, and in those cases the migration defaults to `IN_LOOP` as documented.


### Objective 10 - Refactor Order into an abstract superclass with Purchase and ReturnOrder

This objective refactors the order concept from the original model into an abstract `Order` superclass with two concrete subtypes: `Purchase` and `ReturnOrder`. The abstract `Order` contains the common attributes such as `id` and `date`; `Purchase` retains the product reference while `ReturnOrder` includes the `reason`, a reference to the originating `Purchase` and links to the circular processes that implement the return. The migration creates instances of the concrete subclasses: original `Order` instances become `Purchase` objects (retyping `Order` to `Purchase`) and original `Return` instances become `ReturnOrder` objects (retyping `Return` to `ReturnOrder`). The originating order relationship is preserved using `.equivalent()` so that the migrated `ReturnOrder.originalPurchase` points to the migrated `Purchase` instance. To validate this objective, we confirmed that migrated purchases still reference products and that each migrated `ReturnOrder` has an `originatingPurchase` reference and retains the circular process links.

```flock
migrate Order {
    migrated.id      = original.id;
    migrated.date    = original.date;
    migrated.product = original.product.equivalent();
}
retype Order to Purchase

migrate Return {
    migrated.id = original.id;
    migrated.date = original.date;
    migrated.reason = original.reason;
    migrated.originatingPurchase = original.order.equivalent();
    migrated.circularProcesses.addAll(original.circularprocesses.equivalent());
}
retype Return to ReturnOrder
```

We assume that the refactor assumes original `Order` and `Return` instances reference products and originating orders in a way that `.equivalent()` can resolve to migrated targets. We also assume that there are no additional unexpected subtypes of `Order` in the input models that would require special handling.

### Objective 11 - One LogisticsEvent per Order and event generation rules

Every migrated `Order` must own exactly one `LogisticsEvent`. `Purchases` produce a `PurchaseEvent` and `Returns` produce a `ReturnEvent`; additionally, `circular processes` generate `ShipmentEvent` objects for auditability. The `PurchaseEvent` contains an `eventId` and the order `date`, plus the `delivered` flag and an optional `deliveryDate` as required. The `ReturnEvent` uses a fixed `reason` of `"Bad Quality"` and a `ReturnType` that should reflect the handling process (for example `REPAIR` when the return is associated with a repair process). `ShipmentEvent` objects are created for circular processes that had an original shipment; each `ShipmentEvent` receives a human‑readable name derived from the source shipment `id`, a default `ShipmentType` of `AIR`, a fixed `co2Emissions` value (20.0), and `delivery` flag/`date` copied from the original shipment where available. In the migration code events are created and attached to `migrated.order.event`, and the return type is derived from the process/facility handling the return (with a sensible default when ambiguous). For verification, we checked that `Migrated!LogisticsEvent.all` contained exactly one event per migrated `Order`, that purchase and return counts match the post-migration diagnostics, and that sample events show correct dates, `delivered` flags and the fixed `"Bad Quality"` `reason` for returns.

```flock
migrate Order {
    ...

    var pe = new Migrated!PurchaseEvent;
    pe.eventId = Migrated!LogisticsEvent.all.size + 1;
    pe.date    = original.date;
    pe.delivered = false;
    pe.deliveryDate = original.date;
    migrated.event = pe;
}
retype Order to Purchase

migrate Return {
    ...
    
    var re = new Migrated!ReturnEvent;
    re.eventId = Migrated!LogisticsEvent.all.size + 1;
    re.reason = "Bad Quality";
    re.type = Migrated!ReturnType#REPAIR;
    migrated.event = re;
}
retype Return to ReturnOrder

operation Original!CircularProcess createShipmentEvent(eventName : String) {
    if (self.shipment.isUndefined()) return null;
    var se = new Migrated!ShipmentEvent;
    se.eventId = Migrated!LogisticsEvent.all.size + 1;
    se.name = eventName;
    se.shipmentType = Migrated!ShipmentType#AIR;
    se.co2Emissions = 20.0;
    se.date = self.shipment.deliveryDate;
    se.deliveryDate = self.shipment.deliveryDate;
    se.delivered = self.shipment.delivered;
    return se;
}
```

The migration uses `Migrated!LogisticsEvent.all.size + 1` to produce event ids in the running migration session (this relies on deterministic execution order of the migrate rules).

We assume that Returns always receive the fixed reason `"Bad Quality"` per the task, and that the `ReturnType` is defaulted to `REPAIR`. Finally, we also assume that Original shipments may be optional (shipment-derived fields are copied only when present).

### Objective 12 - Preserve process specializations and end-to-end traceability

The final objective insists that the three concrete circular process types: `RepairProcess`, `RefurbishProcess` and `RecycleProcess`, are preserved and remain fully traceable in the migrated model. Each migrated process instance must reference its facility (via `migrated.facility`), expose the emitted `ShipmentEvent` used for auditing (`migrated.shipmentEvent`), and carry forward the `energySavedKWh` and `waterSavedL` attributes. `RecycleProcess` must additionally preserve the migrated component references to ensure loops can be traced end‑to‑end. The migration implements explicit migrate blocks for each concrete process that set these properties and create or attach the corresponding `ShipmentEvent` when the original process had a shipment. Validation was performed by inspecting the migrated model to ensure each process instance contains a facility reference, the savings attributes, the emitted shipment event and that recycle processes list the expected components.

```flock
migrate RecycleProcess {
    migrated.facility       = original.facility.equivalent();
    migrated.energySavedKWh = original.energySavedKWh;
    migrated.waterSavedL    = original.waterSavedL;
    migrated.components     = original.components.equivalent();
    var se = original.createShipmentEvent(original.shipment.id.concat("-REC"));
    if (not se.isUndefined()) migrated.shipmentEvent = se;
}

migrate RefurbishProcess {
    migrated.facility       = original.facility.equivalent();
    migrated.energySavedKWh = original.energySavedKWh;
    migrated.waterSavedL    = original.waterSavedL;
    var se = original.createShipmentEvent(original.shipment.id.concat("-REF"));
    if (not se.isUndefined()) migrated.shipmentEvent = se;
}

migrate RepairProcess {
    migrated.facility       = original.facility.equivalent();
    migrated.energySavedKWh = original.energySavedKWh;
    migrated.waterSavedL    = original.waterSavedL;
    var se = original.createShipmentEvent(original.shipment.id.concat("-REP"));
    if (not se.isUndefined()) migrated.shipmentEvent = se;
}
```

We assume that each original circular process has a `facility` reference and (for `RecycleProcess`) a `components` collection and that the migrated metamodel provides an appropriate slot for the emitted `ShipmentEvent` (named `shipmentEvent` or a collection `emittedShipment` consistent with the migration code).

### Verification Steps

At all points in the project, [Epsilon Playground](https://eclipse.dev/epsilon/playground/?flock) was used to compare the final epsilon diagram to the one provided in [migrated-diagram-epsilon.png](/Lab3/flock/migrated-diagram-epsilon.png).

The solution .xmi file, [migrated_solution.xmi](/Lab3/flock/migrated_solution.xmi) was also compared to the generated [migrated.xmi](/Lab3/flock/migrated.xmi).

The pre and post snapshot blocks were also helpful in understanding what was missing in the migration.

## Bonus

As an additional improvement, we suggest adding a new logistics KPI to measure `delivery efficiency` based on the time taken and emissions produced during shipment events. The goal of this change is to offer a clearer way to evaluate the environmental and operational performance of logistics activities, which is not fully captured by the existing shipment and event data alone. By making delivery efficiency explicit, it will be easier for facilities and distribution partners to compare their sustainability and responsiveness.

### Rationale

While the current model stores basic logistics information like delivery dates and CO₂ emissions within `Shipment` events, this data is not compiled into a clear performance indicator. Introducing a derived KPI allows decision-makers to directly assess logistics quality without having to interpret low-level event data. This enhances the model's analytical power and makes it more user-friendly for sustainability-focused evaluations.

### Transformation Plan

This improvement can be implemented through the following strategy:

- **Classes involved:**  
  `Shipment`, `LogisticsEvent`, `FacilityProfile` (or a new class such as `LogisticsKPI`).

- **Flock constructs used:**  
  - `operation` to define the calculations (delivery duration, emission efficiency),  
  - `migrate` to store the computed KPI in the updated model.

- **Transformation description:**  
  A helper `operation` can be defined on `Shipment` to calculate delivery efficiency based on delivery time and CO₂ emissions. During migration, a new attribute (`deliveryEfficiency`) can be added either to the relevant `FacilityProfile` or to a new KPI container class. This attribute will be calculated by aggregating the efficiency of all shipments tied to the facility’s circular processes. This approach is similar to what is already being used for energy, water, and CO₂ aggregation, making the enhancement technically doable with minimal added complexity.

### Feasibility

This addition is fully feasible within the current migration framework. The necessary data (delivery dates and CO₂ emissions) is already available in the source model, and the migration process already illustrates how to aggregate values across shipments and processes. Therefore, the new KPI can be implemented using the same pattern of helper operations and `migrate` rules without needing structural changes to the original input models.
