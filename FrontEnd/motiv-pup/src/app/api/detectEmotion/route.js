import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Incoming request body:', body); 
    const { image } = body; 
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image data is required' }), { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const binaryData = Buffer.from(base64Data, 'base64');

    const params = {
      Image: {
        Bytes: binaryData,
      },
      Attributes: ['ALL'],
    };

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
    return new Response(JSON.stringify({ error: 'Error with Rekognition: ' + error.message }), { status: 500 });
  }
}
