import bcrypt from 'bcryptjs';

export const hashPassword =  (password) => {
    return bcrypt.hashSync(password, import.meta.env.VITE_PASSWORD_SALT);
}

export const getUserInitials = (name) => {
    
    return name?.length ? name[0] : "";
}

