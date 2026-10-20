grammar Ceml

// TODO: Declare your grammar
// See doc : https://langium.org/docs/learn/workflow/write_grammar/

entry Model:    
    circularEconomy=CircularEconomy;

CircularEconomy:
    'CircularEconomy' name=ID '{'
        'components' ':' '[' components+=Component* ']'
        'products' ':' '[' products+=Product* ']'
        'facilities' ':' '[' facilities+=Facility* ']'
        'goals' ':' '[' goals+=SustainabilityGoal* ']'
        'actors' ':' '[' actors+=Actor* ']'
    '}'
;

Component:
    'Component' name=ID '('
        componentName=STRING ',' state=ComponentState
        (',' recycled?='recycled')?
    ')'
;

ComponentState:
    state = 'ASSEMBLED'
    | state = 'READY' 
    | state = 'IN_CIRCULAR_PROCESS'
;

Product:
    'Product' name=ID '{'
        (
        'productName' ':' productName+=STRING
        | 'price' ':' price+=DOUBLE
        | 'assemblyDate' ':' assemblyDate+=STRING
        | 'retailer' ':' retailer+=[Retailer]
        )*
        'components' ':' '[' ( components+=[Component] (',')? )* ']'
    '}'
;

FacilityType:
    type = 'RECYCLE'
  | type = 'REPAIR'
  | type = 'REFURBISH'
;

Facility:
    'Facility' name=ID
    '(' type=FacilityType ')'
    '{'
        'goals' ':' '[' goals+=[SustainabilityGoal] (',' goals+=[SustainabilityGoal])* (',')? ']'
    '}'
;

SustainabilityGoal:
    'SustainabilityGoal' name=ID
    '{' 'description' ':' description=STRING
     'standard' ':' standard=INT
     'comparator' ':' comparator=Comparator '}'
;

Comparator:
    comp = 'MIN'
  | comp = 'MAX'
;

Actor:
    Retailer
  | Manufacturer
  | Consumer
;

Retailer:
    'Retailer' name=ID
;

Manufacturer:
    'Manufacturer' name=ID
    '{' 
        'components' ':' 
            '[' 
                components+=[Component] (',' components+=[Component])* (',')?
            ']' 
    '}'
;

Consumer:
    'Consumer' name=ID
    '{'
        'orders' ':' '[' orders+=Order* ']'
        ('returns' ':' '[' (returns+=Return (',' returns+=Return)* (',')?)* ']')
    '}'
;


Order:
    'Order' name=ID
    '(' product=[Product] ',' orderDate=STRING ')'
;

Return:
    'Return' name=ID
    '(' 'order' ':' order=[Order] ')'
    '{'
        'reason' ':' reason=STRING
        process=CircularProcess
    '}'
;

CircularProcess:
    'CircularProcess' '->' processType=Process
;

Process:
    RecycleProcess
  | RepairProcess
  | RefurbishProcess
;

RecycleProcess:
    'RecycleProcess' name=ID
    '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySaved=DOUBLE
        'waterSavedL' ':' waterSaved=DOUBLE
        'components' ':' '[' components+=[Component] (',' components+=[Component])* (',')? ']'
        'shipment' ':' shipment=Shipment
    '}'
;

RepairProcess:
    'RepairProcess' name=ID
    '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySaved=DOUBLE
        'waterSavedL' ':' waterSaved=DOUBLE
        'shipment' ':' shipment=Shipment
    '}'
;

RefurbishProcess:
    'RefurbishProcess' name=ID
    '{'
        'facility' ':' facility=[Facility]
        'energySavedKWh' ':' energySaved=DOUBLE
        'waterSavedL' ':' waterSaved=DOUBLE
        'shipment' ':' shipment=Shipment
    '}'
;

Shipment:
    name=ID
    ( '(' status='delivered' ')' )?   // parentheses only if delivered
    '{'
        'deliveryDate' ':' deliveryDate=STRING
        'co2Emission' ':' co2=DOUBLE
        'destination' ':' destination=[Actor]
    '}'
;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal DOUBLE returns number: INT '.' INT;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;