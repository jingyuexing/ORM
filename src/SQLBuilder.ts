class User {
    username: string = "";
    age: number = 0
}

interface WhereOptions<T> {
    whereType?: "and" | "or",
    entity: T
}

interface WhereConfig<T> {
    order: "ASC" | "DESC",
    select: FieldSelect<Partial<T>>
}

type FieldSelect<T> = {
    [K in keyof T]: boolean;
}

interface SelectOptions<T> {
    select: "*" | FieldSelect<Partial<T>>;
    entity: T;
}

interface UpdateOptions<T> {
    data: Partial<T>,
    entity: T,
    where: WhereConfig<T>
}

function* getObjectItems(obj: any) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = obj[key];
        yield [key, value]
    }
}

export function generatorColumns<T>(obj: T) {
    
    let columns = []
    for (let [key, value] of getObjectItems(obj)) {
        columns.push(key)
    }
    return `(${columns.join(",")})`
}

export function generatorParameters<T>(obj: T) {
    let parameters = []
    for (let [key, value] of getObjectItems(obj)) {
        parameters.push("?")
    }
    return ["(", parameters.join(","), ")"].join("");
}

function isEmpty(val: any) {
    if (typeof val === "object") {
        return Object.keys(val).length === 0;
    } else {
        return Boolean(val)
    }
}

export function typeIs(val: any) {
    if (typeof val !== "object") {
        return typeof val
    } else {
        switch (toString.call(val)) {
            case "[object Array]": return "array";
            case "[object Set]": return "set";
            case "[object Map]": return "map";
            case "[object Date]": return "date";
            default:
                return typeof val;
        }
    }
}

export function Select<T extends ObjectConstructor>(config: SelectOptions<T>) {
    let expression = ["select"]
    let columns: string[] = []
    let { select = "*", entity } = config;
    let table = entity.constructor.name;
    if (select != "*") {
        Object.keys(select as FieldSelect<Partial<T>>).forEach((key) => {
            if (select[key]) {
                columns.push(key)
            }
        })
    } else {
        expression.push(select as "*")
    }
    expression.push([
        "(", 
        columns.join(","),
        ")"
    ].join(""))
    expression.push("from", table)
    return expression.join(" ")
}

export function Where<T>(config: WhereOptions<T>):string{
    let expression = ["where"]
    let { whereType = "or", entity = {} } = config;
    let condition = [];
    let values = []
    for (let [key, value] of getObjectItems(entity)) {
        condition.push([
            key,
            "=",
            "?"
        ].join(""))
        values.push(value)
    }
    expression.push(condition.join(` ${whereType} `))
    return convertValue(expression.join(" "), values) as string
}
// it should be generator sql like 
export function Update<T extends ObjectConstructor>(config: UpdateOptions<T>) {
    let expression = ["update"]
    let { entity, data, where = undefined } = config;
    let pair = []
    let values = []
    expression.push(entity.constructor.name)

    for (let [key, value] of getObjectItems(data)) {
        pair.push([
            key,
            "=",
            "?"
        ].join(""))
        values.push(value)
    }
    expression.push("set")
    expression.push(pair.join(","))
    if (typeIs(where) !== "undefined") {
        expression.push(Where({
            entity: where?.select
        }))
    }
    return convertValue(expression.join(" "), values)+";"
}

// declare function convertValue(values:[string,any[]]):string;
export function convertValue(templateString: string | [string, any[]], values?: any[]) {
    let template_ = templateString;
    let values_ = values || [];
    if (typeIs(templateString) === "array") {
        [template_, values_] = templateString as [string, any[]];
    }
    for (let idx = 0; idx < values_.length; idx++) {
        let templateValue = "";
        if (typeIs(values_[idx]) === "string") {
            templateValue = `"${values_[idx]}"`    
        } else {
            templateValue = values_[idx]
        }
        template_ = template_.replace("?", templateValue)
    }
    return template_
}


export function expressionTemplate(obj: any) {
    let expression = []
    expression.push(generatorColumns(obj))
}

export function parameters2Value(obj: any) {
    let expression = [];
    
    for (let [key, value] of getObjectItems(obj)) {
        console.log("")
    }
}