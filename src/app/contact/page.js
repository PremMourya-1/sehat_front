"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("Thanks for reaching out! We'll get back to you soon.");
    setForm(initialForm);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <div className="text-center">
        <h1 className="font-heading text-4xl text-(--primary)">Get in Touch</h1>
        <p className="mt-2 font-accent text-(--accent-secondary)">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <FiMapPin className="mt-1 text-(--primary)" size={20} />
            <div>
              <p className="font-medium text-(--foreground)">Our Address</p>
              <p className="text-sm text-(--secondary-text)">
                123 Orchard Lane, Connaught Place, New Delhi, India
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiPhone className="mt-1 text-(--primary)" size={20} />
            <div>
              <p className="font-medium text-(--foreground)">Call Us</p>
              <p className="text-sm text-(--secondary-text)">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiMail className="mt-1 text-(--primary)" size={20} />
            <div>
              <p className="font-medium text-(--foreground)">Email Us</p>
              <p className="text-sm text-(--secondary-text)">hello@sehatpotli.com</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FloatingLabelInput
            id="contact-name"
            required
            label="Your name"
            value={form.name}
            onChange={handleChange("name")}
          />
          <FloatingLabelInput
            id="contact-email"
            type="email"
            required
            label="Your email"
            value={form.email}
            onChange={handleChange("email")}
          />
          <FloatingLabelInput
            as="textarea"
            id="contact-message"
            required
            rows={5}
            label="Your message"
            value={form.message}
            onChange={handleChange("message")}
          />
          <Button type="submit" className="w-fit">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
