const localtunnel = require("localtunnel");
const fs = require("fs");
const path = require("path");

async function startTunnels() {
  try {
    // Start tunnel for port 5000 (backend)
    const tunnel5000 = await localtunnel({ port: 5000 });
    console.log(`🛠️ Backend (port 5000) available at: ${tunnel5000.url}`);

    // Start tunnel for port 3000 (frontend)
    const tunnel3000 = await localtunnel({ port: 3000 });
    console.log(`🌐 Frontend (port 3000) available at: ${tunnel3000.url}`);

    // Update frontend environment variables
    const envContent = `
# API Configuration
NEXT_PUBLIC_API_URL=${tunnel5000.url}

# Environment
NODE_ENV=development
`;

    fs.writeFileSync(
      path.join(__dirname, "../web/.env.local"),
      envContent.trim()
    );
    console.log("\n✅ Updated frontend environment variables");

    // Keep the process alive
    process.stdin.resume();

    // Handle tunnel close events
    tunnel3000.on("close", () => {
      console.log("❌ Frontend tunnel closed");
    });

    tunnel5000.on("close", () => {
      console.log("❌ Backend tunnel closed");
    });
  } catch (error) {
    console.error("Error creating tunnels:", error);
    process.exit(1);
  }
}

startTunnels();
