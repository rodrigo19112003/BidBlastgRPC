const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const dotenv = require('dotenv');
dotenv.config();

const videoController = require('./controllers/video_controller');

const PROTO_PATH = './proto/video.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const videoProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
server.addService(videoProto.VideoService.service, { streamVideo: streamVideoImpl });
server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server gRPC started on ${process.env.PORT}`);
});

async function streamVideoImpl(call) {
    const videoId = call.request.videoId;

    if (typeof videoId !== 'number' || isNaN(videoId)) {
        return call.end();
    }    

    try {
        const videoData = await videoController.getVideoById(videoId);
        if (!videoData || !videoData.content) {
            return call.end();
        }

        const chunkSize = 1024 * 1024;
        const buffer = videoData.content;

        for (let i = 0; i < buffer.length; i += chunkSize) {
            const chunk = buffer.slice(i, i + chunkSize);
            call.write({ data: chunk });
        }

        call.end();
    } catch (error) {
        console.error(`Unable to recover video with id ${videoId}, error occurred:`, error);
        call.end();
    }
}