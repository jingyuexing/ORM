class User {
    username: string = "";
    age: number = 0
}

interface WhereOptions<T> {
    whereType: "and" | "or",
    entity: T
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
    entity: T
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
    expression.push(["(", columns.join(","), ")"].join(""))
    expression.push("from", table)
    return expression.join(" ")
}

export function Where<T>(config: WhereOptions<T>) {
    let expression = ["where"]
    let { whereType = "or", entity = {} } = config;
    let condition = [];
    for (let [key, value] of getObjectItems(entity)) {
        condition.push(`${key}=${value}`)
    }
    expression.push(condition.join(` ${whereType} `))
    return expression.join(" ")
}
// it should be generator sql like 
export function Update<T extends ObjectConstructor>(config: UpdateOptions<T>) {
    let expression = ["update"]
    let { entity, data } = config;
    let pair = []
    expression.push(entity.constructor.name)
    for (let [key, value] of getObjectItems(data)) {
        pair.push(`${key}=${value}`)
    }
    expression.push("set")
    expression.push(pair.join(","))
    return expression.join(" ")
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