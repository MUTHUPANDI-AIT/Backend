export interface IUserPayload {
  _id: string;
  email: string;
  name: string;
  role: string | null;
  role_id: string;
}

export interface IRegisterResponse {
  message: string;
  token: string;
  role: string | null;
  name: string;
  userId: string;
}

export interface ILoginResponse {
  message: string;
  token: string;
  role: string | null;
  name: string;
  userId: string;
}
