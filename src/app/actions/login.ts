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
      
      _actionState.error = result?.error;
      _actionState.success = result?.ok;
      _actionState.message = result?.error || "Login realizado com sucesso!";
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