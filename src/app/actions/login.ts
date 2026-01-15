"use server"

import { ValidationError } from "yup";
import { loginValidation } from "../schema/login.schema";
import { signIn } from "../util/auth";

export type ActionState = {
  message: string;
  payload?: FormData;
  error?: string | ValidationError;
  success?: boolean;
};

export const loginRequester = async (_actionState: ActionState, formdata: FormData): Promise<ActionState> => {
  try {
    _actionState.success = false;
    _actionState.error = "";
    _actionState.message = "";
    _actionState.payload = formdata;

    const data = {
      email: formdata.get("email") as string,
      password: formdata.get("password") as string,
    };


    await loginValidation.validate(data);

    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password
    });

    // NextAuth v5 pode retornar null em caso de sucesso quando redirect: false
    // Se não há erro, considera como sucesso
    const loginSuccess = !result?.error && result !== null;

    _actionState.error = result?.error || "";
    _actionState.success = loginSuccess;
    _actionState.message = result?.error || "Login realizado com sucesso!";

    // IMPORTANTE: Não usar redirect() com useActionState
    // O redirect será feito no cliente quando success = true

  } catch (error) {
    _actionState.success = false;

    if (error instanceof ValidationError) {
      _actionState.error = {
        message: error.message,
        path: error.path,
        errors: error.errors,
      } as ValidationError;
    } else {
      let errorMessage = (error as Error).message;
      const errorCause = (error as any).cause;

      // Helper recursive function to find the real error message
      const findRealMessage = (obj: any): string | null => {
        if (!obj) return null;
        if (obj.message && typeof obj.message === 'string' && obj.message !== errorMessage) return obj.message;
        if (obj.err) return findRealMessage(obj.err);
        if (obj.error) return findRealMessage(obj.error);
        return null;
      };

      if (errorCause) {
        const deepMessage = findRealMessage(errorCause);
        if (deepMessage) {
          errorMessage = deepMessage;
        }
      }

      try {
        // Tenta parsear JSON de status (ex: { status: 'ERROR', message: 'Credenciais inválidas' })
        const jsonString = errorMessage.replace(/^Error:\s*/, '');

        if (jsonString.startsWith('{') && jsonString.endsWith('}')) {
          const errorData = JSON.parse(jsonString);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } catch (e) {
        // Ignorar erro de parse
      }

      // Fallback para mensagens comuns do NextAuth se não for nosso JSON
      // Verifica se é erro de credenciais inválidas (pode vir como tipo, código ou mensagem)
      const isCredentialsError =
        errorMessage === "CredentialsSignin" ||
        (error as any).code === "credentials" ||
        (error as any).type === "CredentialsSignin" ||
        errorMessage.includes("credentialssignin");

      if (isCredentialsError) {
        errorMessage = "Credenciais inválidas.";
      } else if (errorMessage.includes("CallbackRouteError")) {
        // Se ainda for CallbackRouteError, tenta uma mensagem amigável se não conseguiu extrair
        errorMessage = "Erro ao conectar ao servidor. Verifique as credenciais.";
      }

      _actionState.error = errorMessage;
      _actionState.message = errorMessage;
    }
  }

  _actionState.payload = formdata;

  return {
    ..._actionState,
    error: _actionState.error,
    message: _actionState.message,
    success: _actionState.success,
    payload: _actionState.payload,
  };

};