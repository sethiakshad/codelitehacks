import fs from "fs";

async function run() {
    try {
        console.log("Registering user...");
        const res = await fetch("http://localhost:4000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Simulated Factory",
                email: "sim7@factory.com",
                password: "password123",
                role: "factory_manager"
            })
        });
        const data = await res.json();
        console.log("Auth Response STATUS:", res.status);
        if (!res.ok) throw new Error(data.message);

        const token = data.token;
        console.log("Got token:", token.substring(0, 10) + "...");

        console.log("Creating factory...");

        // Simulating the FormData fetch
        const formData = new FormData();
        formData.append("name", "Simulated Factory 2");
        formData.append("industry_type", "Textile");
        formData.append("email", "simfile@factory.com");
        formData.append("city", "Mumbai");
        formData.append("state", "MH");

        // Add a mock file blob
        const blob = new Blob(["mock pdf content"], { type: "application/pdf" });
        formData.append("licenseFile", blob, "test.pdf");

        const res2 = await fetch("http://localhost:4000/api/factories", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const factoryData = await res2.json();
        console.log("Factory Response STATUS:", res2.status);
        console.log("Factory Data:", factoryData);

    } catch (e) {
        console.error("Simulation failed:", e);
    }
}
run();
