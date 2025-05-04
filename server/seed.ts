import { leadershipValues as initialValues } from "@/lib/data";
import { db } from "./db";
import { leadershipValues } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // First, check if any leadership values exist already
    const existingValues = await db.select().from(leadershipValues);
    
    if (existingValues.length > 0) {
      console.log(`Database already has ${existingValues.length} leadership values. Skipping seeding.`);
      return;
    }
    
    // If no values exist, insert the initial values
    console.log(`Seeding database with ${initialValues.length} leadership values...`);
    
    for (const value of initialValues) {
      await db.insert(leadershipValues).values({
        id: value.id,
        value: value.value,
        description: value.description
      });
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();