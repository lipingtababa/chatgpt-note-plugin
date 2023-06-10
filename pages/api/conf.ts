export const s3Params = {
  Bucket: process.env.TODOS_BUCKET ?? 'us-east-1-temp-ma',
  Key: process.env.TODOS_KEY ?? 'chatgpt-plugin/todo-list/todo-list.json'
}

export const STORAGE_REGION = 'us-east-1'
