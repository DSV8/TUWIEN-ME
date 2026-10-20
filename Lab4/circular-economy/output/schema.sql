CREATE TABLE actors (
    id VARCHAR(64) PRIMARY KEY,
    kind VARCHAR(32) NOT NULL,
    CHECK (kind IN ('RETAILER', 'MANUFACTURER', 'CONSUMER'))
);

CREATE TABLE manufacturers (
    actor_id VARCHAR(64) PRIMARY KEY REFERENCES actors(id)
);

CREATE TABLE retailers (
    actor_id VARCHAR(64) PRIMARY KEY REFERENCES actors(id)
);

CREATE TABLE consumers (
    actor_id VARCHAR(64) PRIMARY KEY REFERENCES actors(id)
);

CREATE TABLE sustainability_goals (
    id VARCHAR(64) PRIMARY KEY,
    description TEXT NOT NULL,
    standard NUMERIC(10,2) NOT NULL,
    comparator VARCHAR(8) NOT NULL,
    CHECK (comparator IN ('MIN', 'MAX'))
);

CREATE TABLE facilities (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    CHECK (type IN ('RECYCLE', 'REFURBISH', 'REPAIR'))
);

CREATE TABLE facility_goals (
    facility_id VARCHAR(64) NOT NULL REFERENCES facilities(id),
    goal_id VARCHAR(64) NOT NULL REFERENCES sustainability_goals(id),
    PRIMARY KEY (facility_id, goal_id)
);

CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    assembly_date DATE NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(actor_id)
);

CREATE TABLE components (
    id VARCHAR(64) PRIMARY KEY,
    component_name VARCHAR(255) NOT NULL,
    state VARCHAR(32) NOT NULL,
    recycled BOOLEAN NOT NULL,
    manufacturer_id VARCHAR(64) NOT NULL REFERENCES manufacturers(actor_id),
    product_id VARCHAR(64) REFERENCES products(id),
    CHECK (state IN ('ASSEMBLED', 'IN_CIRCULAR_PROCESS', 'READY'))
);

CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    consumer_id VARCHAR(64) NOT NULL REFERENCES consumers(actor_id),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id),
    order_date DATE NOT NULL
);

CREATE TABLE returns (
    id VARCHAR(64) PRIMARY KEY,
    consumer_id VARCHAR(64) NOT NULL REFERENCES consumers(actor_id),
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    reason TEXT
);

CREATE TABLE circular_processes (
    id VARCHAR(64) PRIMARY KEY,
    return_id VARCHAR(64) NOT NULL REFERENCES returns(id),
    kind VARCHAR(32) NOT NULL,
    facility_id VARCHAR(64) NOT NULL REFERENCES facilities(id),
    energy_saved_kwh NUMERIC(10,2) NOT NULL,
    water_saved_l NUMERIC(10,2) NOT NULL,
    CHECK (kind IN ('RECYCLE', 'REPAIR', 'REFURBISH'))
);

CREATE TABLE recycle_process_components (
    process_id VARCHAR(64) NOT NULL REFERENCES circular_processes(id),
    component_id VARCHAR(64) NOT NULL REFERENCES components(id),
    PRIMARY KEY (process_id, component_id)
);

CREATE TABLE shipments (
    id VARCHAR(64) PRIMARY KEY,
    process_id VARCHAR(64) NOT NULL REFERENCES circular_processes(id),
    delivered BOOLEAN NOT NULL,
    delivery_date DATE NOT NULL,
    co2_emission NUMERIC(10,2) NOT NULL,
    destination_id VARCHAR(64) NOT NULL REFERENCES actors(id)
);