/**
 * Database Seeding Functions
 * 
 * Creates sample data for development and testing.
 * Run via /api/seed endpoint (dev only).
 */

import type { D1Database } from '@cloudflare/workers-types';
import * as bcrypt from 'bcryptjs';

/**
 * Seed result statistics
 */
export interface SeedResult {
  usersCreated: number;
  sightingsCreated: number;
}

/**
 * Sample sighting data
 */
const sampleSightings = [
  {
    animal_name: 'Eastern Bluebird',
    location: 'Central Park, New York, NY',
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRBOTBFMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QmxhY2sgQ2FwcGVkIENoaWNrYWRlZTwvdGV4dD48L3N2Zz4='
  },
  {
    animal_name: 'Red Fox',
    location: 'Yellowstone National Park, WY',
    photo_url: null
  },
  {
    animal_name: 'Canada Goose',
    location: 'Lake Michigan shoreline, Chicago, IL',
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzdDN0M3QyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q2FuYWRhIEdvb3NlPC90ZXh0Pjwvc3ZnPg=='
  },
  {
    animal_name: 'White-tailed Deer',
    location: 'Great Smoky Mountains National Park, TN',
    photo_url: null
  },
  {
    animal_name: 'American Bald Eagle',
    location: 'Glacier Bay, Alaska',
    photo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzNCMzIyRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QW1lcmljYW4gQmFsZCBFYWdsZTwvdGV4dD48L3N2Zz4='
  }
];

/**
 * Seed the database with sample users and sightings
 * 
 * Creates:
 * - 2 test users (test@example.com, demo@example.com)
 * - 5 sightings for the first user
 * 
 * @param db - D1 database instance
 * @returns Seed statistics
 */
export async function seedDatabase(db: D1Database): Promise<SeedResult> {
  console.log('Starting database seed...');
  
  // Hash password for test users (cost 12)
  const passwordHash = await bcrypt.hash('Password123!', 12);
  
  // Create test users
  const user1 = await db.prepare(`
    INSERT INTO users (email, password_hash)
    VALUES (?, ?)
    RETURNING id
  `).bind('test@example.com', passwordHash).first<{ id: string }>();
  
  const user2 = await db.prepare(`
    INSERT INTO users (email, password_hash)
    VALUES (?, ?)
    RETURNING id
  `).bind('demo@example.com', passwordHash).first<{ id: string }>();
  
  if (!user1 || !user2) {
    throw new Error('Failed to create test users');
  }
  
  console.log(`Created users: ${user1.id}, ${user2.id}`);
  
  // Create sightings for user1
  let sightingsCreated = 0;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < sampleSightings.length; i++) {
    const sighting = sampleSightings[i];
    const timestampSighted = now - (i * 86400); // Each sighting 1 day apart
    
    await db.prepare(`
      INSERT INTO sightings (user_id, animal_name, location, timestamp_sighted, photo_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user1.id,
      sighting.animal_name,
      sighting.location,
      timestampSighted,
      sighting.photo_url
    ).run();
    
    sightingsCreated++;
  }
  
  console.log(`✓ Seed complete: 2 users, ${sightingsCreated} sightings`);
  
  return {
    usersCreated: 2,
    sightingsCreated
  };
}

/**
 * Clear all data from the database (for re-seeding)
 */
export async function clearDatabase(db: D1Database): Promise<void> {
  console.log('Clearing database...');
  
  await db.prepare('DELETE FROM sightings').run();
  await db.prepare('DELETE FROM users').run();
  await db.prepare('DELETE FROM _migrations').run();
  
  console.log('✓ Database cleared');
}
