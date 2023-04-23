import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NODE_API, PRIVATE_API } from "../../api/apiIndex";

const _accessToken = JSON.parse(localStorage.getItem("accessToken"));

const initialState = {
  accessToken: _accessToken ? _accessToken : null,
  data: null,

  loginError: "",
  loginStatus: "idle",

  signupError: "",
  signupStatus: "idle",

  loginWithTokenStatus: "idle",
  loginWithTokenError: "",

  updateStatus: "idle",
  updateError: "",

  verifyStatus: "idle",
  verifyError: "",

  forgotPasswordStatus: "idle",
  forgotPasswordError: "",

  resetPasswordStatus: "idle",
  resetPasswordError: "",
};

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await NODE_API.post("/auth/login", userData);
      localStorage.setItem(
        "accessToken",
        JSON.stringify(response.data.accessToken)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await NODE_API.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const loginwithtoken = createAsyncThunk(
  "auth/loginwithtoken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PRIVATE_API.get("/auth/getByToken");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const updateUserDetails = createAsyncThunk(
  "auth/updateUserDetails",
  async (data, { rejectWithValue }) => {
    try {
      const response = await PRIVATE_API.put("/auth/", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await NODE_API.get("/google/success", {
        withCredentials: true,
      });
      localStorage.setItem(
        "accessToken",
        JSON.stringify(response.data.user.accessToken)
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await NODE_API.post("/auth/password/forgot", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await NODE_API.put(
        `/auth/password/reset/${data.token}`,
        data.data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (token, { rejectWithValue }) => {
    try {
      const response = await NODE_API.put(`/auth/verify/${token}`);

      localStorage.setItem(
        "accessToken",
        JSON.stringify(response.data.accessToken)
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // const response = await NODE_API.get("auth/logout", {
      //   withCredentials: true,
      // });
      localStorage.removeItem("accessToken");
      return { data: "success" };
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    removeLoginMessage: (state) => {
      state.loginError = "";
      state.loginStatus = "idle";
    },
    removeSignupMessage: (state) => {
      state.signupError = "";
      state.signupStatus = "idle";
    },
    removeLoginWithTokenMessage: (state) => {
      state.loginWithTokenStatus = "idle";
      state.loginWithTokenError = "";
    },
    removeUpdateUserError: (state) => {
      state.updateError = "";
      state.updateStatus = "idle";
    },
    removeForgotPasswordMessage: (state) => {
      state.forgotPasswordError = "";
      state.forgotPasswordStatus = "idle";
    },
    removeResetPasswordError: (state) => {
      state.resetPasswordError = "";
      state.resetPasswordStatus = "idle";
    },
    removeVerifyUserError: (state) => {
      state.verifyError = "";
      state.verifyStatus = "idle";
    },
    // logoutComplete: (state) => {},
  },
  extraReducers: (builder) => {
    //Login
    builder
      .addCase(login.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.loginError = "";
        state.accessToken = action.payload.accessToken;
        state.data = action.payload.data;
      })
      .addCase(login.rejected, (state, action) => {
        // console.log(action.payload);
        state.loginStatus = "failed";
        state.loginError = action.payload.message;
      })
      // Sign Up
      .addCase(signup.pending, (state) => {
        state.signupStatus = "loading";
        state.signupError = "";
      })
      .addCase(signup.fulfilled, (state) => {
        state.signupStatus = "success";
        state.signupError = "";
      })
      .addCase(signup.rejected, (state, action) => {
        state.signupStatus = "failed";
        state.signupError = action.payload.message;
      })
      //Login with token
      .addCase(loginwithtoken.pending, (state) => {
        state.loginWithTokenStatus = "loading";
        state.loginWithTokenError = "";
      })
      .addCase(loginwithtoken.fulfilled, (state, action) => {
        state.loginWithTokenStatus = "success";
        state.loginWithTokenError = "";
        state.data = action.payload.data;
      })
      .addCase(loginwithtoken.rejected, (state, action) => {
        // console.log(action.payload);
        state.accessToken = null;
        localStorage.removeItem("accessToken");
        state.loginWithTokenStatus = "failed";
        state.loginWithTokenError = action.payload.message;
      })

      // Google login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = "";
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loginStatus = "success";
        state.loginError = "";
        state.accessToken = action.payload.accessToken;
        state.data = action.payload.data;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.loginError = action.payload.message;
      })

      //Update Data
      .addCase(updateUserDetails.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = "";
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.updateStatus = "success";
        state.updateError = "";
        state.data = action.payload.data;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload.message;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.forgotPasswordError = "";
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = "success";
        state.forgotPasswordError = "";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.forgotPasswordError = action.payload.message;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.resetPasswordError = "";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = "success";
        state.resetPasswordError = "";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.resetPasswordError = action.payload.message;
      })

      // Verify user
      .addCase(verifyUser.pending, (state) => {
        state.verifyStatus = "loading";
        state.verifyError = "";
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.verifyStatus = "success";
        state.verifyError = "";
        state.accessToken = action.payload.accessToken;
        state.data = action.payload.data;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.verifyStatus = "failed";
        state.verifyError = action.payload.message;
      })

      //Logout
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.data = null;
        state.accessToken = null;
        state.status = "idle";
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      });
  },
});

export const {
  removeLoginMessage,
  removeSignupMessage,
  removeLoginWithTokenMessage,
  removeUpdateUserError,
  removeVerifyUserError,
  removeForgotPasswordMessage,
  removeResetPasswordError,
} = authSlice.actions;

export const getUser = (state) => state.auth.data;
export const getUserName = (state) => state.auth.data?.name;
export const getUserEmail = (state) => state.auth.data?.email;
export const getUserID = (state) => state.auth.data?.id;
export const getUserRole = (state) => state.auth.data?.role;

export const getAccessToken = (state) => state.auth.accessToken;

export const getLoginStatus = (state) => state.auth.loginStatus;
export const getLoginError = (state) => state.auth.loginError;

export const getsignupStatus = (state) => state.auth.signupStatus;
export const getsignupError = (state) => state.auth.signupError;

export const getLoginWithTokenStatus = (state) =>
  state.auth.loginWithTokenStatus;
export const getLoginWithTokenError = (state) => state.auth.loginWithTokeEerror;

export const getForgotPasswordStatus = (state) =>
  state.auth.forgotPasswordStatus;
export const getForgotPasswordError = (state) => state.auth.forgotPasswordError;

export const getResetPasswordStatus = (state) => state.auth.resetPasswordStatus;
export const getResetPasswordError = (state) => state.auth.resetPasswordError;

export const getUserVerifyStatus = (state) => state.auth.verifyStatus;
export const getUserVerifyError = (state) => state.auth.verifyError;

export const getUserUpdateStatus = (state) => state.auth.updateStatus;
export const getUserUpdateError = (state) => state.auth.updateError;

export default authSlice.reducer;
