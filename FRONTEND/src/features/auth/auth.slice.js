import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    error: null,
    github: { connected: false, username: null },
  },
  reducers: {
    setUser : (state, action)  => {
      state.user = action.payload;
    },
    setLoading : (state, action) => {
      state.loading = action.payload;
    },
    setError : (state, action) => {
      state.error = action.payload;
    },
    setGithubStatus : (state, action) => {
      state.github = action.payload;
    },
  },
});

export const { setUser, setLoading, setError, setGithubStatus } = authSlice.actions;

export default authSlice.reducer;