class User {
    username: string = "";
    age: number = 0
}


interface WhereOptions<T> {
    whereType?: "and" | "or",
    entity: T,
    where?: WhereCondition<T>
}

type LikeNumber = number | `${number}`

type WhereCondition<T> = {
    [P in keyof T]?: Partial<{
        moreThant: LikeNumber,
        lessthant: LikeNumber,
        between: [LikeNumber, LikeNumber],
        equal: LikeNumber,
        moreThantOrEqual: LikeNumber,
        lessThantOrEqual: LikeNumber,
        notEqual: LikeNumber,
        like: string,
        in: (string | number)[],
        order: "ASC" | "DESC"
    }>
}
interface WhereConfig<T> {
    order: "ASC" | "DESC",
    select: FieldSelect<Partial<T>>
}

type FieldSelect<T> = {
    [K in keyof T]: boolean;
}

type CreateTableOptions<T> = {
    [K in keyof T]: {
        nullable: boolean,
        primary: boolean,
        length: LikeNumber,
        default: any,

    }
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

function conditionExpression(
    statement: string,
    oprater: ">" | "<" | "=" | ">=" | "<=" | "<>" | "!=",
    condition: number | `${number}`
) {
    return [
        statement,
        oprater,
        condition
    ].join(" ")
}

export function moreThant(statement: string, condition: number | `${number}`) {
    return conditionExpression(
        statement,
        ">",
        condition
    )
}

export function lessThant(statement: string, condition: number | `${number}`) {
    return conditionExpression(
        statement,
        "<",
        condition
    )
}
export function moreThantOrEqual(statement: string, condition: number | `${number}`) {
    return conditionExpression(
        statement,
        ">=",
        condition
    )
}
export function lessThantOrEqual(expression: string, condition: number | `${number}`) {
    return conditionExpression(
        expression,
        "<=",
        condition
    )
}

export function Equal(statement: string, condition: LikeNumber) {
    return conditionExpression(
        statement,
        "=",
        condition
    )
}

export function notEqual(statement: string, condition: LikeNumber) {
    return conditionExpression(
        statement,
        "!=",
        condition
    );
}

export function Between(columns: string, range: [any, any]) {
    return [
        columns,
        "between",
        range.join(" and ")
    ].join(" ")
}

export function Like(statement: string) {
    return [
        "like",
        `"${statement}"`
    ].join(" ")
}

export function In(column: string, conditions: string[]) {
    return [
        column,
        "in",
        "(",
        conditions.join(","),
        ")"
    ].join(" ")
}



function isEmpty(val: any) {
    if (typeof val === "object") {
        return Object.keys(val).length === 0;
    } else {
        return Boolean(val)
    }
}

export function OrderBy(args: string[], order: "ASC" | "DESC") {
    // ORDER BY column1, column2, ... ASC|DESC;
    return [
        "order",
        "by",
        args.join(","),
        order
    ].join(" ")
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

export function Where<T>(config: WhereOptions<T>): string {
    let expression = ["where"]
    let { whereType = "or", entity = {}, where } = config;
    let condition = [];
    let values = []
    if (typeIs(where) === "undefined") {
        for (let [key, value] of getObjectItems(entity)) {
            condition.push([
                key,
                "=",
                "?"
            ].join(""))
            values.push(value)
        }
    } else {
        let exp = {
            "order": OrderBy,
            "moreThant": moreThant,
            "moreThantOrEqual": moreThantOrEqual,
            "lessThant": lessThant,
            "lessThantOrEqual": lessThantOrEqual,
            "notEqual": notEqual,
            "between": Between,
            "like": Like,
            "in": In
        }
        let subExpression:string[] = []
        Object.keys(where as WhereCondition<T>).forEach((column) => {
            Object.keys(where[column]).forEach((condition) => {
                if(condition === "like"){
                    subExpression.push(
                        column,
                        exp[condition](where[column][condition])
                    )
                }else{
                    subExpression.push(exp[condition]([column], where[column][condition]))
                }
            })
        })
        expression.push(...subExpression)
    }
    expression.push(condition.join(` ${whereType} `))
    return convertValue(expression.join(" "), values) as string
}

export function getObjectProperties<T extends unknown>(target: T, key: string) {
    let entries = Object.entries(target);
    let keyCache = []
    let targetValue: any = null;
    for (let i = 0; i < entries.length; i++) {
        let [key, targetValue] = entries[i];
        keyCache.push(key)
        if (keyCache.join(".") == key) {
            return [keyCache.join("."), targetValue];
        } else {
            return getObjectProperties(targetValue, key)
        }
    }
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
            entity: where?.select,
        }))
    }
    return convertValue(expression.join(" "), values) + ";"
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