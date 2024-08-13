// components/ContactForm.tsx
'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  message: string;
};

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClasses =
    'form-input border border-gray-300 hover:border-black px-4 py-3 w-full outline-0';

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Your message has been sent successfully!');
        reset();
      } else {
        toast.error('Failed to send your message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5 md:p-10 border">
      <h2 className="font-bold text-2xl mb-5">Drop us a line</h2>

      <div className="mb-5">
        <input
          id="firstName"
          type="text"
          placeholder="First Name"
          {...register('firstName', { required: 'First name is required' })}
          className={cn(inputClasses, errors.firstName ? 'border-red-600' : '')}
        />
      </div>
      <div className="mb-5">
        <input
          id="lastName"
          type="text"
          placeholder="Last Name"
          {...register('lastName', { required: 'Last name is required' })}
          className={cn(inputClasses, errors.lastName ? 'border-red-600' : '')}
        />
      </div>
      <div className="mb-5">
        <input
          id="email"
          type="email"
          placeholder="Email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
              message: 'Invalid email address',
            },
          })}
          className={cn(inputClasses, errors.email ? 'border-red-600' : '')}
        />
      </div>
      <div className="mb-5">
        <input
          id="mobileNumber"
          type="text"
          placeholder="Mobile Number"
          className={cn(inputClasses)}
        />
      </div>
      <div className="mb-5">
        <textarea
          id="message"
          placeholder="Type your message"
          className={cn(inputClasses)}
        />
      </div>
      {hasErrors ? (
        <span className="text-rose-600 text-sm">
          * Please enter valid details
        </span>
      ) : (
        ''
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white text-center w-full px-10 py-4 font-bold"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
