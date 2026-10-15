import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Verify SMTP settings endpoint
  app.post('/api/verify-smtp', async (req: Request, res: Response) => {
    const { host, port, user, password, secure } = req.body;

    if (!host || !user || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan credenciales SMTP (Host, Usuario o Contraseña).',
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: String(host).trim(),
        port: Number(port) || 587,
        secure: Boolean(secure),
        auth: {
          user: String(user).trim(),
          pass: String(password).trim(),
        },
        tls: {
          rejectUnauthorized: false, // Prevents self-signed or corporative cert errors
        },
      });

      await transporter.verify();

      return res.json({
        success: true,
        message: 'Conexión SMTP exitosa con el servidor de correo.',
      });
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({
        success: false,
        message: `Error al conectar con SMTP: ${error.message}`,
        details: error.stack,
      });
    }
  });

  // Send single email (for batch or individual test send)
  app.post('/api/send-email', async (req: Request, res: Response) => {
    const {
      smtp,
      to,
      cc,
      subject,
      html,
      bannerBase64,
      isTestMode,
    } = req.body;

    if (isTestMode) {
      // Simulate real delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.json({
        success: true,
        simulated: true,
        message: 'Envío simulado correctamente (Modo Prueba activo).',
        recipient: to,
      });
    }

    if (!smtp || !smtp.host || !smtp.user || !smtp.password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan credenciales de servidor SMTP para envío real.',
      });
    }

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No se especificaron destinatarios (TO).',
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: String(smtp.host).trim(),
        port: Number(smtp.port) || 587,
        secure: Boolean(smtp.secure),
        auth: {
          user: String(smtp.user).trim(),
          pass: String(smtp.password).trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const attachments: any[] = [];
      if (bannerBase64 && typeof bannerBase64 === 'string') {
        const matches = bannerBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          attachments.push({
            filename: 'logo_esenttia.jpg',
            content: Buffer.from(matches[2], 'base64'),
            cid: 'logo_esenttia',
          });
        }
      } else {
        const defaultDiskImg = path.resolve(__dirname, 'src/assets/images/esenttia_footer_signature_1792078674418.jpg');
        if (fs.existsSync(defaultDiskImg)) {
          attachments.push({
            filename: 'logo_esenttia.jpg',
            content: fs.readFileSync(defaultDiskImg),
            cid: 'logo_esenttia',
          });
        }
      }

      const mailOptions = {
        from: `"${smtp.senderName || 'Servicio al Cliente'}" <${smtp.user.trim()}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: Array.isArray(cc) && cc.length > 0 ? cc.join(', ') : undefined,
        subject: subject || 'Notificación de pedidos y fechas',
        html,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);

      return res.json({
        success: true,
        messageId: info.messageId,
        message: 'Correo enviado satisfactoriamente.',
        accepted: info.accepted,
      });
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({
        success: false,
        message: error.message || 'Error desconocido al enviar correo.',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AutoMail activo en http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
