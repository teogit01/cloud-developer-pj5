"use strict"

module.exports.hello = async (event) => {    
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Go Severless... ! Hello function executed..!',
                input: event
            },
            null,
            2
        )
    }
}
const foo = () => {
    console.log("First");
    return 1
}
const bar = () => setTimeout(() => console.log("Second"), 500);
const baz = () => {
    console.log("Third");
    return 3
}

bar();
foo();
baz();
