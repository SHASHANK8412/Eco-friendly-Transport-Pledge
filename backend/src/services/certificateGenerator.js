import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Certificate Generator Service
 * Generates PDF certificates for eco-pledges
 */
export class CertificateGenerator {
  constructor() {
    // Create certificates directory if it doesn't exist
    this.certificatesDir = path.join(__dirname, '../../public/certificates');
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  addBorder(doc) {
    const { width, height } = doc.page;
    
    // Draw elegant double border with more padding
    doc.strokeColor('#1F2937')
       .lineWidth(3)
       .rect(25, 25, width - 50, height - 50)
       .stroke();

    doc.strokeColor('#059669')
       .lineWidth(1.5)
       .rect(35, 35, width - 70, height - 70)
       .stroke();

    // Add subtle decorative corners
    const cornerSize = 20;
    doc.strokeColor('#059669')
       .lineWidth(2);
    
    // Top left corner decoration
    doc.moveTo(35, 50)
       .lineTo(35, 35)
       .lineTo(50, 35)
       .stroke();

    // Top right corner decoration
    doc.moveTo(width - 50, 35)
       .lineTo(width - 35, 35)
       .lineTo(width - 35, 50)
       .stroke();

    // Bottom left corner decoration
    doc.moveTo(35, height - 50)
       .lineTo(35, height - 35)
       .lineTo(50, height - 35)
       .stroke();

    // Bottom right corner decoration
    doc.moveTo(width - 50, height - 35)
       .lineTo(width - 35, height - 35)
       .lineTo(width - 35, height - 50)
       .stroke();

    // Add subtle header decoration line
    doc.strokeColor('#E5E7EB')
       .lineWidth(0.5)
       .moveTo(80, 110)
       .lineTo(width - 80, 110)
       .stroke();

    // Add subtle footer decoration line  
    doc.strokeColor('#E5E7EB')
       .lineWidth(0.5)
       .moveTo(80, height - 80)
       .lineTo(width - 80, height - 80)
       .stroke();
  }

  /**
   * Add professional certificate content to the document
   * @param {PDFDocument} doc - PDF document
   * @param {Object} data - Certificate data
   */
  addProfessionalCertificateContent(doc, data) {
    const { certificateId, recipientName, pledgeText, issueDate } = data;

    // Add decorative border
    this.addBorder(doc);

    // Start content well within the borders (after the border at y=40, add some padding)
    doc.y = 80;

    // Add header logo/title area
    doc.fontSize(12)
      .fillColor('#6B7280')
      .text('ECOPLEDGE PORTAL', {
        align: 'center'
      });

    doc.moveDown(0.3);

    // Main certificate title - reduced font sizes to fit better
    doc.font('Helvetica-Bold')
      .fontSize(32)
      .fillColor('#1F2937')
      .text('CERTIFICATE', {
        align: 'center'
      });

    doc.fontSize(20)
      .fillColor('#059669')
      .text('OF ENVIRONMENTAL COMMITMENT', {
        align: 'center'
      });

    doc.moveDown(0.8);

    // Certification text
    doc.font('Helvetica')
      .fontSize(14)
      .fillColor('#374151')
      .text('This is to certify that', {
        align: 'center'
      });

    doc.moveDown(0.5);

    // Recipient name without underline
    doc.font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#1F2937')
      .text(recipientName, {
        align: 'center'
      });

    doc.moveDown(0.8);

    // Achievement description
    doc.font('Helvetica')
      .fontSize(13)
      .fillColor('#374151')
      .text('has demonstrated exceptional commitment to environmental sustainability', {
        align: 'center'
      });

    doc.moveDown(0.3);
    doc.text('by taking the following pledge:', {
      align: 'center'
    });

    doc.moveDown(0.6);

    // Pledge text in quotation box - adjusted size and position
    const pledgeBoxX = 100;
    const pledgeBoxY = doc.y;
    const pledgeBoxWidth = doc.page.width - 200;
    const pledgeBoxHeight = 60;

    // Draw pledge box
    doc.rect(pledgeBoxX, pledgeBoxY, pledgeBoxWidth, pledgeBoxHeight)
      .fillColor('#F9FAFB')
      .fill()
      .strokeColor('#E5E7EB')
      .lineWidth(1)
      .rect(pledgeBoxX, pledgeBoxY, pledgeBoxWidth, pledgeBoxHeight)
      .stroke();

    // Add pledge text
    doc.fillColor('#1F2937')
      .fontSize(12)
      .font('Helvetica-Oblique')
      .text(`"${pledgeText}"`, pledgeBoxX + 15, pledgeBoxY + 15, {
        width: pledgeBoxWidth - 30,
        align: 'center'
      });

    doc.y = pledgeBoxY + pledgeBoxHeight + 20;

    // Date and certificate ID section
    const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Left side - Date
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#6B7280')
      .text(`Issued on: ${formattedDate}`, 100, doc.y);

    // Right side - Certificate ID
    doc.text(`Certificate ID: ${certificateId}`, 0, doc.y, {
      align: 'right',
      width: doc.page.width - 100
    });

    doc.moveDown(1.5);

    // Signature section - adjusted to stay within borders
    const signatureY = doc.y;
    const leftSignatureStart = 120;
    const leftSignatureEnd = 250;
    const rightSignatureStart = doc.page.width - 250;
    const rightSignatureEnd = doc.page.width - 120;
    
    // Left signature line
    doc.strokeColor('#6B7280')
      .lineWidth(1)
      .moveTo(leftSignatureStart, signatureY)
      .lineTo(leftSignatureEnd, signatureY)
      .stroke();

    // Right signature line  
    doc.moveTo(rightSignatureStart, signatureY)
      .lineTo(rightSignatureEnd, signatureY)
      .stroke();

    // Signature labels
    doc.fontSize(9)
      .fillColor('#6B7280')
      .text('Participant Signature', leftSignatureStart, signatureY + 8);
    
    doc.text('EcoPledge Authority', rightSignatureStart, signatureY + 8);

    doc.moveDown(1.5);

    // Footer section - properly centered and styled
    doc.fontSize(9)
      .fillColor('#9CA3AF')
      .text('This certificate recognizes your commitment to environmental stewardship', {
        align: 'center'
      });
    
    doc.moveDown(0.3);
    doc.text('Visit ecopledge.org to verify authenticity', {
      align: 'center'
    });
  }

  /**
   * Generate PDF certificate and return as buffer for MongoDB storage
   * @param {Object} data - Certificate data
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generatePDFBuffer(data) {
    return new Promise((resolve, reject) => {
      try {
        const { certificateId, recipientName, pledgeText, issueDate } = data;

        console.log('Generating certificate buffer with data:', {
          certificateId,
          recipientName,
          pledgeText: pledgeText?.substring(0, 50) + '...',
          issueDate
        });

        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
          },
          info: {
            Title: 'Eco-Friendly Pledge Certificate',
            Author: 'EcoPledge Portal'
          }
        });

        // Collect the PDF data in memory
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          console.log(`Certificate PDF buffer created successfully, size: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => {
          console.error('Error generating certificate PDF buffer:', err);
          reject(err);
        });

        // Add professional certificate content
        this.addProfessionalCertificateContent(doc, data);

        // Finalize the PDF
        console.log('Finalizing PDF document buffer...');
        doc.end();
      } catch (error) {
        console.error('Error generating certificate buffer:', error);
        reject(error);
      }
    });
  }

  generatePDF(certificateData) {
    return new Promise((resolve, reject) => {
      try {
        const { certificateId, recipientName, pledgeText, issueDate } = certificateData;
        console.log('Generating certificate with data:', {
          certificateId,
          recipientName,
          pledgeText: pledgeText?.substring(0, 50) + '...',
          issueDate
        });

        // Ensure certificates directory exists
        if (!fs.existsSync(this.certificatesDir)) {
          console.log('Creating certificates directory:', this.certificatesDir);
          fs.mkdirSync(this.certificatesDir, { recursive: true });
        }

        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
          },
          info: {
            Title: 'Eco-Friendly Pledge Certificate',
            Author: 'EcoPledge Portal'
          }
        });

        const outputPath = path.join(this.certificatesDir, `${certificateId}.pdf`);
        console.log('Creating PDF at path:', outputPath);
        
        const writeStream = fs.createWriteStream(outputPath);

        writeStream.on('finish', () => {
          console.log(`Certificate PDF file created successfully at: ${outputPath}`);
          // Verify file exists before resolving
          if (fs.existsSync(outputPath)) {
            console.log(`File verified exists: ${outputPath}`);
            resolve(outputPath);
          } else {
            console.error(`File was not created: ${outputPath}`);
            reject(new Error(`PDF file was not created at ${outputPath}`));
          }
        });

        writeStream.on('error', (err) => {
          console.error('Error writing certificate PDF:', err);
          reject(err);
        });

        doc.pipe(writeStream);

        // Use the same professional template as generatePDFBuffer
        this.addProfessionalCertificateContent(doc, certificateData);

        // Finalize the PDF
        console.log('Finalizing PDF document...');
        doc.end();
      } catch (error) {
        console.error('Error generating certificate:', error);
        reject(error);
      }
    });
  }
}