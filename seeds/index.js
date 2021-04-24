const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp-x', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

//to pick a random number from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    //addind 50 random cities from /seeds/cities
    for(let i = 0; i < 500; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //author: polkabot - tetlangit
            author: '607a6c86363b71d436602b0b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}  ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe minima perspiciatis sapiente illum, molestias autem consectetur voluptatem maxime sint dignissimos impedit! Quaerat in repellendus quo!',
            price,
            geometry: { 
                "type" : "Point", 
                "coordinates" : [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/drodhd/image/upload/v1618783438/YelpCampX/al9e2tunr1tlq7klticf.jpg',
                    filename: 'YelpCampX/al9e2tunr1tlq7klticf'
                },
                {
                    url: 'https://res.cloudinary.com/drodhd/image/upload/v1618783437/YelpCampX/ghah5t7tsmd2bvzeohi5.jpg',
                    filename: 'YelpCampX/ghah5t7tsmd2bvzeohi5'
                }
            ]
        })
        await camp.save();
    }
}

//run the seed function then close out the connection to the database
seedDB().then(() =>{
    mongoose.connection.close()
});