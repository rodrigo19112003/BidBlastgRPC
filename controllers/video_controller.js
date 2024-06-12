const videoService = require('../services/video_service');

async function getVideoById(videoId) {
    try {
        const videoRecord = await videoService.getVideoById(videoId);
        return videoRecord ? videoRecord : null;
    } catch (error) {
        console.error(`Unable to recover video, error occurred:`, error);
        throw error;
    }
}
async function saveVideo(auctionId, mimeType, content, name) {
    try {
        const videoId = await videoService.saveVideo(auctionId, mimeType, content, name);
        return videoId;
    } catch (error) {
        console.error('Error saving video:', error);
        throw error;
    }
}

module.exports = {
    getVideoById,
    saveVideo
};

