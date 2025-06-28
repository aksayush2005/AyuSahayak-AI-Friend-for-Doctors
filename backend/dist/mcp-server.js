#!/usr/bin/env tsx
import dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mongoose, { Schema, model } from "mongoose";
import { InferenceClient } from "@huggingface/inference";
const { MONGO_URI, HF_API_TOKEN } = process.env;
if (!MONGO_URI || !HF_API_TOKEN) {
    console.error("Missing MONGO_URI or HF_API_TOKEN in .env");
    process.exit(1);
}
// ——— Connect to MongoDB ———
await mongoose.connect(MONGO_URI, { dbName: "prescriptions" });
const PatientModel = model("Patient", new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    diagnosis: { type: String, required: true },
    history: { type: [String], required: true },
    selectedDoctor: { type: String, required: false },
}));
const PrescriptionModel = model("PrescriptionLog", new Schema({
    id: { type: String, required: true },
    patient_id: { type: String, required: true },
    patient_name: { type: String, required: true },
    doctor_id: { type: String, required: true },
    doctor_name: { type: String, required: true },
    age: { type: Number, required: true },
    diagnosis: { type: String, required: true },
    history: { type: [String], required: true },
    symptoms: { type: String, required: true },
    prescription: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}));
// ——— Hugging Face Embeddings ———
const hf = new InferenceClient(HF_API_TOKEN);
async function embed(text) {
    const res = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
    });
    if (!Array.isArray(res))
        throw new Error("Failed to get embedding");
    return res;
}
function cosine(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
    return dot / (magA * magB);
}
// ——— MCP Server Init ———
const server = new McpServer({ name: "prescription-mcp", version: "1.0.0" });
// 1) List all patients
server.registerTool("get_all_patients", {
    title: "Get All Patients",
    description: "List every patient in the database",
    inputSchema: {},
}, async () => ({
    content: [
        {
            type: "text",
            text: JSON.stringify(await PatientModel.find().lean(), null, 2),
        },
    ],
}));
// 2) Create or update patient
server.registerTool("create_or_update_patient", {
    title: "Create or Update Patient",
    description: "Create a new patient or update existing one",
    inputSchema: {
        id: z.string(),
        name: z.string(),
        age: z.number(),
        email: z.string(),
        diagnosis: z.string(),
        history: z.array(z.string()),
        selectedDoctor: z.string().optional(),
    },
}, async (args) => {
    const patient = await PatientModel.findOneAndUpdate({ id: args.id }, args, { upsert: true, new: true }).lean();
    console.log('[MCP] Patient saved/updated:', args.id, args.name, args.email);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(patient, null, 2),
            },
        ],
    };
});
// 3) Get patients assigned to a specific doctor
server.registerTool("get_doctor_patients", {
    title: "Get Doctor's Patients",
    description: "Get all patients assigned to a specific doctor",
    inputSchema: { doctor_id: z.string() },
}, async ({ doctor_id }) => {
    const patients = await PatientModel.find({ selectedDoctor: doctor_id }).lean();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(patients, null, 2),
            },
        ],
    };
});
// 4) Get prescriptions for a specific patient
server.registerTool("get_patient_prescriptions", {
    title: "Get Patient Prescriptions",
    description: "Get all prescriptions for a specific patient",
    inputSchema: { patient_id: z.string() },
}, async ({ patient_id }) => {
    const prescriptions = await PrescriptionModel.find({ patient_id })
        .sort({ timestamp: -1 })
        .lean();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(prescriptions, null, 2),
            },
        ],
    };
});
// 5) Get prescription by ID
server.registerTool("get_prescription_by_id", {
    title: "Get Prescription by ID",
    description: "Get a specific prescription by its ID",
    inputSchema: { prescription_id: z.string() },
}, async ({ prescription_id }) => {
    const prescription = await PrescriptionModel.findOne({ id: prescription_id }).lean();
    if (!prescription)
        throw new Error("Prescription not found");
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(prescription, null, 2),
            },
        ],
    };
});
// 6) Fetch one patient by ID
server.registerTool("get_patient_by_id", {
    title: "Get Patient by ID",
    description: "Fetch a single patient record",
    inputSchema: { patient_id: z.string() },
}, async ({ patient_id }) => {
    const p = await PatientModel.findOne({ id: patient_id }).lean();
    if (!p)
        throw new Error("Patient not found");
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(p, null, 2),
            },
        ],
    };
});
// 7) Fetch prescription history from MongoDB
server.registerTool("get_prescription_history", {
    title: "Get Prescription History",
    description: "Fetch past prescriptions from MongoDB",
    inputSchema: { patient_id: z.string().optional() },
}, async ({ patient_id }) => {
    const filter = patient_id ? { patient_id } : {};
    const logs = await PrescriptionModel.find(filter)
        .sort({ timestamp: -1 })
        .lean();
    if (logs.length === 0) {
        return { content: [{ type: "text", text: "No history available." }] };
    }
    const text = logs
        .map(h => `Patient: ${h.patient_id} | Age: ${h.age} | Diagnosis: ${h.diagnosis} | History: ${h.history.join(", ")} | Symptoms: ${h.symptoms} | Prescription: ${h.prescription}`)
        .join("\n");
    return { content: [{ type: "text", text }] };
});
// 8) Add a new prescription entry
server.registerTool("add_prescription", {
    title: "Add Prescription",
    description: "Store a new prescription entry in MongoDB",
    inputSchema: {
        patient_id: z.string(),
        symptoms: z.string(),
        prescription: z.string(),
        doctor_id: z.string(),
    },
}, async ({ patient_id, symptoms, prescription, doctor_id }) => {
    const patient = await PatientModel.findOne({ id: patient_id }).lean();
    if (!patient)
        throw new Error("Patient not found");
    const doctorNames = {
        'doctor1': 'Dr. Smith - Cardiologist',
        'doctor2': 'Dr. Johnson - General Physician'
    };
    await PrescriptionModel.create({
        id: `prescription-${Date.now()}`,
        patient_id,
        patient_name: patient.name,
        doctor_id,
        doctor_name: doctorNames[doctor_id] || 'Unknown Doctor',
        age: patient.age,
        diagnosis: patient.diagnosis,
        history: patient.history,
        symptoms,
        prescription,
    });
    return {
        content: [{ type: "text", text: "Prescription logged in MongoDB." }],
    };
});
// 9) RAG: Get top-2 similar past prescriptions
server.registerTool("get_similar_prescriptions", {
    title: "Get Similar Prescriptions",
    description: "Retrieve top similar past prescriptions using RAG (from DB)",
    inputSchema: {
        patient_id: z.string(),
        symptoms: z.string(),
    },
}, async ({ patient_id, symptoms }) => {
    // 1) get patient
    const patient = await PatientModel.findOne({ id: patient_id }).lean();
    if (!patient)
        throw new Error("Patient not found");
    // 2) fetch all prescription logs
    const rawRecords = await PrescriptionModel.find().lean();
    const records = rawRecords.map(r => ({ ...r, vector: [] }));
    // 4) compute embeddings
    await Promise.all(records.map(async (r) => {
        r.vector = await embed(`${r.age} ${r.diagnosis} ${r.history.join(" ")} ${r.symptoms} ${r.prescription}`);
    }));
    // 5) query embedding
    const queryVector = await embed(`${patient.age} ${patient.diagnosis} ${patient.history.join(" ")} ${symptoms}`);
    // 6) rank & pick top 2
    const rankedText = records
        .map(r => ({ r, score: cosine(r.vector, queryVector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(x => `Patient: ${x.r.patient_id} | Symptoms: ${x.r.symptoms} | Prescription: ${x.r.prescription}`)
        .join("\n");
    return {
        content: [
            {
                type: "text",
                text: rankedText || "No similar prescriptions found.",
            },
        ],
    };
});
// Get past appointments (prescriptions) for a specific doctor
server.registerTool("get_doctor_past_appointments", {
    title: "Get Doctor Past Appointments",
    description: "Get all past appointments (prescriptions) for a specific doctor",
    inputSchema: { doctor_id: z.string() },
}, async ({ doctor_id }) => {
    const prescriptions = await PrescriptionModel.find({ doctor_id })
        .sort({ timestamp: -1 })
        .lean();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(prescriptions, null, 2),
            },
        ],
    };
});
// ——— Start the MCP server ———
await server.connect(new StdioServerTransport());
console.log("[MCP] prescription-mcp server running on stdio");
//# sourceMappingURL=mcp-server.js.map