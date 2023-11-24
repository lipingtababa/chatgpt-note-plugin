

# Intro
This is a ChatGPT Plugin with implementation of a TODO list for demo use.
Since ChatGPT Plugins is not actively maintained by OpenAI, this project is discontinued too.

# Points Demostrated
- The implmentation is a simple set of RESTful APIs.
- The Key is declaring these APIs precisely in [OpenAPI Specification](./pages/public/openapi.yaml).
- The commentary summary in the OpenAPI Specification is crucial as it affects the behaviour of ChatGPT Plugins just like it affects behaviours of a human being.

# Installation
Before running this app, you should
- upload ./public/todo-list.json to s3://<TODOS_BUCKET>/<TODOS_KEY>
- configure TODOS_BUCKET and TODOS_KEY as environment variables
- configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY as environment variables
- Follow the [OpenAI ChatGPT Plugins Doc](https://platform.openai.com/docs/plugins/introduction)


# Development
## Unit test
```bash
yarn test
```

## Run it locally
```bash
yarn dev
```

For details, check [package.json](./package.json)
