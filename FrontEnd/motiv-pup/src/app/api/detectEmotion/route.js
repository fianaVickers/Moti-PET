// src/app/api/detectEmotion/route.js

import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req) {
  try {
    const { image } = await req.json();  // Read image from request body

    // Convert base64 image data to binary
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const binaryData = Buffer.from(base64Data, 'base64');

    const params = {
      Image: {
        Bytes: binaryData,
      },
      Attributes: ['ALL'],
    };

    // Send the image to AWS Rekognition for analysis
    const rekognitionResponse = await rekognition.detectFaces(params).promise();
    const faceDetails = rekognitionResponse.FaceDetails;

    if (faceDetails.length > 0) {
      const emotions = faceDetails[0].Emotions;
      const dominantEmotion = emotions.reduce((prev, current) =>
        prev.Confidence > current.Confidence ? prev : current
      );
      return new Response(JSON.stringify({ emotion: dominantEmotion.Type }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ emotion: 'No emotion detected' }), { status: 200 });
    }
  } catch (error) {
    console.error('Error with Rekognition:', error);
    return new Response(JSON.stringify({ error: 'Error with Rekognition' }), { status: 500 });
  }
}