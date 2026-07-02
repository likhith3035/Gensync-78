import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xvyvpbrefvhsjdbukbmm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eXZwYnJlZnZoc2pkYnVrYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzY1MTQsImV4cCI6MjA4ODUxMjUxNH0.PJdcPyJtabENkSbT33Zf09BVGqJKIzjkLdd4OQwIB5A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const userId = "c6983ddb-278e-47b2-bef2-5e6861f22267"; // One of the user_ids in profiles
  console.log("Attempting to insert into user_roles...");
  const { data, error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role: "admin"
  }).select();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("Insert success:", data);
  }
}

testInsert();
