import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

// Create email transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email to reporter confirming receipt
const sendReporterEmail = async (
  reporterEmail,
  reporterName,
  itemTitle,
  reportId,
) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"TinyThreads Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: reporterEmail,
      subject: 'Report Received - TinyThreads',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ff8b6a 0%, #f27b65 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .report-id { background: white; padding: 15px; border-left: 4px solid #f27b65; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Report Received</h1>
              </div>
              <div class="content">
                <p>Hi ${reporterName || 'there'},</p>
                
                <p>Thank you for helping keep TinyThreads safe. We have received your report regarding the listing <strong>"${itemTitle}"</strong>.</p>
                
                <div class="report-id">
                  <strong>Report ID:</strong> ${reportId}
                </div>
                
                <p>Our team will review this report and take appropriate action if necessary. We typically review reports within 24-48 hours.</p>
                
                <p>If we need additional information, we'll reach out to you at this email address.</p>
                
                <p>Thank you for being a responsible member of our community!</p>
                
                <p>Best regards,<br>The TinyThreads Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Error sending reporter email:', error);
    // Don't throw - we don't want email failure to fail the report submission
  }
};

// Send email to founders about the report
const sendFoundersEmail = async (reportData) => {
  try {
    const transporter = createTransporter();
    const foundersEmail = process.env.FOUNDERS_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"TinyThreads Reports" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: foundersEmail,
      subject: `⚠️ New Report: ${reportData.itemTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 700px; margin: 0 auto; padding: 20px; }
              .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: white; border: 1px solid #ddd; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-row { padding: 12px; margin: 8px 0; background: #f8f9fa; border-radius: 4px; }
              .info-label { font-weight: bold; color: #495057; }
              .details-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 4px; }
              .action-btn { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ New Listing Report</h1>
              </div>
              <div class="content">
                <h2>Report Details</h2>
                
                <div class="info-row">
                  <span class="info-label">Report ID:</span> ${reportData._id}
                </div>
                
                <div class="info-row">
                  <span class="info-label">Item Title:</span> ${reportData.itemTitle}
                </div>
                
                <div class="info-row">
                  <span class="info-label">Item ID:</span> ${reportData.itemId}
                </div>
                
                <div class="info-row">
                  <span class="info-label">Reason:</span> <strong>${reportData.reason}</strong>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Reported By:</span> ${reportData.reporterName || 'Anonymous'} (${reportData.reporterEmail || 'N/A'})
                </div>
                
                <div class="info-row">
                  <span class="info-label">Reporter ID:</span> ${reportData.reporterId || 'N/A'}
                </div>
                
                <div class="info-row">
                  <span class="info-label">Seller:</span> ${reportData.sellerName || 'Unknown'} (${reportData.sellerEmail || 'N/A'})
                </div>
                
                <div class="info-row">
                  <span class="info-label">Seller ID:</span> ${reportData.sellerId}
                </div>
                
                ${
                  reportData.details
                    ? `
                  <div class="details-box">
                    <strong>Additional Details:</strong>
                    <p>${reportData.details}</p>
                  </div>
                `
                    : ''
                }
                
                <div class="info-row">
                  <span class="info-label">Submitted:</span> ${new Date(reportData.createdAt).toLocaleString()}
                </div>
                
                <a href="${process.env.NEXTAUTH_URL}/admin/reports/${reportData._id}" class="action-btn">
                  Review Report
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Error sending founders email:', error);
    // Don't throw - we don't want email failure to fail the report submission
  }
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        { error: 'You must be logged in to submit a report' },
        { status: 401 },
      );
    }

    const {
      itemId,
      itemTitle,
      sellerId,
      sellerName,
      sellerEmail,
      reporterId,
      reporterName,
      reporterEmail,
      reason,
      details,
    } = await req.json();

    // Validate required fields
    if (!itemId || !sellerId || !reason) {
      return Response.json(
        {
          error:
            'Missing required fields: itemId, sellerId, and reason are required',
        },
        { status: 400 },
      );
    }

    const db = await getDb();
    const reportsCollection = db.collection('reports');

    // Create report document
    const report = {
      itemId: ObjectId.isValid(itemId) ? new ObjectId(itemId) : itemId,
      itemTitle: itemTitle || 'Unknown',
      sellerId: ObjectId.isValid(sellerId) ? new ObjectId(sellerId) : sellerId,
      sellerName: sellerName || 'Unknown',
      sellerEmail: sellerEmail || null,
      reporterId: reporterId
        ? ObjectId.isValid(reporterId)
          ? new ObjectId(reporterId)
          : reporterId
        : null,
      reporterName: reporterName || session.user.name || 'Anonymous',
      reporterEmail: reporterEmail || session.user.email || null,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert report into database
    const result = await reportsCollection.insertOne(report);
    const reportId = result.insertedId.toString();

    // Send emails asynchronously (don't wait for them)
    if (reporterEmail || session.user.email) {
      sendReporterEmail(
        reporterEmail || session.user.email,
        reporterName || session.user.name,
        itemTitle,
        reportId,
      ).catch((err) => console.error('Reporter email failed:', err));
    }

    sendFoundersEmail({
      ...report,
      _id: reportId,
    }).catch((err) => console.error('Founders email failed:', err));

    return Response.json(
      {
        success: true,
        message: 'Report submitted successfully',
        reportId: reportId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json(
      { error: 'Failed to submit report. Please try again.' },
      { status: 500 },
    );
  }
}
