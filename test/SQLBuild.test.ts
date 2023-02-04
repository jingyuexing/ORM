import { describe, expect, it, test } from "vitest";
import { generatorColumns, generatorParameters, Select, Update, typeIs, convertValue } from "@/SQLBuilder";

class User {
    username: string = "";
    age: number = 0;
    address: string = "";
    constructor(username: string, age: number, address: string) {
        this.username = username
        this.age = age;
        this.address = address;
    }
}

let user = new User("张三", 22, "北京朝阳区")
describe("test sql builder", () => {
    it("generator parameters", () => {
        expect(generatorParameters<User>(user)).eq("(?,?,?)")
    });
    it("generator columns", () => {
        expect(generatorColumns(user)).eq("(username,age,address)");
    });
    it("testing select", () => {
        // select syntax is:
        // select * from <tablename>
        // select (column1,column1=2) from <tablename>;
        expect(Select<User>({
            select: {
                username: true
            },
            entity: user
        })).eq("select (username) from User")
    });
    it("testing update", () => {
        // update syntax is:
        //   update <tablename> set column1=value,column2=value2,column3=value3 where id=value4
        expect(Update<User>({
            data: {
                username: "李四",
                age: 23,
            },
            entity: user
        })).toBe(`update User set username="李四",age=23;`)
    });
    it("testing update by where", () => {
        // update syntax is:
        //   update <tablename> set column1=value,column2=value2,column3=value3 where id=value4
        expect(Update<User>({
            data: {
                username: "李四",
                age: 23,
            },
            entity: user,
            where:{
                select:{
                    username:"张三"
                }
            }
        })).toBe(`update User set username="李四",age=23 where username="张三";`)
    });
    it("testing convert values",()=>{
        expect(convertValue(
            "(?,?,?,?)",
            ["张三","赵四","王五","孙六"]
        )).toBe(`("张三","赵四","王五","孙六")`)
    })
    it("testing convert values input arrary",()=>{
        expect(convertValue(
            [
                "(?,?,?,?)",
                ["张三","赵四","王五","孙六"]
            ]
        )).toBe(`("张三","赵四","王五","孙六")`)
    })
    it("testing typeis array",()=>{
        expect(typeIs([])).toBe("array")
    })
    it("testing typeis object",()=>{
        expect(typeIs({})).toBe("object")
    });
    it("testing typeis map",()=>{
        expect(typeIs("")).toBe("string")
    })
    it("testing typeis number",()=>{
        expect(typeIs(12)).toBe("number")
    });
    it("testing typeis date",()=>{
        expect(typeIs(new Date())).toBe("date")
    })
})
