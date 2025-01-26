"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  position: z.string(),
  department: z.string(),
  salary: z.number().positive(),
  bankAccountNumber: z.string(),
  bankName: z.string(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  joinedAt: z.date(),
  dateOfBirth: z.date(),
  personalEmail: z.string().email().optional(),
  phone: z.string(),
  address: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
})

export function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employmentType: "FULL_TIME",
      gender: "MALE",
      joinedAt: new Date(),
      dateOfBirth: "",
    },
  })

  const slides = [
    {
      title: "Account Details",
      fields: ["email", "password", "name"],
    },
    {
      title: "Employment Details",
      fields: ["position", "department", "employmentType"],
    },
    {
      title: "Personal Details",
      fields: ["dateOfBirth", "joinedAt", "gender"],
    },
    {
      title: "Contact Details",
      fields: ["phone", "personalEmail", "address"],
    },
    {
      title: "Financial Details",
      fields: ["salary", "bankName", "bankAccountNumber"],
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  async function onSubmit(values) {
    try {
      await onAddEmployee(values)
      form.reset()
      setCurrentSlide(0)
      onClose()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const renderField = (fieldName) => {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}</FormLabel>
            <FormControl>
              {fieldName === "employmentType" ? (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                  </SelectContent>
                </Select>
              ) : fieldName === "gender" ? (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : fieldName === "dateOfBirth" || fieldName === "joinedAt" ? (
                <Input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : "";
                    field.onChange(date);
                  }}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ""}
                />
              ) : fieldName === "salary" ? (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                />
              ) : (
                <Input {...field} type={fieldName.includes("email") ? "email" : fieldName === "password" ? "password" : "text"} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the employee details to create a new account. The Employee ID will be automatically generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              {/* Slide Content */}
              <div className="min-h-[400px] transition-all duration-300 ease-in-out">
                <div className="font-medium text-lg mb-4">{slides[currentSlide].title}</div>
                <div className="space-y-4">
                  {slides[currentSlide].fields.map(renderField)}
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === index ? "w-4 bg-primary" : "w-2 bg-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                {currentSlide === slides.length - 1 ? (
                  <Button type="submit">Add Employee</Button>
                ) : (
                  <Button type="button" onClick={nextSlide}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
