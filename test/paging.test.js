const { DynamoDB } = require("aws-sdk"),
    { Table } = require("dynamodb-onetable"),
    schema = require("../src/schema");

describe("paging", () => {
    let table;
    let User;
    let users;

    function sortBySK(a, b) {
        return a.name.localeCompare(b.name);
    }

    async function populateTable() {
        const nUsers = 100,
            users = [];

        for (let i = 0; i < nUsers; i++) {
            users.push(await User.create({ name: `user-${i}` }));
        }

        return users;
    }

    beforeEach(async () => {
        table = new Table({
            name: "TestPaging",
            client: new DynamoDB.DocumentClient({
                region: "localhost",
                endpoint: "http://localhost:8000",
            }),
            uuid: "ulid",
            schema,
            hidden: false,
        });

        await table.createTable();

        User = table.getModel("User");

        users = await populateTable(table, User);
    });

    afterEach(async () => {
        await table.deleteTable("DeleteTableForever");
    });

    it("should page forward when traversing a dynamodb table partition", async () => {
        expect.hasAssertions();

        users.sort(sortBySK);

        const firstPage = await User.find(
                {},
                {
                    limit: 20,
                }
            ),
            nextPage = await User.find(
                {},
                { limit: 20, start: firstPage.start }
            );

        expect(Array.from(nextPage)).toStrictEqual(users.slice(20, 40));
    });

    it("should page backward when traversing a dynamodb table partition", async () => {
        expect.hasAssertions();

        users.sort(sortBySK);

        const firstPage = await User.find(
                {},
                {
                    limit: 20,
                }
            ),
            nextPage = await User.find(
                {},
                { limit: 20, start: firstPage.start }
            ),
            // prevPage must be equals to firstPage
            prevPage = (
                await User.find(
                    {},
                    {
                        limit: 20,
                        // It would be nice to have a shortcut in the same fashion as when paginating forward
                        start: { pk: nextPage[0].pk, sk: nextPage[0].sk },
                        reverse: true,
                    }
                )
            ).reverse();

        expect(Array.from(prevPage)).toStrictEqual(users.slice(0, 20));
    });

    it("should page forward when traversing a dynamodb table partition in reverse order", async () => {
        expect.hasAssertions();

        users.sort(sortBySK).reverse();

        const firstPage = await User.find(
                {},
                {
                    limit: 20,
                    reverse: true,
                }
            ),
            nextPage = await User.find(
                {},
                { limit: 20, start: firstPage.start, reverse: true }
            );

        expect(Array.from(nextPage)).toStrictEqual(users.slice(20, 40));
    });

    it("should page backward when traversing a dynamodb table partition in reverse order", async () => {
        expect.hasAssertions();

        users.sort(sortBySK).reverse();

        const firstPage = await User.find(
                {},
                {
                    limit: 20,
                    reverse: true,
                }
            ),
            nextPage = await User.find(
                {},
                { limit: 20, start: firstPage.start, reverse: true }
            ),
            // prevPage must be equals to firstPage
            prevPage = (
                await User.find(
                    {},
                    {
                        limit: 20,
                        // It would be nice to have a shortcut in the same fashion as when paginating forward
                        start: { pk: nextPage[0].pk, sk: nextPage[0].sk },
                    }
                )
            ).reverse();

        expect(Array.from(prevPage)).toStrictEqual(users.slice(0, 20));
    });
});
