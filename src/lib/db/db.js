import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// async function initMongoose() {
//   // await mongoose.connection.close();

//   // if we are in dev mode
//   let cached = global.mongoose;

//   if (!cached) {
//     global.mongoose = { conn: null, promise: null };
//     cached = global.mongoose;
//   }

//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

async function initMongoose() {
  // await mongoose.connection.close();

  // in production
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "images",
  });

  return { db: mongoose.connect(MONGODB_URI), bucket: gridFSBucket };
}

export default initMongoose;
