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
const saveVideo = async function(auctionId, mimeType, content) {
    try {
        const [result] = await db.query(`INSERT INTO hypermedia_files (mime_type, name, content, id_auction) VALUES (?, ?, ?, ?)`, [mimeType, null, content, auctionId]);
        return result.insertId;
    } catch (error) {
        console.error('Unable to save video, error occurred:', error);
        throw error;
    }
};

module.exports = {
    getVideoById,
    saveVideo
};
