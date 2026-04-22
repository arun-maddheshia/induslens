// app/api/sendEmail/route.ts
import EmailTemplate from '@/components/EmailTemplate';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { firstName, lastName, email, mobileNumber, message } = body;

    const { data, error } = await resend.emails.send({
      from: 'hello@imarun.in',
      to: 'arun@t9l.com',
      subject: `Contact Form Submission from ${firstName} ${lastName}`,
      react: EmailTemplate({
        firstName,
        lastName,
        email,
        mobileNumber,
        message,
      }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
