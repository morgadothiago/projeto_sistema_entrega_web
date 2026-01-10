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

      console.log("🔐 [Server Action] Resultado COMPLETO do signIn:", result);
      console.log("🔐 [Server Action] result?.ok:", result?.ok);
      console.log("🔐 [Server Action] result?.error:", result?.error);

      // NextAuth v5 pode retornar null em caso de sucesso quando redirect: false
      // Se não há erro, considera como sucesso
      const loginSuccess = !result?.error && result !== null;

      _actionState.error = result?.error || "";
      _actionState.success = loginSuccess;
      _actionState.message = result?.error || "Login realizado com sucesso!";

      console.log("📤 [Server Action] Retornando actionState:", {
        success: _actionState.success,
        error: _actionState.error,
        message: _actionState.message,
        loginSuccess: loginSuccess
      });

      // IMPORTANTE: Não usar redirect() com useActionState
      // O redirect será feito no cliente quando success = true

    } catch (error) {
      _actionState.success = false;

      if(error instanceof ValidationError) {
        _actionState.error = {
          message: error.message,
          path: error.path,
          errors: error.errors,
        } as ValidationError;

      }
      else {
        _actionState.error = (error as Error).message
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