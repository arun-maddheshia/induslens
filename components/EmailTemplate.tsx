import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  message?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  lastName,
  email,
  mobileNumber,
  message,
}) => (
  <div>
    <h1>Hey, Team!</h1>
    <p>{firstName} has just fill contact form with below details:</p>
    <p>First Name: {firstName}</p>
    <p>Last Name: {lastName}</p>
    <p>Email: {email}</p>
    <p>Mobile Number: {mobileNumber ? mobileNumber : '-'}</p>
    <p>Message: {message ? message : '-'}</p>
  </div>
);

export default EmailTemplate;
