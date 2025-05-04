import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { json } from "express";
import { insertSubmissionSchema, insertLeadershipValueSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { sendEmail } from './email';
import { extractFirstName } from "@/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // API routes
  app.post("/api/submissions", async (req, res) => {
    try {
      // Validate the request body
      const submissionData = insertSubmissionSchema.parse(req.body);
      
      // Store the submission data
      const submission = await storage.createSubmission(submissionData);
      
      res.status(201).json({
        message: "Submission recorded successfully",
        data: submission
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid submission data",
          errors: validationError.message
        });
      } else {
        console.error("Error handling submission:", error);
        res.status(500).json({
          message: "An error occurred while processing your submission"
        });
      }
    }
  });

  // Get all leadership values
  app.get("/api/leadership-values", async (req, res) => {
    try {
      const values = await storage.getAllLeadershipValues();
      res.json(values);
    } catch (error) {
      console.error("Error fetching leadership values:", error);
      res.status(500).json({
        message: "An error occurred while fetching leadership values"
      });
    }
  });
  
  // Create a new leadership value
  app.post("/api/leadership-values", async (req, res) => {
    try {
      // Validate the request body
      const valueData = insertLeadershipValueSchema.parse(req.body);
      
      // Store the leadership value
      const value = await storage.createLeadershipValue(valueData);
      
      res.status(201).json({
        message: "Leadership value created successfully",
        data: value
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid leadership value data",
          errors: validationError.message
        });
      } else {
        console.error("Error creating leadership value:", error);
        res.status(500).json({
          message: "An error occurred while creating the leadership value"
        });
      }
    }
  });
  
  // Get a specific leadership value by ID
  app.get("/api/leadership-values/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const value = await storage.getLeadershipValueById(id);
      if (!value) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      res.json(value);
    } catch (error) {
      console.error("Error fetching leadership value:", error);
      res.status(500).json({
        message: "An error occurred while fetching the leadership value"
      });
    }
  });
  
  // Update a leadership value
  app.put("/api/leadership-values/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if the value exists
      const existingValue = await storage.getLeadershipValueById(id);
      if (!existingValue) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      // Validate and update the value
      const valueData = insertLeadershipValueSchema.parse(req.body);
      
      const updatedValue = await storage.updateLeadershipValue(id, valueData);
      
      res.json({
        message: "Leadership value updated successfully",
        data: updatedValue
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid leadership value data",
          errors: validationError.message
        });
      } else {
        console.error("Error updating leadership value:", error);
        res.status(500).json({
          message: "An error occurred while updating the leadership value"
        });
      }
    }
  });
  
  // Delete a leadership value
  app.delete("/api/leadership-values/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if the value exists
      const existingValue = await storage.getLeadershipValueById(id);
      if (!existingValue) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      await storage.deleteLeadershipValue(id);
      
      res.json({
        message: "Leadership value deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting leadership value:", error);
      res.status(500).json({
        message: "An error occurred while deleting the leadership value"
      });
    }
  });

  app.post('/api/send-pdf-email', async (req, res) => {
    try {
      const { pdfBase64, userInfo, coreValues } = req.body;

      
      if (!pdfBase64 || !userInfo || !userInfo.email || !userInfo.name || !coreValues) {
        return res.status(400).json({ error: 'Missing required data' });
      }
      
      const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
      
      // Create HTML content
      const valuesList = coreValues.map((value: any, index: number) => 
        `<li>${index + 1}. <strong>${value.value}</strong>: ${value.description}</li>`
      ).join('');

      const firstName = extractFirstName(userInfo.name);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Your Leadership Values</h1>
          <p>Hello ${firstName},</p>
          <p>Thank you for completing the Leadership Values Assessment. Your PDF is attached to this email.</p>
          <h2 style="color: #3b82f6;">Your Core Leadership Values:</h2>
          <ul>
            ${valuesList}
          </ul>
          <p>Use these values to guide your leadership journey and decision-making.</p>
          <p>Best regards,<br>The Leadership Values Team</p>
        </div>
      `;
      
      const result = await sendEmail({
        to: userInfo.email,
        subject: 'Your Leadership Values Results',
        html,
        attachments: [
          {
            filename: `${firstName}_Leadership_Values.pdf`,
            content: pdfBuffer
          }
        ]
      });
      
      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to send email', details: result.error });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
