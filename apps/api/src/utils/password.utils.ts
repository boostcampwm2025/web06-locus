import bcrypt from 'bcrypt';

export const hash = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

export const compare = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};
