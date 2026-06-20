import { db } from "./lib/db/db";
import { attorneys } from "./lib/db/schema";

async function main() {
  try {
    await db.insert(attorneys).values.name;
    const result = await db.select().from(attorneys);
    console.log('Successfully queried the database:', result);
  } catch (error) {
    console.error('Error querying the database:', error);
  }
}

main();