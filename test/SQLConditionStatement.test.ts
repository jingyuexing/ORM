import { expect, describe, it } from "vitest";

import { Where } from "@/SQLBuilder";

class Person {
    fullName: string = "";
    age: number = 0;
    address: string = "";
    gender: "F" | "M" = "F"
    constructor(fullName: string, age: number, address: string, gender: "F" | "M") {
        this.fullName = fullName
        this.age = age;
        this.address = address;
    }
}

let user = new Person("Bob Dylan", 82, "27357 CA-1, Malibu, CA 90265 American", "M")

describe("condition statement testing", () => {
    it("test between", () => {
        expect(Where<Person>({
            entity: user,
            where: {
                age: {
                    between: [32, 102]
                }
            }
        }).trim()).toBe("where age between 32 and 102")
    });
    it("test more thant", () => {
        expect(Where<Person>({
            entity: user,
            where: {
                age: {
                    moreThant: "32"
                }
            }
        })).toBe("where age > 32 ")
    })
    it("test more thant or equal", () => {
        expect(Where<Person>({
            entity: user,
            where: {
                age: {
                    moreThantOrEqual: "32"
                }
            }
        }).trim()).eq("where age >= 32")
    })
    it("test like", () => {
        expect(Where<Person>({
            entity: user,
            where: {
                fullName: {
                    like: "%S% and %"
                }
            }
        }).trim()).toBe(`where fullName like "%S% and %"`)
    });
    it("test order", () => {
        expect(Where<Person>({
            entity: user,
            where: {
                address: {
                    order: "ASC",
                }
            }
        }).trim()).toBe(`where order by address ASC`)
    })
})