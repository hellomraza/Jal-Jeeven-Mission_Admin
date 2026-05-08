import z from "zod";

export const emailValidation = z.string().email();

export const passwordValidation = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, and number",
  );

export const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters");

export const createUserSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
});

export const createEmployeeSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  district_name: z.string().min(1, "District is required"),
  address: z.string().trim().min(5, "Address is required"),
  password: passwordValidation,
});

export const panValidation = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must follow the format AAAAA9999A");

export const createContractorSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  pan_number: panValidation,
  district_name: z.string().min(1, "District is required"),
  address: z.string().trim().min(5, "Address is required"),
});

export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export const assignEmployeesSchema = z.object({
  workItemId: z.string(),
  employeeIds: z.array(z.string()).min(1, "Select at least one employee"),
});

export const updateComponentSchema = z.object({
  componentId: z.string(),
  quantity: z.string().regex(/^\d+$/, "Quantity must be a positive integer"),
  workItemId: z.string(),
});
