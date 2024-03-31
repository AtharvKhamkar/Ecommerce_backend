import { z } from "zod";

const signupSchema = z.object({
    firstName: z.
        string({ required_error: "Name is required" })
        .trim()
        .min(3, { message: "Name must be at least of 3 character" })
        .max(255, { message: "Name must not be more than 255 characters" }),
    lastName: z.
        string({ required_error: "Last name is required" })
        .trim()
        .min(3, { message: "Last name must be of 3 character" })
        .max(255, { message: "Last name must not be greater than 255 character" }),
    email: z.
        string({ required_error: "EmailId is required" })
        .trim()
        .email({ message: "Invalid email address" })
        .min(3, { message: "Email must be at least of 3 characters" })
        .max(255, { message: "Email must not be grater than 255 characters" }),
    mobile: z.
        string({ required_error: "Mobile number is required" })
        .trim()
        .min(10, { message: "Invalid mobile number" })
        .max(20, { message: "Invalid mobile number" }),
    password: z.
        string({ required_error: "Password is required" })
        .trim()
        .min(8, { message: "Password must contain atlest 8 characters" })
        .max(255, { message: "password can not be more than 255 characters" }),
    
});

export { signupSchema };
