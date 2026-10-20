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

-- actors
INSERT INTO actors (id, kind) VALUES ('MediaMarkt', 'RETAILER');
INSERT INTO actors (id, kind) VALUES ('Saturn', 'RETAILER');
INSERT INTO actors (id, kind) VALUES ('AnyBike', 'RETAILER');
INSERT INTO actors (id, kind) VALUES ('AlpineOpticsAG', 'MANUFACTURER');
INSERT INTO actors (id, kind) VALUES ('DanubeDevicesGmbH', 'MANUFACTURER');
INSERT INTO actors (id, kind) VALUES ('CityCycleAG', 'MANUFACTURER');
INSERT INTO actors (id, kind) VALUES ('MobileTechGmbH', 'MANUFACTURER');
INSERT INTO actors (id, kind) VALUES ('C1', 'CONSUMER');
INSERT INTO actors (id, kind) VALUES ('C2', 'CONSUMER');
INSERT INTO actors (id, kind) VALUES ('C3', 'CONSUMER');
INSERT INTO actors (id, kind) VALUES ('C4', 'CONSUMER');
INSERT INTO retailers (actor_id) VALUES ('MediaMarkt');
INSERT INTO retailers (actor_id) VALUES ('Saturn');
INSERT INTO retailers (actor_id) VALUES ('AnyBike');
INSERT INTO manufacturers (actor_id) VALUES ('AlpineOpticsAG');
INSERT INTO manufacturers (actor_id) VALUES ('DanubeDevicesGmbH');
INSERT INTO manufacturers (actor_id) VALUES ('CityCycleAG');
INSERT INTO manufacturers (actor_id) VALUES ('MobileTechGmbH');
INSERT INTO consumers (actor_id) VALUES ('C1');
INSERT INTO consumers (actor_id) VALUES ('C2');
INSERT INTO consumers (actor_id) VALUES ('C3');
INSERT INTO consumers (actor_id) VALUES ('C4');
-- sustainability_goals
INSERT INTO sustainability_goals (id, description, standard, comparator)
                 VALUES ('SDG_EnergySaved', 'Minimum energy saved', 30, 'MIN');
INSERT INTO sustainability_goals (id, description, standard, comparator)
                 VALUES ('SDG_WaterSaved', 'Minimum water saved', 300, 'MIN');
INSERT INTO sustainability_goals (id, description, standard, comparator)
                 VALUES ('SDG_CO2Emission', 'Maximum CO2 Emission', 150, 'MAX');
-- facilities and facility_goals
INSERT INTO facilities (id, type) VALUES ('ViennaElectronicsRecycleFacility', 'RECYCLE');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('ViennaElectronicsRecycleFacility', 'SDG_EnergySaved');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('ViennaElectronicsRecycleFacility', 'SDG_CO2Emission');
INSERT INTO facilities (id, type) VALUES ('StadtWienBikeRepairShop', 'REPAIR');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('StadtWienBikeRepairShop', 'SDG_WaterSaved');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('StadtWienBikeRepairShop', 'SDG_CO2Emission');
INSERT INTO facilities (id, type) VALUES ('ViennaRefurbishmentCenter', 'REFURBISH');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('ViennaRefurbishmentCenter', 'SDG_EnergySaved');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('ViennaRefurbishmentCenter', 'SDG_WaterSaved');
INSERT INTO facility_goals (facility_id, goal_id)
                     VALUES ('ViennaRefurbishmentCenter', 'SDG_CO2Emission');
-- products
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_Camera_0', 'Camera', '2022-01-10', 499.99, 'MediaMarkt');
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_Camera_1', 'Camera', '2022-01-14', 499.99, 'MediaMarkt');
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_Printer_0', 'Printer', '2022-01-27', 129.99, 'Saturn');
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_Laptop_0', 'Laptop', '2022-02-13', 1099, 'Saturn');
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_Bike_0', 'Bike', '2022-02-01', 899, 'AnyBike');
INSERT INTO products (id, product_name, assembly_date, price, retailer_id)
                 VALUES ('P_MobilePhone_0', 'Mobile Phone', '2022-03-17', 799, 'MediaMarkt');
-- components
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_CPU_0',
                     'CPU',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Laptop_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_OLEDDisplay_0',
                     'OLED Display',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Laptop_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_Keyboard_0',
                     'Keyboard',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Laptop_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_InkCartridge_0',
                     'Ink Cartridge',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Printer_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_PaperTray_0',
                     'Paper Tray',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Printer_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_Battery_0',
                     'Battery',
                     'ASSEMBLED',
                     FALSE,
                     'DanubeDevicesGmbH',
                     'P_Laptop_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_CameraLens_0',
                     'Camera Lens',
                     'READY',
                     TRUE,
                     'AlpineOpticsAG',
                     'P_Camera_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_MemoryCard_0',
                     'Memory Card',
                     'READY',
                     TRUE,
                     'AlpineOpticsAG',
                     'P_Camera_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_CameraLens_1',
                     'Camera Lens',
                     'IN_CIRCULAR_PROCESS',
                     FALSE,
                     'AlpineOpticsAG',
                     'P_Camera_1'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_MemoryCard_1',
                     'Memory Card',
                     'IN_CIRCULAR_PROCESS',
                     FALSE,
                     'AlpineOpticsAG',
                     'P_Camera_1'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_BikeFrame_0',
                     'Bike Frame',
                     'ASSEMBLED',
                     FALSE,
                     'CityCycleAG',
                     'P_Bike_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_BikeWheels_0',
                     'Bike Wheels',
                     'ASSEMBLED',
                     FALSE,
                     'CityCycleAG',
                     'P_Bike_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_BikeGears_0',
                     'Bike Gears',
                     'ASSEMBLED',
                     FALSE,
                     'CityCycleAG',
                     'P_Bike_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_MobileCPU_0',
                     'Mobile CPU',
                     'ASSEMBLED',
                     FALSE,
                     'MobileTechGmbH',
                     'P_MobilePhone_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_MobileOLEDDisplay_0',
                     'Mobile OLED Display',
                     'ASSEMBLED',
                     FALSE,
                     'MobileTechGmbH',
                     'P_MobilePhone_0'
                 );
