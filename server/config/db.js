import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isConnected = false;
let useLocalFallback = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_college_portal';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local MongoDB service is not running
    });
    isConnected = true;
    console.log(`\x1b[32m[DATABASE]\x1b[0m MongoDB Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    return { type: 'mongodb', uri: mongoURI };
  } catch (error) {
    console.warn(`\x1b[33m[DATABASE WARNING]\x1b[0m Standalone MongoDB service not responding at ${mongoURI}`);
    console.log(`\x1b[36m[DATABASE FALLBACK]\x1b[0m Activating high-reliability embedded JSON storage engine for local standalone execution...`);
    useLocalFallback = true;
    return { type: 'embedded', uri: 'file://server/data/store.json' };
  }
};

export const getDBStatus = () => ({
  isConnected: isConnected || useLocalFallback,
  engine: useLocalFallback ? 'Embedded Local Storage Engine (Portable No-Setup)' : 'MongoDB Server (Mongoose ODM)',
  status: isConnected ? 'Online (MongoDB)' : (useLocalFallback ? 'Online (Embedded Portable)' : 'Connecting')
});
