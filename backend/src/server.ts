#!/usr/bin/env tsx
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import PDFDocument from "pdfkit";
import multer from "multer";

dotenv.config();

type ToolResponse = {
  content: { type: string; text: string }[];
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/mcp-server.js"],
  env: process.env as Record<string, string>,
});

const mcp = new Client(
  { name: "frontend-client", version: "1.0.0" },
  { capabilities: { tools: {} } }
);
await mcp.connect(transport);

app.use(express.static("public"));
app.use("/ui", express.static("public"));

import path from "path";

// Middleware to verify Firebase token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// GET all patients
app.get("/api/patients", async (req, res) => {
  try {
    const raw = await mcp.callTool({ name: "get_all_patients", arguments: {} });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch patients");
  }
});

// POST create/update patient
app.post("/api/patients", async (req, res) => {
  try {
    const raw = await mcp.callTool({ 
      name: "create_or_update_patient", 
      arguments: req.body 
    });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create/update patient");
  }
});

// GET patients assigned to a specific doctor
app.get("/api/doctor-patients/:doctorId", async (req, res) => {
  try {
    const raw = await mcp.callTool({ 
      name: "get_doctor_patients", 
      arguments: { doctor_id: req.params.doctorId } 
    });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch doctor's patients");
  }
});

// GET prescriptions for a specific patient
app.get("/api/patient-prescriptions/:patientId", async (req, res) => {
  try {
    const raw = await mcp.callTool({ 
      name: "get_patient_prescriptions", 
      arguments: { patient_id: req.params.patientId } 
    });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch patient prescriptions");
  }
});

// GET single patient by ID
app.get("/api/patients/:id", async (req, res) => {
  try {
    const raw = await mcp.callTool({
      name: "get_patient_by_id",
      arguments: { patient_id: req.params.id },
    });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(404).send("Patient not found");
  }
});

// POST generate prescription
app.post("/api/generate_prescription", async (req, res) => {
  const { patient_id, symptoms, final_prescription, doctor_id } = req.body;
  if (!patient_id || !symptoms) return res.status(400).send("Missing inputs");

  try {
    let prescription = final_prescription;

    if (!prescription) {
      const rawPatient = await mcp.callTool({
        name: "get_patient_by_id",
        arguments: { patient_id },
      });
      const patientResp = rawPatient as unknown as ToolResponse;
      const patient = JSON.parse(patientResp.content[0].text);

      const ragResp = await mcp.callTool({
        name: "get_similar_prescriptions",
        arguments: { patient_id, symptoms },
      });
      const similarText = (ragResp as unknown as ToolResponse).content[0].text.trim();

      const prompt = `
You are a licensed doctor. Based on the following patient details and symptoms, write a professional, short, and safe prescription using only generic medicine names.

Patient Details:
- Age: ${patient.age}
- Diagnosis: ${patient.diagnosis}
- History: ${patient.history.join(", ")}

Current Symptoms: ${symptoms}

Relevant Past Prescriptions:
${similarText || "No similar prescriptions found."}

Start the prescription directly. Do not include disclaimers or introductions.
`.trim();

      // Log the prompt to console
      console.log("\nFinal Prompt Sent to Gemini\n");
      console.log(prompt);
      console.log("\n\n");

      const aiResp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      prescription = aiResp.text?.trim() ?? "";
    }

    res.json({ generated: prescription, prescription });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating prescription");
  }
});

// POST save prescription
app.post("/api/save_prescription", async (req, res) => {
  const { patient_id, symptoms, prescription, doctor_id } = req.body;
  if (!patient_id || !symptoms || !prescription) return res.status(400).send("Missing inputs");

  try {
    await mcp.callTool({
      name: "add_prescription",
      arguments: { patient_id, symptoms, prescription, doctor_id },
    });

    res.json({ success: true, message: "Prescription saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving prescription");
  }
});

// GET download prescription as PDF
app.get("/api/download-prescription/:prescriptionId", async (req, res) => {
  try {
    const raw = await mcp.callTool({
      name: "get_prescription_by_id",
      arguments: { prescription_id: req.params.prescriptionId },
    });
    const resp = raw as unknown as ToolResponse;
    const prescriptionData = JSON.parse(resp.content[0].text);

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${req.params.prescriptionId}.pdf`);
    
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Medical Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Patient: ${prescriptionData.patient_name}`);
    doc.text(`Date: ${new Date(prescriptionData.timestamp).toLocaleDateString()}`);
    doc.text(`Doctor: ${prescriptionData.doctor_name}`);
    doc.moveDown();
    doc.text('Symptoms:');
    doc.text(prescriptionData.symptoms);
    doc.moveDown();
    doc.text('Prescription:');
    doc.text(prescriptionData.prescription);
    
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

// GET past appointments for a specific doctor
app.get("/api/doctor-past-appointments/:doctorId", async (req, res) => {
  try {
    const raw = await mcp.callTool({
      name: "get_doctor_past_appointments",
      arguments: { doctor_id: req.params.doctorId }
    });
    const resp = raw as unknown as ToolResponse;
    res.json(JSON.parse(resp.content[0].text));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch doctor's past appointments");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Prescription Server running on port ${PORT}`);
});