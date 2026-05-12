import z from "zod";

export const emailValidation = z.string().email();

export const passwordValidation = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, and number",
  );
export const loginPasswordValidation = z.string();

export const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters");

export const createUserSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: z.string().trim().nonempty("Password is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  district_id: z.string().min(1, "District is required"),
  district_name: z.string().min(1, "District is required"),
});

export const updateDistrictOfficerSchema = z.object({
  id: z.string().min(1, "District Officer ID is required"),
  name: nameValidation,
  email: emailValidation,
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  district_id: z.string().min(1, "District is required"),
  password: z.string().optional().default(""),
});

export const createDOSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: z.string().trim().nonempty("Password is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  district_id: z.string().min(1, "District is required"),
});

export const createEmployeeSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  district_name: z.string().min(1, "District is required").optional(),
  address: z.string().trim().min(5, "Address is required"),
  password: z.string().trim().nonempty("Password is required"),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ password: true })
  .extend({
    id: z.string().min(1, "Employee ID is required"),
    password: z.string().optional().default(""),
  });

export const panValidation = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must follow the format AAAAA9999A");

export const createContractorSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: z.string().trim().nonempty("Password is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  pan_number: panValidation,
  district_name: z.string().min(1, "District is required"),
  address: z.string().trim().min(5, "Address is required"),
});

export const updateContractorSchema = createContractorSchema
  .omit({ password: true })
  .extend({
    id: z.string().min(1, "Contractor ID is required"),
    password: z.string().optional().default(""),
  });

export const loginSchema = z.object({
  email: emailValidation,
  password: loginPasswordValidation,
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
