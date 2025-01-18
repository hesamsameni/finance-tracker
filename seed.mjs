import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import "dotenv/config";

// Initialize the Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: { persistSession: false },
  }
);

// Seed function to insert data
const seedDatabase = async () => {
  const rows = [];

  // Generate random dates for the past two years
  for (
    let year = new Date().getFullYear();
    year > new Date().getFullYear() - 1;
    year--
  ) {
    for (let i = 0; i < 10; i++) {
      const date = new Date(
        year,
        faker.number.int({ min: 0, max: 11 }), // Month from 0 to 11
        faker.number.int({ min: 1, max: 28 }) // Day from 1 to 28
      );

      // Add a row to the data array
      rows.push({
        paid_by: faker.helpers.arrayElement(["Hesam", "Elnaz"]), // Random type
        title: faker.lorem.word(),
        amount: faker.number.int({ min: 10, max: 1000 }), // Random amount
        date: date.toISOString().split("T")[0], // Format the date as ISO string
        description: faker.lorem.sentence(), // Random description
        category: faker.helpers.arrayElement([
          "Groceries",
          "Rent",
          "Utilities",
          "Eating out",
          "Bills",
        ]), // Random category
        currency: "eur",
        household_id: "56",
      });
    }
  }

  try {
    const { data, error } = await supabase
      .from("household_transactions")
      .insert(rows);

    // Improved error handling and logging
    if (error) {
      console.error("Error inserting data:", error.message);
      console.error("Error details:", error); // More detailed error information
    } else {
      console.log("Inserted rows:", data);
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
    console.error("Error details:", error); // More detailed error information
  }
};

// Run the seed function
seedDatabase();
