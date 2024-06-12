const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const dotenv = require('dotenv');
dotenv.config();

const videoController = require('./controllers/video_controller');
const videoService = require('./services/video_service'); 

const PROTO_PATH = './proto/video.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const videoProto = grpc.loadPackageDefinition(packageDefinition).VideoService;

const server = new grpc.Server();
server.addService(videoProto.service, { streamVideo: streamVideoImpl, uploadVideo: uploadVideoImpl });
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
    let name = "default_video_name";  

    call.on('data', function(chunk) {
        videoData = Buffer.concat([videoData, chunk.content]);
        mimeType = chunk.mimeType;
        auctionId = chunk.auctionId;
        if (chunk.name) {
            name = chunk.name; 
        }
    });

    call.on('end', async function() {
        try {
            const videoId = await videoController.saveVideo(auctionId, mimeType, videoData, name);
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
