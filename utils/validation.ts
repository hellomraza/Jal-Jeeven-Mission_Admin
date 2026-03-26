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