INSERT INTO components (id, component_name, state, recycled, manufacturer_id, product_id)
                 VALUES (
                     'C_MobilePhoneBattery_0',
                     'Mobile Phone Battery',
                     'ASSEMBLED',
                     FALSE,
                     'MobileTechGmbH',
                     'P_MobilePhone_0'
                 );
-- orders and returns
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O1C1', 'C1', 'P_Camera_0', '2022-05-15');
INSERT INTO returns (id, consumer_id, order_id, reason)
                     VALUES ('RO1C1', 'C1', 'O1C1', 'Product reached end of service life and is returned for component recovery.');
-- circular_processes
INSERT INTO circular_processes
                     (id, return_id, kind, facility_id, energy_saved_kwh, water_saved_l)
                     VALUES (
                         'RecycProc_RO1C1',
                         'RO1C1',
                         'RECYCLE',
                         'ViennaElectronicsRecycleFacility',
                         12.5,
                         250
                     );
-- recycle_process_components
INSERT INTO recycle_process_components (process_id, component_id)
                             VALUES ('RecycProc_RO1C1', 'C_CameraLens_0');
INSERT INTO recycle_process_components (process_id, component_id)
                             VALUES ('RecycProc_RO1C1', 'C_MemoryCard_0');
-- shipments
INSERT INTO shipments
                         (id, process_id, delivered, delivery_date, co2_emission, destination_id)
                         VALUES (
                             'RecycShipment_RO1C1',
                             'RecycProc_RO1C1',
                             TRUE,
                             '2025-10-01',
                             14.5,
                             'AlpineOpticsAG'
                         );
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O1C2', 'C2', 'P_Laptop_0', '2023-03-02');
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O2C2', 'C2', 'P_Printer_0', '2023-05-17');
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O1C3', 'C3', 'P_Bike_0', '2023-07-04');
INSERT INTO returns (id, consumer_id, order_id, reason)
                     VALUES ('RO1C3', 'C3', 'O1C3', 'Returned for technical repair and performance restoration.');
-- circular_processes
INSERT INTO circular_processes
                     (id, return_id, kind, facility_id, energy_saved_kwh, water_saved_l)
                     VALUES (
                         'RepProc_RO1C3',
                         'RO1C3',
                         'REPAIR',
                         'StadtWienBikeRepairShop',
                         25,
                         500
                     );
-- shipments
INSERT INTO shipments
                         (id, process_id, delivered, delivery_date, co2_emission, destination_id)
                         VALUES (
                             'RepShipment_RO1C3',
                             'RepProc_RO1C3',
                             TRUE,
                             '2025-09-21',
                             22,
                             'CityCycleAG'
                         );
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O1C4', 'C4', 'P_Camera_1', '2022-05-17');
INSERT INTO orders (id, consumer_id, product_id, order_date)
                     VALUES ('O2C4', 'C4', 'P_MobilePhone_0', '2022-07-07');
INSERT INTO returns (id, consumer_id, order_id, reason)
                     VALUES ('RO1C4', 'C4', 'O1C4', 'Product reached end of service life and is returned for component recovery.');
-- circular_processes
INSERT INTO circular_processes
                     (id, return_id, kind, facility_id, energy_saved_kwh, water_saved_l)
                     VALUES (
                         'RecycProc_RO1C4',
                         'RO1C4',
                         'RECYCLE',
                         'ViennaElectronicsRecycleFacility',
                         12.5,
                         250
                     );
-- recycle_process_components
INSERT INTO recycle_process_components (process_id, component_id)
                             VALUES ('RecycProc_RO1C4', 'C_CameraLens_1');
INSERT INTO recycle_process_components (process_id, component_id)
                             VALUES ('RecycProc_RO1C4', 'C_MemoryCard_1');
-- shipments
INSERT INTO shipments
                         (id, process_id, delivered, delivery_date, co2_emission, destination_id)
                         VALUES (
                             'RecycShipment_RO1C4',
                             'RecycProc_RO1C4',
                             FALSE,
                             '2025-11-25',
                             14.5,
                             'AlpineOpticsAG'
                         );
INSERT INTO returns (id, consumer_id, order_id, reason)
                     VALUES ('RO2C4', 'C4', 'O2C4', 'Returned for functional inspection and quality refurbishment to extend its lifecycle.');
-- circular_processes
INSERT INTO circular_processes
                     (id, return_id, kind, facility_id, energy_saved_kwh, water_saved_l)
                     VALUES (
                         'RefProc_RO2C4',
                         'RO2C4',
                         'REFURBISH',
                         'ViennaRefurbishmentCenter',
                         18.75,
                         260
                     );
-- shipments
INSERT INTO shipments
                         (id, process_id, delivered, delivery_date, co2_emission, destination_id)
                         VALUES (
                             'RefurbShipment_RO2C4',
                             'RefProc_RO2C4',
                             TRUE,
                             '2025-06-18',
                             12,
                             'MobileTechGmbH'
                         );