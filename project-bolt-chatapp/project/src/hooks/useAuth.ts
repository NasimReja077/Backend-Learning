import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      dispatch(loginStart());
      // Add your login logic here
      // const response = await loginAPI(credentials);
      // dispatch(loginSuccess(response.data));
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    login,
    logout: handleLogout,
  };
}