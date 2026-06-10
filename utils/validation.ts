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
  district_id: z.string().min(1, "District is required"),
  address: z.string().trim().min(5, "Address is required"),
  code: z
    .string()
    .trim()
    .length(9, "User code must be exactly 9 characters")
    .regex(/^[a-zA-Z0-9]+$/, "User code must be alphanumeric"),
});

export const updateContractorSchema = createContractorSchema
  .omit({ password: true })
  .extend({
    id: z.string().min(1, "Contractor ID is required"),
    password: z.string().optional().default(""),
    district_id: z.string().min(1, "District is required"),
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

export const updateWorkOrderSchema = z.object({
  id: z.string().min(1, "Work Item ID is required"),
  work_code: z.string().trim().min(1, "Work code is required"),
  schemetype: z.string().trim().min(1, "Scheme type is required"),
  workcodeid: z.string().trim().optional(),
  excel: z.string().trim().optional(),
  district_id: z.string().trim().optional(),
  block_id: z.string().trim().optional(),
  panchayat_id: z.string().trim().optional(),
  nofhtc: z.string().trim().optional(),
  amount_approved: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  sr: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  agreement_id: z.string().optional(),
  title: z.string().trim().optional(),
  latitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  progress_percentage: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(100).optional()
  ),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional().default("PENDING"),
});
