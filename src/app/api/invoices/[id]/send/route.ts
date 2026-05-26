import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/getUser'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: true, client: true, project: true },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const smtpConfigured =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

  if (!smtpConfigured) {
    // Update invoice status even without sending email
    await prisma.invoice.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    })
    return NextResponse.json({
      message: 'Invoice marked as sent (SMTP not configured, email not sent)',
      warning: 'Configure SMTP environment variables to send actual emails',
    })
  }

  const recipientEmail = invoice.client?.email
  if (!recipientEmail) {
    return NextResponse.json({ error: 'Client has no email address' }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const total = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const itemsHtml = invoice.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.description}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.rate.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">$${item.amount.toFixed(2)}</td>
        </tr>`
    )
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Invoice #${invoice.number}</h1>
      <p>Dear ${invoice.client?.name || 'Client'},</p>
      <p>Please find your invoice details below:</p>
      ${invoice.project ? `<p><strong>Project:</strong> ${invoice.project.name}</p>` : ''}
      ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #1e40af; color: white;">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px;">Qty</th>
            <th style="padding: 10px; text-align: right;">Rate</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #1e40af;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
      <p>Thank you for your business!</p>
      <p><strong>${user.name}</strong></p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipientEmail,
    subject: `Invoice #${invoice.number}`,
    html,
  })

  await prisma.invoice.update({
    where: { id },
    data: { status: 'SENT', sentAt: new Date() },
  })

  return NextResponse.json({ message: 'Invoice sent successfully' })
}
