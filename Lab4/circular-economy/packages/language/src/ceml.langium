grammar Ceml

entry CircularEconomy: 
    'CircularEconomy' name=ID '{'
        'components' ':' '['
            (components+=Component)*
        ']'
        'products' ':' '['
            (products+=Product)*
        ']'
        'facilities' ':' '['
            (facilities+=Facility)*
        ']'
        'goals' ':' '['
            (sustainabilityGoals+=SustainabilityGoal)*
        ']'
        'actors' ':' '['
            (actors+=Actor)*
        ']'
    '}';

Actor:
    Manufacturer | Retailer | Consumer;

Manufacturer:
    'Manufacturer' name=ID '{'
        'components' ':' '['
            (components+=[Component] (',' components+=[Component])*)?
        ']'
    '}';

Retailer:
    'Retailer' name=ID;

Consumer:
    'Consumer' name=ID '{'
        'orders' ':' '['
            (orders+=Order)*
        ']'
        'returns' ':' '['
            (returns+=Return)*
        ']'
    '}';

Product:
    'Product' name=ID '{'
        (
            'productName' ':' productName=STRING & 
            'price' ':' price=DOUBLE & 
            'assemblyDate' ':' assemblyDate=STRING & 
            'retailer' ':' retailer=[Retailer] &
            'components' ':' '[' (components+=[Component] (',' components+=[Component])*)? ']'
        )
    '}';

Component:
    'Component' name=ID '('
        componentName=STRING ',' componentState=ComponentState (',' recycled?='recycled')?
    ')'
;

Order:
    'Order' name=ID '(' product=[Product] ',' orderDate=STRING ')';

Return:
    'Return' name=ID '(' 'order' ':' order=[Order] ')' '{'
        'reason' ':' reason=STRING
        'CircularProcess' '->' circularProcess=CircularProcess
    '}';

CircularProcess:
    RepairProcess | RefurbishProcess | RecycleProcess;

RepairProcess:
    'RepairProcess' name=ID '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySavedKWh=DOUBLE
        'waterSavedL' ':' waterSavedL=DOUBLE
        ('shipment' ':' shipment=Shipment)?
    '}';

RefurbishProcess:
    'RefurbishProcess' name=ID '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySavedKWh=DOUBLE
        'waterSavedL' ':' waterSavedL=DOUBLE
        ('shipment' ':' shipment=Shipment)?
    '}';

RecycleProcess:
    'RecycleProcess' name=ID '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySavedKWh=DOUBLE
        'waterSavedL' ':' waterSavedL=DOUBLE
        'components' ':' '['
            (components+=[Component] (',' components+=[Component])*)?
        ']'
        ('shipment' ':' shipment=Shipment)?
    '}';

Shipment:
    name=ID ('(' (delivered?='delivered')? ')')? '{'
        'deliveryDate' ':' deliveryDate=STRING
        'co2Emission' ':' co2Emission=DOUBLE
        'destination' ':' destination=[Actor]
    '}';

Facility:
    'Facility' name=ID '(' type=FacilityType ')' '{'
        'goals' ':' '['
            (goals+=[SustainabilityGoal] (',' goals+=[SustainabilityGoal])*)?
        ']'
    '}';

SustainabilityGoal:
    'SustainabilityGoal' name=ID '{'
        'description' ':' description=STRING
        'standard' ':' standard=INT
        'comparator' ':' comparator=Comparator
    '}';

ComponentState:
    READY = 'READY' |
    ASSEMBLED = 'ASSEMBLED' |
    IN_CIRCULAR_PROCESS = 'IN_CIRCULAR_PROCESS';

FacilityType:
    REPAIR = 'REPAIR' | 
    REFURBISH = 'REFURBISH' | 
    RECYCLE = 'RECYCLE';

Comparator: 
    MIN ='MIN' | 
    MAX = 'MAX';

terminal ID: /[_a-zA-Z][\w_]*/;
terminal DOUBLE returns number: INT '.' INT;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;