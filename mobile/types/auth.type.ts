export type RegisterInstructorPayload = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  expertise?: string;
  websiteUrl?: string;
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
};

export type RegisterInstructorResponse = {
  message: string;
  userId: string;
};
