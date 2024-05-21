const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const dotenv = require('dotenv');
const videoController = require('./controllers/video_controller');

dotenv.config();

const PROTO_PATH = './proto/video.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const videoProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
server.addService(videoProto.VideoService.service, { streamVideo: streamVideoImpl });
server.bindAsync(`localhost:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server gRPC started on ${process.env.PORT}`);
});

async function streamVideoImpl(call) {
    const videoId = call.request.videoId;

    try {
        const videoData = await videoController.getVideoById(videoId);

        if (!videoData) {
            return call.end();
        }

        const chunkSize = 1024 * 1024;

        for (let i = 0; i < videoData.length; i += chunkSize) {
            const chunk = videoData.slice(i, i + chunkSize);
            call.write({ chunk });
        }
        call.end();
    } catch (error) {
        console.error(`Unable to recover video with id ${videoId}, error occurred:`, error);
        call.end();
    }
}