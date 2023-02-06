
type LikeNumber = number | `${number}`

export type WhereCondition<T> = {
    [P in keyof T]?: Partial<{
        moreThant: LikeNumber,
        lessThant: LikeNumber,
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

type ColumnName<T> = keyof T;

interface SelectOptions<T> {
    select: 
    "*" 
    | FieldSelect<Partial<T>>;
    exclude: (keyof T)[];
    entity: T;
}
export interface WhereOptions<T> {
    whereType?: "and" | "or",
    entity: T,
    where?: WhereCondition<T>
}
interface UpdateOptions<T> {
    data: Partial<T>,
    entity: T,
    where: WhereCondition<T>
}

interface SQLType {
  "bigint": "postgre"|"maria",
  "bigserial": "postgre",
  "binary": "maria",
  "bit": "mysql"|"postgre"|"maria",
  "bit varying": "postgre",
  "blob": "sqlite"|"maria",
  "bool": "postgre",
  "boolean": "postgre"|"maria",
  "box": "postgre",
  "bytea": "postgre",
  "char": "mysql"|"postgre"|"maria",
  "char byte": "maria",
  "character": "postgre",
  "character varying": "postgre",
  "cidr": "postgre",
  "circle": "postgre",
  "date": "mysql"|"postgre"|"maria",
  "datetime": "mysql"|"maria",
  "dec": "maria",
  "decimal": "mysql"|"postgre"|"maria",
  "double": "maria",
  "double precision": "postgre",
  "enum": "mysql"|"maria",
  "fixed": "maria",
  "float": "maria",
  "float4": "postgre",
  "float8": "postgre",
  "geometry": "maria",
  "geometrycollection": "maria",
  "inet": "postgre",
  "inet4": "maria",
  "inet6": "maria",
  "int": "mysql"|"postgre"|"maria",
  "int1": "maria",
  "int2": "postgre"|"maria",
  "int3": "maria",
  "int4": "postgre"|"maria",
  "int8": "postgre"|"maria",
  "integer": "mysql"|"sqlite"|"postgre"|"maria",
  "interval": "postgre",
  "json": "postgre"|"maria",
  "jsonb": "postgre",
  "line": "postgre",
  "linestring": "maria",
  "long": "maria",
  "long varchar": "maria",
  "longblob": "maria",
  "longtext": "maria",
  "lseg": "postgre",
  "macaddr": "postgre",
  "macaddr8": "postgre",
  "mediumblob": "maria",
  "mediumint": "maria",
  "mediumtext": "maria",
  "money": "postgre",
  "multilinestring": "maria",
  "multipoint": "maria",
  "multipolygon": "maria",
  "number": "mysql"|"maria",
  "numeric": "sqlite"|"postgre"|"maria",
  "path": "postgre",
  "pg_lsn": "postgre",
  "pg_snapshot": "postgre",
  "point": "postgre"|"maria",
  "polygon": "postgre"|"maria",
  "real": "sqlite"|"postgre",
  "row": "maria",
  "serial": "postgre",
  "serial2": "postgre",
  "serial4": "postgre",
  "serial8": "postgre",
  "set": "maria",
  "smallint": "mysql"|"postgre"|"maria",
  "smallserial": "postgre",
  "text": "sqlite"|"postgre"|"maria",
  "time": "postgre"|"maria",
  "timestamp": "mysql"|"postgre"|"maria",
  "timestamptz": "postgre",
  "timetz": "postgre",
  "tinyblob": "maria",
  "tinyint": "mysql"|"maria",
  "tinytext": "maria",
  "tsquery": "postgre",
  "tsvector": "postgre",
  "txid_snapshot": "postgre",
  "utc_date": "mysql",
  "uuid": "postgre"|"maria",
  "varbinary": "maria",
  "varbit": "postgre",
  "varchar": "mysql"|"postgre"|"maria",
  "xml": "postgre",
  "year": "maria",
}
type PickSQLType<T, SQL extends "mysql" | "sqlite" | "postgre"| "maria"> = keyof {
  [K in keyof T as SQL extends T[K] ? K : never]: "";
};

type MySQLType = PickSQLType<SQLType, "mysql">; // "decimal" | "int" | "float" | ...
type MariaDBType = PickSQLType<SQLType, "maria">;
type SQLiteType = PickSQLType<SQLType, "sqlite">;
type PogrestDBType = PickSQLType<SQLType, "postgre">
interface TableOptions<T> {

}
/**
 * [string description]
 * @type {[type]}
 */
export declare function getObjectItems<T extends object & {}>(obj: T): Generator<[string, unknown], any, any>;
export declare function Where<T extends unknown>(options: WhereOptions<T>): string;
export declare function Select<T extends unknown>(options: SelectOptions<T>): string;
export declare function Update<T extends unknown>(options: UpdateOptions<T>): string;
export declare function Table<T extends { new(options: TableOptions<T>) }>(): () => void;
export declare function moreThant(statement: string, condition: LikeNumber): string
export declare function lessThant(statement: string, condition: LikeNumber): string
export declare function lessThantOrEqual(statement: string, condition: LikeNumber): string
export declare function moreThantOrEqual(statement: string, condition: LikeNumber): string
export declare function Equal(statement: string, condition: LikeNumber): string
export declare function notEqual(statement: string, condition: LikeNumber): string
/**
 * [Between description]
 * @param {string} columns [description]
 * @param {[any,any]}   range   [description]
 * @param {string} any     [description]
 */
export declare function Between<T>(column: ColumnName<T>, range: [any, any]): string;
