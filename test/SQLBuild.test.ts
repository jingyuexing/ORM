import { describe, expect, it, test } from "vitest";
import { generatorColumns, generatorParameters, Select, Update } from "@/SQLBuilder";

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
        expect(Select<User>({
            select: {
                username: true
            },
            entity: user
        })).eq("select (username) from User")
    });
    it("testing update", () => {
        expect(Update<User>({
            data: {
                username: "李四",
                age: 23,
            },
            entity: user
        })).toBe("update User set username=李四,age=23")
    })
})
