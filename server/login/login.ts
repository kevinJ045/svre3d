import { MongoClient, Db } from 'mongodb';
import { Data } from '../db/db.js'; // Assuming this imports your database configuration
import { DBModel } from '../models/dbmodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../constant/env.js';

export class LoginManager { 
	static async login(username: string, password: string): Promise<string | null> {
		try {
			const db = Data.db; // MongoDB database

			// Access the 'players' and 'secrets' collections
			const playersCollection = db.collection('players');
			const secretsCollection = db.collection('secrets');

			// Check if the user exists in the 'players' collection
			const user = await playersCollection.findOne({ username });

			if (!user) {
				throw new Error('User not found');
			}

			// Verify the password
			const secret = await secretsCollection.findOne({ username });
			if (!secret || !(await bcrypt.compare(password, secret.password))) {
				throw new Error('Invalid credentials');
			}

			const token = await jwt.sign({ username }, env.secret, { expiresIn: '120d' }); 
            
			return token;
		} catch (error) {
			console.error('Login failed:', error);
			return null;
		}
	}

	static async verifyToken(token: string): Promise<string | null> {
		try {
			const decoded = await jwt.verify(token, env.secret);

			if (typeof decoded === 'string') {
				return decoded;
			} else if (typeof decoded === 'object' && decoded.hasOwnProperty('username')) {
				return decoded.username;
			} else {
				throw new Error('Invalid token');
			}
		} catch (error) {
			console.error('Token verification failed:', error);
			return null;
		}
	}


	static async register(username: string, password: string, variant: string, spawnPoint = { x: 0, z: 0 }): Promise<void> {
		try {
			const db = Data.db; // MongoDB database

			// Access the 'players' collection
			const playersCollection = db.collection('players');

				// Check if the user already exists
			const existingUser = await playersCollection.findOne({ username });
			if (existingUser) {
				throw new Error('User already exists');
			}

				// Hash the password using bcrypt
			const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

				// Create a new player using the DBModel
			const newPlayer = await DBModel.create('player', { variant, username, spawnPoint, position: { x: spawnPoint.x || 0, z: spawnPoint.z || 0, y: 5 } });

			await playersCollection.insertOne(newPlayer);

			const secretsCollection = db.collection('secrets');

			// Insert the hashed password into the 'secrets' collection
			await secretsCollection.insertOne({ username, password: hashedPassword });
		} catch (error) {
			console.error('Registration failed:', error);
			throw error;
		}
	}
}
