const Match = {
        ulid: /^[0-9A-Z]{26}$/i,
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        name: /^[a-z0-9 ,.'-]+$/i,
    },
    Schema = {
        indexes: {
            primary: { hash: "pk", sort: "sk" },
        },
        models: {
            User: {
                pk: { type: String, value: "user#" },
                sk: { type: String, value: "user#${name}#${id}" },
                id: { type: String, uuid: true, validate: Match.ulid },
                name: { type: String, required: true, validate: Match.name },
            },
        },
    };

module.exports = Schema;
