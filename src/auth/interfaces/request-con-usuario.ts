export interface UsuarioToken {
  userId: number;
  email: string;
  rol: string;
}

export interface RequestConUsuario {
  user: UsuarioToken;
}