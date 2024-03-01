const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
    title: { type: String, required: [true, "Please enter article's title"] },
    description: { type: String, required: true },
    images: [{
        data: Buffer,
        contentType: String
    }], // array of images
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;