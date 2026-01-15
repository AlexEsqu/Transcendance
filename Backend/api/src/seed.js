export async function seedDatabase(db, number = 10) {
  // Check if users already exist
const stmt = await db.prepare("SELECT COUNT(*) AS count FROM users");
const {count} = await stmt.get(); 
  if (count >= number) {
    // console.log("Database already seeded, skipping...");
    return;
  }

  console.log(`Seeding ${number} users...`);
  for (let i = count; i <= number; i++) {
    const stmt = await db.prepare(
      "INSERT INTO users(username, email, email_verified) VALUES (?, ?, ?)"
    );
    await stmt.run(`user_${i}`, `user_${i}@email.com`, 1);
  }
  console.log("Seeding complete!");
}
