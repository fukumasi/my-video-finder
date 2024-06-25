const mongoose = require('mongoose');

// MongoDBに接続
mongoose.connect('mongodb+srv://fukumasi:JU9PiGhLaRTdDlYs@cluster0.mongodb.net/my-video-finder')
    .then(() => {
        console.log('Connected to MongoDB');

        const videoSchema = new mongoose.Schema({
            title: String,
            category: String,
            description: String,
            views: Number,
            likes: Number,
            rating: Number,
        });

        const Video = mongoose.model('Video', videoSchema);

        const sampleVideos = [
            {
                title: 'お料理大好き 1',
                category: 'cooking',
                description: 'A new sample video about cooking.',
                views: 1500,
                likes: 200,
                rating: 5
            },
            {
                title: 'Aiの今後についての動画 2',
                category: 'technology',
                description: 'A new sample video about technology.',
                views: 1200,
                likes: 100,
                rating: 4
            },
            {
                title: '英語教育 1',
                category: 'education',
                description: 'A new sample video about education.',
                views: 100,
                likes: 50,
                rating: 5
            },
            {
                title: 'ダヴィンチとピカソ',
                category: 'art',
                description: 'A new sample video about art.',
                views: 1200,
                likes: 100,
                rating: 4
            }
        ];

        // データ削除と挿入
        Video.deleteMany({})
            .then(() => {
                console.log('Existing data deleted');
                return Video.insertMany(sampleVideos);
            })
            .then(() => {
                console.log('Sample data inserted');
                mongoose.connection.close();
            })
            .catch(err => {
                console.error('Error inserting data:', err);
                mongoose.connection.close();
            });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
