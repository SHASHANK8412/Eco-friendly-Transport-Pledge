import { CertificateGenerator } from '../services/certificateGenerator.js';
import nodemailer from 'nodemailer';

const certificateGenerator = new CertificateGenerator();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const generateCertificate = async (req, res) => {
  try {
    const pledgeData = req.body;
    
    // Generate certificate
    const { pdfBuffer, downloadUrl, filename } = await certificateGenerator.generatePDF(pledgeData);

    // Send email if user email is provided
    if (pledgeData.userEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: pledgeData.userEmail,
        subject: 'Your Eco-Friendly Pledge Certificate',
        html: `
          <h1>Thank you for taking the Eco-Friendly Pledge!</h1>
          <p>Please find your certificate attached. Together, we can make a difference!</p>
          <p>You can also download your certificate using this link: ${downloadUrl}</p>
        `,
        attachments: [{
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
    }

    res.json({ 
      message: 'Certificate generated successfully',
      downloadUrl 
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const pledge = await Pledge.findById(pledgeId);
    
    if (!pledge) {
      return res.status(404).json({ error: 'Pledge not found' });
    }

    // Generate new certificate
    const { pdfBuffer } = await certificateGenerator.generatePDF(pledge);

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate_${pledge.rollNo}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Failed to retrieve certificate' });
  }
};