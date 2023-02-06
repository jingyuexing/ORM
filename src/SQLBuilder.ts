/// <reference path="./lib.SQLBuilder.d.ts" />

function* getObjectItems<T extends object & {}>(obj: T) {
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
    condition: number | `${number}`| "?"
) {
    return [
        statement,
        oprater,
        condition
    ].join(" ")
}

export function moreThant(statement: string, condition: number | `${number}`) {
    let expression = conditionExpression(
        statement,
        ">",
        "?"
    )
    return convertValue(expression,[condition])
}

export function lessThant(statement: string, condition: number | `${number}`) {
    let expression = conditionExpression(
        statement,
        "<",
        "?"
    )
    return convertValue(expression,[condition])
}
export function moreThantOrEqual(statement: string, condition: number | `${number}`) {
    let expression = conditionExpression(
        statement,
        ">=",
        "?"
    )
    return convertValue(expression,[condition])
}
export function lessThantOrEqual(statement: string, condition: number | `${number}`) {
    let expression = conditionExpression(
        statement,
        "<=",
        "?"
    )
    return convertValue(expression,[condition])

}

export function Equal(statement: string, condition: LikeNumber) {
    let expression = conditionExpression(
        statement,
        "=",
        "?"
    )
    return convertValue(expression,[condition])
}

export function notEqual(statement: string, condition: LikeNumber) {
    let expression = conditionExpression(
        statement,
        "!=",
        "?"
    );
    return convertValue(expression,[condition])
}
export function Between(columns: string, range: [any, any]) {
    let expression = [
        columns,
        "between",
        ["?","?"].join(" and ")
    ].join(" ")
    return convertValue(expression,range)
}
export function OrderBy(args: string[], order: "ASC" | "DESC") {
    // ORDER BY column1, column2, ... ASC|DESC;
    let columnTemplate:"?"[] = []
    args.forEach(()=>{
        columnTemplate.push("?")
    })
    let expression = [
        "order",
        "by",
        columnTemplate.join(","),
        order
    ].join(" ")
    return convertValue(expression,args)
}
export function Like(statement: string) {
    let expression = [
        "like",
        `?`
    ].join(" ")
    return convertValue(expression,[statement])
}


export function In(column: string, conditions: string[]) {
    let templateString = []
    for(let i =0 ;i<conditions.length;i++){
        templateString.push("?")
    }
    let expression = [
        column,
        "in",
        "(",
        templateString.join(","),
        ")"
    ].join(" ")
    return convertValue(expression,conditions)
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

export function Table<T extends {new(options:TableOptions<T>)}>(target:T){
    return class extends target{
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
    return key.split(".").reduce((prev,current)=>target[current])
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