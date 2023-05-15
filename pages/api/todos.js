const AWS = require('aws-sdk');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    'region': 'us-east-1'
});

const params = {
  Bucket: process.env.TODOS_BUCKET,
  Key: process.env.TODOS_KEY
};

export default async function handler(req, res) {
  // handle GET request
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // handle POST request
  if (req.method === 'POST') {
    return handlePost(req, res);
  } 
  
  // handle DELETE request
  if (req.method === 'DELETE') {
    return handleDelete(req, res);
  }

  // handle PUT request
  if (req.method === 'PUT') {
    return handlePut(req, res);
  }

  // handle other requests
  res.status(400).json({ error: 'Only GET, POST, DELETE and PUT requests allowed' } );
}

async function handleGet(req, res) {
  try {
    const file = await s3.getObject(params).promise();
    const fileContent = file.Body.toString('utf-8'); 
    let data = JSON.parse(fileContent);

    // return all todos or a specific todo
    if (req.query.id) {
      const targetID = Number(req.query.id);
      data = data.find(todo => todo.id === targetID);
    }
    res.status(200).json(data || [] );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error occurred while fetching file from S3' });
  }
}

async function handlePut(req, res) {
  try {
    const targetID = Number(req.query.id);
    // validate the body
    if(!req.body.id || !(req.body.id == targetID) ) {
      let error = new Error('Unmatched query.id and body.id');
      error.statusCode = 400;
      throw error;
    }
    if (!req.body.msg){
      let error = new Error('msg is required');
      error.statusCode = 400;
      throw error;
    }

    const file = await s3.getObject(params).promise();
    const fileContent = file.Body.toString('utf-8'); 
    const data = JSON.parse(fileContent);

    // update todo in the list
    const updatedData = data.map(todo => {
      if (todo.id === targetID) {
        return req.body;
      }
      return todo;
    });

    // save updated todo list to S3 and return to client
    const uploadedParams = Object.assign({}, params, {Body: JSON.stringify(updatedData)});
    await s3.putObject(uploadedParams).promise();
    console.log(updatedData)
    res.status(200).json(updatedData || [] );
  } catch (error) {
    console.error('Error:', error);
    res.status(error.statusCode ?? 500).json(error.toString());
  }
}

async function handlePost(req, res) {
  try {
    // validate and normalize the body
    if (!req.body.msg){
      let error = new Error('msg is required');
      error.statusCode = 400;
      throw error;
    }

    const file = await s3.getObject(params).promise();
    const fileContent = file.Body.toString('utf-8'); 
    const data = JSON.parse(fileContent);

    // add new todo to the list with maxid + 1
    const maxID = data.reduce((max, todo) => Math.max(max, todo.id), 0);
    req.body.id = maxID + 1;
    data.push(req.body);

    // save updated todo list to S3
    const uploadedParams = Object.assign({}, params, {Body: JSON.stringify(data)});
    await s3.putObject(uploadedParams).promise();
    res.status(200).json(data || [] );
  } catch (error) {
    console.error('Error:', error);
    res.status(error.statusCode ?? 500).json(error.toString());
  }
}

async function handleDelete(req, res) {
  try {
    // validate the request
    if(!req.query.id) {
      let error = new Error('id is required');
      error.statusCode = 400;
      throw error;
    }
    const targetID = Number(req.query.id);

    console.log(targetID)
    const file = await s3.getObject(params).promise();
    const fileContent = file.Body.toString('utf-8'); 
    const data = JSON.parse(fileContent);

    // remove todo from the list
    const updatedData = data.filter(todo => todo.id !== targetID);

    // save updated todo list to S3
    const uploadedParams = Object.assign({}, params, {Body: JSON.stringify(updatedData)});
    await s3.putObject(uploadedParams).promise();
    res.status(200).json(updatedData || [] );
  } catch (error) {
    console.error('Error:', error);
    res.status(error.statusCode ?? 500).json(error.toString());
  }
}
