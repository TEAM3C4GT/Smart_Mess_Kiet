import nodemailer from 'nodemailer';
import { Wastage, Attendance, KFCOrder } from '../models/Schemas.js';

const getTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
};

export const buildWeeklyDigest = async () => {
  const periodStart = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  const [wastage, attendance, orders] = await Promise.all([
    Wastage.find({ date: { $gte: periodStart } }).lean(),
    Attendance.find({ date: { $gte: periodStart } }).lean(),
    KFCOrder.find().limit(200).lean()
  ]);

  const totalWastageKg = wastage.reduce((sum, w) => sum + (w.actualKg || 0), 0);
  const wastageSavedKg = wastage.reduce((sum, w) => sum + (w.savedKg || 0), 0);
  const accuracies = attendance
    .filter((a) => typeof a.accuracy === 'number')
    .map((a) => a.accuracy);
  const avgForecastAccuracy = accuracies.length
    ? accuracies.reduce((sum, v) => sum + v, 0) / accuracies.length
    : 0;
  const kfcRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    periodStart,
    periodEnd,
    totalWastageKg: Number(totalWastageKg.toFixed(1)),
    avgWastageKg: Number((wastage.length ? totalWastageKg / wastage.length : 0).toFixed(1)),
    wastageSavedKg: Number(wastageSavedKg.toFixed(1)),
    avgForecastAccuracy: Number(avgForecastAccuracy.toFixed(1)),
    kfcOrders: orders.length,
    kfcRevenue
  };
};

export const renderDigestHtml = (d) => `
  <div style="font-family:Inter,Arial,sans-serif;color:#293749;max-width:560px">
    <h2 style="color:#355F97">Smart Mess — Weekly Digest</h2>
    <p style="color:#65748A">${d.periodStart} → ${d.periodEnd}</p>
    <table cellpadding="8" style="border-collapse:collapse;border:1px solid #DCE4EF;width:100%">
      <tr><td>Total wastage</td><td><b>${d.totalWastageKg} kg</b></td></tr>
      <tr><td>Average daily wastage</td><td><b>${d.avgWastageKg} kg/day</b></td></tr>
      <tr><td>Wastage saved vs target</td><td><b>${d.wastageSavedKg} kg</b></td></tr>
      <tr><td>Avg forecast accuracy</td><td><b>${d.avgForecastAccuracy}%</b></td></tr>
      <tr><td>KFC orders / revenue</td><td><b>${d.kfcOrders} / ₹${d.kfcRevenue}</b></td></tr>
    </table>
  </div>
`;

/**
 * Builds and sends the weekly digest. When SMTP is not configured the digest is
 * logged instead of emailed so the job never breaks the server.
 */
export const sendWeeklyDigest = async () => {
  const data = await buildWeeklyDigest();
  const transport = getTransport();
  const to = process.env.DIGEST_TO;

  if (!transport || !to) {
    console.log('📧 Weekly digest (SMTP not configured — logging only):', data);
    return { success: true, delivered: false, reason: 'SMTP not configured', data };
  }

  await transport.sendMail({
    from: process.env.MAIL_FROM || 'smart-mess@kiet.edu',
    to,
    subject: `Smart Mess Weekly Digest (${data.periodStart} → ${data.periodEnd})`,
    html: renderDigestHtml(data)
  });
  console.log('📧 Weekly digest emailed to', to);
  return { success: true, delivered: true, data };
};
