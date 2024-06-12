const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const dotenv = require('dotenv');
dotenv.config();

const videoController = require('./controllers/video_controller');

const PROTO_PATH = './proto/video.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const videoProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
server.addService(videoProto.VideoService.service, { streamVideo: streamVideoImpl, uploadVideo: uploadVideoImpl });
server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server gRPC started on ${process.env.PORT}`);
});

async function streamVideoImpl(call) {
    const videoId = call.request.videoId;

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
async function uploadVideoImpl(call, callback) {
    let videoData = Buffer.alloc(0);
    let mimeType = "";
    let auctionId = 0;

    call.on('data', function(chunk) {
        videoData = Buffer.concat([videoData, chunk.content]);
        mimeType = chunk.mimeType;
        auctionId = chunk.auctionId;
    });

    call.on('end', async function() {
        try {
            const videoId = await videoService.saveVideo(auctionId, mimeType, videoData);
            callback(null, { message: 'Video uploaded successfully', videoId: videoId });
        } catch (error) {
            console.error('Error uploading video:', error);
            callback({
                code: grpc.status.INTERNAL,
                message: 'Error uploading video'
            });
        }
    });
}